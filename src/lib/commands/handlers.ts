import type { ReactNode } from "react";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import type { ParsedCommand } from "./parser";

export type TerminalOutput = {
  type: "input" | "output";
  content: string | React.ReactNode;
  timestamp: number;
};

export type ThemeName = "neon" | "mono" | "retro";

export interface CommandDef {
  name: string;
  description: string;
  usage: string;
  run: (parsed: ParsedCommand, ctx: CommandContext) => string | React.ReactNode;
}

export interface CommandContext {
  setTheme: (t: ThemeName) => void;
  clearHistory: () => void;
  addOutput: (content: string | React.ReactNode) => void;
  openProject: (slug: string, showCase?: boolean) => void;
}

const BANNER = `
╔══════════════════════════════════════════════════╗
║                                                  ║
║   ██╗███████╗██████╗  █████╗ ███████╗██╗         ║
║   ██║██╔════╝██╔══██╗██╔══██╗██╔════╝██║         ║
║   ██║███████╗██████╔╝███████║█████╗  ██║         ║
║   ██║╚════██║██╔══██╗██╔══██║██╔══╝  ██║         ║
║   ██║███████║██║  ██║██║  ██║███████╗███████╗    ║
║   ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝    ║
║                                                  ║
║   Software Engineer · Fullstack · Web3           ║
║                                                  ║
╚══════════════════════════════════════════════════╝

  Bem-vindo!
  Digite "help" para ver os comandos disponíveis.
`;

function formatProjectCard(p: typeof projects[0]): string {
  const W = 52;
  const titleText = `─ ${p.title} (${p.year}) `;
  const topDashes = Math.max(1, W - titleText.length);

  const lines: string[] = [
    ` ${p.oneLiner}`,
    ` Stack: ${p.stack.slice(0, 4).join(", ")}`,
  ];

  if (p.links.live || p.links.github) {
    const links = [p.links.github ? "GitHub" : "", p.links.live ? "Live" : ""].filter(Boolean).join(" | ");
    lines.push(` Links: ${links}`);
  }

  lines.push(` Tags: ${p.tags.map(t => `[${t}]`).join(" ")}`);

  let card = `┌${titleText}${"─".repeat(topDashes)}┐\n`;
  for (const line of lines) {
    card += `│${line.padEnd(W)}│\n`;
  }
  card += `└${"─".repeat(W)}┘`;

  return card;
}

function formatSkillLevel(level: string): string {
  const bars: Record<string, string> = {
    "Avançado": "██████████",
    "Intermediário": "███████░░░",
    "Básico": "██████░░░░",
  };
  return bars[level] || "██████░░░░";
}

export const commands: CommandDef[] = [
  {
    name: "help",
    description: "Lista todos os comandos disponíveis",
    usage: "help",
    run: () => {
      const cmds = commands.map(c => `  ${c.name.padEnd(20)} ${c.description}`).join("\n");
      return `Comandos disponíveis:\n\n${cmds}\n\nDica: use --help em qualquer comando para mais info.\nEx: projects --tag web3 | skills --group frontend`;
    },
  },
  {
    name: "clear",
    description: "Limpa o histórico do terminal",
    usage: "clear",
    run: (_p, ctx) => {
      ctx.clearHistory();
      return "";
    },
  },
  {
    name: "about",
    description: "Sobre mim – bio, foco e stack",
    usage: "about",
    run: () => {
      return `┌─ israel.zeferino ────────────────────────────┐
│                                              │
│  Software Engineer com experiência no        │
│  desenvolvimento de sistemas web             │
│  corporativos utilizando PHP, Node.js,       │
│  NestJS, React.js, TypeScript e Web3.        │
│                                              │
│  Atuação de ponta a ponta no ciclo de        │
│  desenvolvimento: análise de requisitos,     │
│  arquitetura, APIs, deploy e manutenção      │
│  de aplicações em produção.                  │
│                                              │
│  🏆 Campeão ETHSamba Hack 2024               │
│  🏆 Campeão HackaNation 2025                 │
│                                              │
│  Perfil autodidata, com autonomia técnica    │
│  e participação ativa em decisões de         │
│  engenharia.                                 │
│                                              │
│  📍 Santa Catarina, Brasil                   │
│  📧 israel.zeferino@hotmail.com              │
│  🔗 github.com/RaeII                         │
│  💼 linkedin.com/in/dev-israel-zeferino      │
│                                              │
└──────────────────────────────────────────────┘`;
    },
  },
  {
    name: "skills",
    description: "Skills agrupadas com nível",
    usage: "skills [--group <nome>]",
    run: (parsed) => {
      const groupFilter = parsed.flags.group as string | undefined;
      const filtered = groupFilter
        ? skillGroups.filter(g => g.group.toLowerCase().includes(groupFilter.toLowerCase()))
        : skillGroups;

      if (filtered.length === 0) {
        return `Grupo "${groupFilter}" não encontrado. Grupos: ${skillGroups.map(g => g.group).join(", ")}`;
      }

      return filtered.map(g => {
        const header = `\n── ${g.group} ${"─".repeat(Math.max(0, 40 - g.group.length))}`;
        const skills = g.skills.map(s =>
          `  ${s.name.padEnd(16)} ${formatSkillLevel(s.level)} ${s.level}\n${"".padEnd(17)}↳ ${s.proof}`
        ).join("\n");
        return `${header}\n${skills}`;
      }).join("\n");
    },
  },
  {
    name: "projects",
    description: "Lista de projetos (use --tag, --year, --featured)",
    usage: "projects [--tag <tag>] [--year <ano>] [--featured]",
    run: (parsed) => {
      let filtered = [...projects];

      if (parsed.flags.tag) {
        filtered = filtered.filter(p => p.tags.includes(parsed.flags.tag as string));
      }
      if (parsed.flags.year) {
        filtered = filtered.filter(p => p.year === Number(parsed.flags.year));
      }
      if (parsed.flags.featured) {
        filtered = filtered.filter(p => p.featured);
      }

      if (filtered.length === 0) {
        return "Nenhum projeto encontrado com esses filtros. Tente: projects --featured";
      }

      const cards = filtered.map(p => formatProjectCard(p)).join("\n\n");
      return `${filtered.length} projeto(s) encontrado(s):\n\n${cards}\n\n→ Use "open <slug>" para mais detalhes.\n  Slugs: ${filtered.map(p => p.slug).join(", ")}`;
    },
  },
  {
    name: "open",
    description: "Abre detalhes de um projeto",
    usage: "open <slug> [--case]",
    run: (parsed, ctx) => {
      const slug = parsed.args[0];
      if (!slug) {
        return `Uso: open <slug>\nProjetos: ${projects.map(p => p.slug).join(", ")}`;
      }
      const showCase = parsed.flags.case === true;
      ctx.openProject(slug, showCase);
      return "";
    },
  },
  {
    name: "contact",
    description: "Informações de contato",
    usage: "contact [--copy email]",
    run: (parsed) => {
      const copyFlag = parsed.flags.copy;
      if (copyFlag === "email") {
        navigator.clipboard?.writeText("israel.zeferino@hotmail.com");
        return "📋 Email copiado: israel.zeferino@hotmail.com";
      }
      return `┌─ Contato ────────────────────────────────────────────┐
│                                                      │
│  📧 israel.zeferino@hotmail.com                      │
│  📱 (48) 9 9857-4630                                 │
│  🔗 github.com/RaeII                                 │
│  💼 linkedin.com/in/dev-israel-zeferino              │
│  📍 Santa Catarina, Brasil                           │
│                                                      │
│  → contact --copy email  para copiar email           │
│                                                      │
└──────────────────────────────────────────────────────┘`;
    },
  },
  {
    name: "resume",
    description: "Resumo profissional + download do currículo",
    usage: "resume",
    run: () => {
      return `┌─ Currículo ──────────────────────────────────┐
│                                              │
│  Israel da Silva Zeferino                    │
│  Software Engineer · 4+ anos                 │
│                                              │
│  Experiência:                                │
│  ├─ Software Engineer @ Monkey Branch        │
│  │  Jun/2022 – Presente (4 anos)             │
│  └─ Estágio @ Seja Prime                     │
│     Jan/2022 – Mai/2022                      │
│                                              │
│  Reconhecimentos:                            │
│  🏆 Campeão ETHSamba Hack 2024               │
│  🏆 Campeão HackaNation 2025                 │
│                                              │
│  [↓ DOWNLOAD PDF]                            │
│  → /israel_zeferino_dev.pdf                  │
│                                              │
└──────────────────────────────────────────────┘`;
    },
  },
  {
    name: "theme",
    description: "Troca o tema (neon | mono | retro)",
    usage: "theme <neon|mono|retro>",
    run: (parsed, ctx) => {
      const name = parsed.args[0] as ThemeName;
      const valid: ThemeName[] = ["neon", "mono", "retro"];
      if (!name || !valid.includes(name)) {
        return `Temas disponíveis: ${valid.join(", ")}\nUso: theme neon`;
      }
      ctx.setTheme(name);
      return `✓ Tema alterado para "${name}"`;
    },
  },
  {
    name: "whoami",
    description: "Quem sou eu?",
    usage: "whoami",
    run: () => "israel.zeferino – Software Engineer, cafeinado, builder de hackathons 🏆☕",
  },
  {
    name: "ls",
    description: "Lista diretórios do portfólio",
    usage: "ls",
    run: () => `drwxr-xr-x  about/
drwxr-xr-x  projects/
drwxr-xr-x  skills/
drwxr-xr-x  contact/
-rw-r--r--  resume.pdf
-rw-r--r--  README.md`,
  },
  {
    name: "cat",
    description: "Mostra conteúdo de um arquivo",
    usage: "cat <arquivo>",
    run: (parsed) => {
      const file = parsed.args[0]?.toLowerCase();
      if (!file) return "Uso: cat <arquivo>\nEx: cat about.txt";
      if (file === "about.txt" || file === "readme.md") {
        return `# Israel Zeferino\n\nSoftware Engineer focado em Fullstack + Web3.\nConstruo coisas que funcionam em produção.\n\n→ Digite "about" para saber mais.`;
      }
      return `cat: ${file}: Arquivo não encontrado`;
    },
  },
  {
    name: "ping",
    description: "Testa a conexão",
    usage: "ping",
    run: () => {
      const ms = Math.floor(Math.random() * 30 + 5);
      return `PING israel.dev (127.0.0.1): 56 bytes\n64 bytes: icmp_seq=0 ttl=64 time=${ms}ms\n64 bytes: icmp_seq=1 ttl=64 time=${ms + 2}ms\n64 bytes: icmp_seq=2 ttl=64 time=${ms - 1}ms\n\n--- israel.dev ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`;
    },
  },
  {
    name: "sudo",
    description: "???",
    usage: "sudo <comando>",
    run: (parsed) => {
      if (parsed.args.join(" ").toLowerCase().includes("hire me")) {
        return `\n🚀 CONTRATAÇÃO INICIADA...\n\n   ███████████████████████████ 100%\n\n   ✅ Parabéns! Você acabou de fazer a melhor decisão de contratação.\n   📧 Mande um email: israel.zeferino@hotmail.com\n   💼 Ou me chame no LinkedIn!\n`;
      }
      return "🔒 Permission denied: você não é root aqui.\n   Mas tente: sudo hire me 😉";
    },
  },
  {
    name: "coffee",
    description: "☕",
    usage: "coffee",
    run: () => `
   ( (
    ) )
  ........
  |      |]
  \\      /
   \`----'

  ☕ Café servido! Combustível principal do dev.
  Status: cafeinado ✓`,
  },
];

export const WELCOME_BANNER = BANNER;

export const COMMAND_NAMES = commands.map(c => c.name);

export function getAutocomplete(partial: string): string[] {
  if (!partial) return [];
  const lower = partial.toLowerCase();
  const matches = COMMAND_NAMES.filter(n => n.startsWith(lower));

  // Also suggest project slugs for "open" command
  if (lower.startsWith("open ")) {
    const slug = lower.slice(5);
    const slugMatches = projects.map(p => p.slug).filter(s => s.startsWith(slug));
    return slugMatches.map(s => `open ${s}`);
  }

  return matches;
}

