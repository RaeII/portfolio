import { useReducer, useCallback, useEffect, useRef, useState } from "react";
import { TerminalHeader } from "./TerminalHeader";
import { TerminalHistory } from "./TerminalHistory";
import { TerminalInput } from "./TerminalInput";
import { CommandChips } from "./CommandChips";
import { ProjectModal } from "./ProjectModal";
import { WELCOME_BANNER, commands, getAutocomplete, type ThemeName } from "@/lib/commands/handlers";
import { parseCommand } from "@/lib/commands/parser";
import { projects } from "@/data/projects";

export interface HistoryEntry {
  type: "input" | "output";
  content: string | React.ReactNode;
  timestamp: number;
}

interface TerminalState {
  history: HistoryEntry[];
  inputHistory: string[];
  historyIndex: number;
  theme: ThemeName;
}

type Action =
  | { type: "ADD_INPUT"; content: string }
  | { type: "ADD_OUTPUT"; content: string | React.ReactNode }
  | { type: "CLEAR" }
  | { type: "SET_THEME"; theme: ThemeName }
  | { type: "SET_HISTORY_INDEX"; index: number };

function reducer(state: TerminalState, action: Action): TerminalState {
  switch (action.type) {
    case "ADD_INPUT":
      return {
        ...state,
        history: [...state.history, { type: "input", content: action.content, timestamp: Date.now() }],
        inputHistory: [...state.inputHistory, action.content],
        historyIndex: -1,
      };
    case "ADD_OUTPUT":
      return {
        ...state,
        history: [...state.history, { type: "output", content: action.content, timestamp: Date.now() }],
      };
    case "CLEAR":
      return { ...state, history: [] };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "SET_HISTORY_INDEX":
      return { ...state, historyIndex: action.index };
    default:
      return state;
  }
}

function getInitialState(): TerminalState {
  const savedTheme = localStorage.getItem("terminal-theme") as ThemeName | null;
  return {
    history: [{ type: "output", content: WELCOME_BANNER, timestamp: Date.now() }],
    inputHistory: [],
    historyIndex: -1,
    theme: savedTheme || "neon",
  };
}

export function Terminal({ embedded = false }: { embedded?: boolean }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [openProjectSlug, setOpenProjectSlug] = useState<string | null>(null);
  const [showCase, setShowCase] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnchor = useRef<number>(0);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-mono", "theme-retro");
    if (state.theme !== "neon") {
      root.classList.add(`theme-${state.theme}`);
    }
    localStorage.setItem("terminal-theme", state.theme);
  }, [state.theme]);

  // Scroll suave customizado com duração controlada
  useEffect(() => {
    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const { scrollHeight, clientHeight } = el;
      const target = scrollHeight <= clientHeight ? 0 : scrollAnchor.current;
      const start = el.scrollTop;
      const diff = target - start;
      if (Math.abs(diff) < 1) return;

      const duration = 600; // ms — quanto maior, mais lento
      let startTime: number | null = null;

      const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        el.scrollTop = start + diff * ease(progress);
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  }, [state.history]);

  const handleCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Salva posição atual do scroll + offset maior para rolar mais para baixo no comando
    if (scrollRef.current) {
      scrollAnchor.current = scrollRef.current.scrollTop + 250;
    }

    dispatch({ type: "ADD_INPUT", content: trimmed });

    const parsed = parseCommand(trimmed);
    if (!parsed.command) return;

    const cmd = commands.find(c => c.name === parsed.command);
    if (!cmd) {
      dispatch({
        type: "ADD_OUTPUT",
        content: `Comando não encontrado: "${parsed.command}"\nDigite "help" para ver os comandos disponíveis.`,
      });
      return;
    }

    const ctx = {
      setTheme: (t: ThemeName) => dispatch({ type: "SET_THEME", theme: t }),
      clearHistory: () => dispatch({ type: "CLEAR" }),
      addOutput: (content: string | React.ReactNode) => dispatch({ type: "ADD_OUTPUT", content }),
      openProject: (slug: string, cs?: boolean) => {
        const project = projects.find(p => p.slug === slug);
        if (project) {
          setOpenProjectSlug(slug);
          setShowCase(cs || false);
        } else {
          dispatch({
            type: "ADD_OUTPUT",
            content: `Projeto "${slug}" não encontrado.\nProjetos: ${projects.map(p => p.slug).join(", ")}`,
          });
        }
      },
    };

    const result = cmd.run(parsed, ctx);
    if (result) {
      if (typeof result === "string" && result.length > 0) {
        dispatch({ type: "ADD_OUTPUT", content: result });
      } else if (typeof result !== "string") {
        dispatch({ type: "ADD_OUTPUT", content: result });
      }
    }
  }, []);

  const handleHistoryNav = useCallback((direction: "up" | "down") => {
    const { inputHistory, historyIndex } = state;
    if (inputHistory.length === 0) return "";

    let newIndex: number;
    if (direction === "up") {
      newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1);
    } else {
      newIndex = historyIndex === -1 ? -1 : historyIndex + 1;
      if (newIndex >= inputHistory.length) newIndex = -1;
    }

    dispatch({ type: "SET_HISTORY_INDEX", index: newIndex });
    return newIndex === -1 ? "" : inputHistory[newIndex];
  }, [state.inputHistory, state.historyIndex]);

  const suggestedCommands = ["help", "about", "projects", "skills", "contact", "resume"];

  const selectedProject = openProjectSlug ? projects.find(p => p.slug === openProjectSlug) : null;

  return (
    <div className={embedded ? "w-full h-full" : "flex items-center justify-center min-h-screen bg-background p-2 sm:p-4 md:p-8"}>
      <div className={embedded ? "w-full h-full flex flex-col overflow-hidden bg-terminal-bg" : "w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col rounded-lg overflow-hidden border border-border shadow-2xl shadow-primary/10"}>
        <TerminalHeader theme={state.theme} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-terminal-bg p-3 sm:p-4 font-mono text-xs sm:text-sm">
          {!embedded && <div className="crt-scanlines fixed inset-0 pointer-events-none z-50" />}
          <TerminalHistory entries={state.history} />
          <CommandChips commands={suggestedCommands} onCommand={handleCommand} />
        </div>
        <TerminalInput
          onSubmit={handleCommand}
          onHistoryNav={handleHistoryNav}
          getAutocomplete={getAutocomplete}
        />
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          showCase={showCase}
          onClose={() => setOpenProjectSlug(null)}
        />
      )}
    </div>
  );
}
