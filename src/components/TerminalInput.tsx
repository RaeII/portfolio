import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  onSubmit: (input: string) => void;
  onHistoryNav: (dir: "up" | "down") => string;
  getAutocomplete: (partial: string) => string[];
}

export function TerminalInput({ onSubmit, onHistoryNav, getAutocomplete }: Props) {
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (value.trim()) {
          onSubmit(value);
          setValue("");
          setSuggestion("");
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const completions = getAutocomplete(value);
        if (completions.length === 1) {
          setValue(completions[0]);
          setSuggestion("");
        } else if (completions.length > 1) {
          setSuggestion(completions.join(" | "));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = onHistoryNav("up");
        if (prev !== undefined) setValue(prev);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = onHistoryNav("down");
        setValue(next || "");
      }
    },
    [value, onSubmit, onHistoryNav, getAutocomplete]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);

      if (v.length > 0) {
        const completions = getAutocomplete(v);
        if (completions.length === 1 && completions[0] !== v) {
          setSuggestion(completions[0]);
        } else {
          setSuggestion("");
        }
      } else {
        setSuggestion("");
      }
    },
    [getAutocomplete]
  );

  // Global click to focus
  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="bg-terminal-bg border-t border-border px-3 sm:px-4 py-3">
      {suggestion && (
        <div className="text-terminal-dim text-xs mb-1 font-mono">
          TAB → {suggestion}
        </div>
      )}
      <div className="flex items-center gap-0 font-mono text-xs sm:text-sm">
        <span className="text-terminal-prompt font-bold shrink-0">israel@portfolio:~$</span>
        <div className="relative flex-1 ml-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-foreground outline-none caret-transparent font-mono text-xs sm:text-sm"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal input"
          />
          {/* Custom cursor */}
          <span
            className="absolute top-0 left-0 pointer-events-none font-mono text-xs sm:text-sm text-transparent"
            aria-hidden
          >
            {value}
            <span className="text-terminal-cursor animate-blink">█</span>
          </span>
        </div>
      </div>
    </div>
  );
}
