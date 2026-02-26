# Terminal — Arquitetura e Funcionamento

> Documentação técnica do terminal interativo do portfólio. Referência rápida para manutenção e atualização de comandos.

---

## Visão Geral

O portfólio funciona como um terminal interativo. O usuário digita comandos (ou clica em **CommandChips**) e recebe respostas textuais ou visuais (modais, botões). Tudo roda no browser com React + Vite + TailwindCSS.

---

## Arquitetura de Arquivos

```
src/
├── components/
│   ├── Terminal.tsx          # Componente principal — state, reducer, handleCommand
│   ├── TerminalHeader.tsx    # Barra de título (bolinhas macOS + tema)
│   ├── TerminalHistory.tsx   # Renderiza histórico (inputs + outputs)
│   ├── TerminalInput.tsx     # Prompt interativo + cursor + autocomplete
│   ├── CommandChips.tsx      # Botões de atalho (help, about, projects…)
│   └── ProjectModal.tsx      # Modal de detalhes do projeto
├── lib/commands/
│   ├── handlers.ts           # Definição dos comandos + run() de cada um
│   └── parser.ts             # Transforma string digitada em ParsedCommand
└── data/
    ├── projects.ts           # Array de projetos (slugs, stack, links…)
    └── skills.ts             # Skills agrupadas por categoria
```

---

## Fluxo de um Comando

```
Usuário digita → TerminalInput.tsx
                      │
                      ▼
              Terminal.tsx → handleCommand()
                      │
                      ├─ dispatch(ADD_INPUT)       → salva no histórico
                      │
                      ├─ parseCommand(input)       → parser.ts
                      │       retorna { command, args, flags }
                      │
                      ├─ Busca em commands[]        → handlers.ts
                      │
                      ├─ cmd.run(parsed, ctx)       → executa o comando
                      │
                      └─ dispatch(ADD_OUTPUT)       → resultado no histórico
                                │
                                ▼
                      TerminalHistory.tsx → renderiza
```

---

## Estado do Terminal (`Terminal.tsx`)

Gerenciado por `useReducer`. Estado:

| Campo          | Tipo                      | Descrição                          |
|----------------|---------------------------|------------------------------------|
| `history`      | `HistoryEntry[]`          | Entradas e saídas do terminal      |
| `inputHistory` | `string[]`                | Comandos já digitados (setas ↑↓)   |
| `historyIndex` | `number`                  | Posição na navegação do histórico  |
| `theme`        | `ThemeName`               | Tema ativo (`neon`, `mono`, `retro`) |

### HistoryEntry

```typescript
interface HistoryEntry {
  type: "input" | "output";
  content: string | React.ReactNode;  // Aceita texto OU componentes React
  timestamp: number;
}
```

O `content` suporta **ReactNode** para que comandos possam retornar componentes clicáveis (ex: botões de projetos no comando `projects`).

### Actions do Reducer

| Action              | Payload                          | Efeito                         |
|---------------------|----------------------------------|--------------------------------|
| `ADD_INPUT`         | `content: string`                | Adiciona input ao histórico    |
| `ADD_OUTPUT`        | `content: string \| ReactNode`   | Adiciona output ao histórico   |
| `CLEAR`             | —                                | Limpa todo o histórico         |
| `SET_THEME`         | `theme: ThemeName`               | Altera tema visual             |
| `SET_HISTORY_INDEX` | `index: number`                  | Navega pelo histórico de inputs|

### handleCommand()

Monta o `CommandContext` e executa `cmd.run(parsed, ctx)`. Se o resultado for:
- **string não-vazia** → `dispatch(ADD_OUTPUT)`
- **ReactNode** → `dispatch(ADD_OUTPUT)` direto (ex: botões do `projects`)
- **string vazia** → não adiciona nada (ex: `clear`, `open`)

### CommandContext (ctx)

Objeto passado ao `run()` de cada comando:

```typescript
interface CommandContext {
  setTheme: (t: ThemeName) => void;     // Altera tema
  clearHistory: () => void;              // Limpa terminal
  addOutput: (content: string | ReactNode) => void;  // Adiciona output extra
  openProject: (slug: string, showCase?: boolean) => void;  // Abre modal
}
```

---

## Parser (`parser.ts`)

Transforma a string digitada em:

```typescript
interface ParsedCommand {
  command: string;                          // Primeiro token, lowercase
  args: string[];                           // Tokens sem --
  flags: Record<string, string | boolean>;  // Tokens com --
}
```

**Regras:**
- Tokens separados por espaço
- Aspas (`"` ou `'`) preservam espaços internos
- `--flag valor` → `{ flag: "valor" }`
- `--flag` (sem valor) → `{ flag: true }`

---

## Componentes

### TerminalHistory.tsx

Renderiza o array `history[]`. Para cada entrada:
- **input** → exibe com prompt `israel@portfolio:~$`
- **output string** → passa por `processOutput()` (linkifica URLs, PDF download)
- **output ReactNode** → renderiza direto em `<div>` (ex: botões de projetos)

A função `processOutput()` faz:
- `[↓ DOWNLOAD PDF]` → link clicável para o PDF
- URLs (`github.com`, `linkedin.com`, `http*`) → links clicáveis

### TerminalInput.tsx

Prompt interativo com:
- **Enter** → submete comando
- **Tab** → autocomplete (1 match = preenche, múltiplos = mostra opções)
- **Seta ↑/↓** → navega histórico
- Cursor animado customizado (`█`)
- Foco automático em mount e click global

### CommandChips.tsx

Botões de atalho renderizados abaixo do histórico. Mesma animação (fade + scale via Framer Motion). Ao clicar, executa `handleCommand(cmd)`.

**Comandos sugeridos:** `help`, `about`, `projects`, `skills`, `contact`, `resume`

**Classe CSS dos chips:**
```
px-3 py-1 text-xs font-mono rounded border border-border bg-secondary
text-secondary-foreground hover:bg-primary hover:text-primary-foreground
transition-all duration-200 hover:terminal-glow cursor-pointer
```

> O comando `projects` reutiliza essa mesma classe nos botões de `open <slug>` que aparecem no final da listagem.

### TerminalHeader.tsx

Barra de título com bolinhas macOS (🔴🟡🟢), path `israel@portfolio:~`, tema ativo e versão.

### ProjectModal.tsx

Modal animado (Framer Motion) com:
- Título, ano, one-liner, descrição, stack (badges), highlights, tags, links
- **Case Study** (só se `--case` for passado e o projeto tiver `caseStudy`)
- Fecha com ESC, clique no X, ou clique no backdrop

---

## Handlers — Comandos Registrados (`handlers.ts`)

Cada comando segue a interface:

```typescript
interface CommandDef {
  name: string;
  description: string;
  usage: string;
  run: (parsed: ParsedCommand, ctx: CommandContext) => string | ReactNode;
}
```

### Tabela rápida de comandos

| Comando   | Uso                                     | Retorno          | Descrição                                |
|-----------|-----------------------------------------|------------------|------------------------------------------|
| `help`    | `help`                                  | string           | Lista todos os comandos                  |
| `clear`   | `clear`                                 | string vazia     | Limpa histórico via `ctx.clearHistory()` |
| `about`   | `about`                                 | string           | Bio pessoal em card ASCII                |
| `skills`  | `skills [--group <nome>]`               | string           | Skills por grupo com barras visuais      |
| `projects`| `projects [--tag] [--year] [--featured]`| **ReactNode**    | Cards + botões `open <slug>` clicáveis   |
| `open`    | `open <slug> [--case]`                  | string vazia     | Abre `ProjectModal` via `ctx.openProject`|
| `contact` | `contact [--copy email]`                | string           | Card de contato; `--copy email` copia    |
| `resume`  | `resume`                                | string           | Currículo + link download PDF            |
| `theme`   | `theme <neon\|mono\|retro>`             | string           | Troca tema via `ctx.setTheme()`          |
| `whoami`  | `whoami`                                | string           | Easter egg de identidade                 |
| `ls`      | `ls`                                    | string           | Listagem fictícia de diretórios          |
| `cat`     | `cat <arquivo>`                         | string           | Conteúdo de `about.txt` / `readme.md`    |
| `ping`    | `ping`                                  | string           | Ping fictício com latência aleatória     |
| `sudo`    | `sudo <comando>`                        | string           | Easter egg — `sudo hire me` 🚀           |
| `coffee`  | `coffee`                                | string           | Easter egg — ASCII de café ☕             |

### Projetos Cadastrados (`data/projects.ts`)

| Slug            | Título                    | Ano  | Destaque |
|-----------------|---------------------------|------|----------|
| `monkey-branch` | Monkey Branch             | 2022 | ✅        |
| `discord-bots`  | Discord Bots & Automações | 2023 | ❌        |
| `mobile-apps`   | Apps Mobile – React Native| 2023 | ❌        |
| `valocracia`    | Valocracia                | 2024 | ✅        |
| `hackanation`   | HackaNation 2025          | 2025 | ✅        |

---

## Como adicionar um novo comando

1. Abra `src/lib/commands/handlers.ts`
2. Adicione um objeto ao array `commands[]`:

```typescript
{
  name: "meucomando",
  description: "Descrição curta para o help",
  usage: "meucomando [--flag <valor>]",
  run: (parsed, ctx) => {
    // parsed.args → argumentos posicionais
    // parsed.flags → flags --nome valor
    // ctx → setTheme, clearHistory, addOutput, openProject
    return "Resultado em texto";
    // Ou retorne React.createElement(...) para ReactNode
  },
},
```

3. O comando já aparece no `help` automaticamente
4. Para adicionar ao autocomplete de slugs ou nomes, edite `getAutocomplete()` no final de `handlers.ts`

### Para retornar botões clicáveis (ReactNode)

Use `React.createElement` (já importado como `import React`):

```typescript
run: (parsed, ctx) => {
  return React.createElement("div", null,
    React.createElement("pre", { className: "whitespace-pre-wrap break-words" }, "Texto"),
    React.createElement("div", { className: "flex flex-wrap gap-2 mt-3" },
      React.createElement("button", {
        onClick: () => { /* ação */ },
        className: "px-3 py-1 text-xs font-mono rounded border border-border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:terminal-glow cursor-pointer"
      }, "Texto do botão")
    )
  );
},
```

---

## Persistência

| Chave             | Valor                     | Padrão  |
|-------------------|---------------------------|---------|
| `terminal-theme`  | Tema selecionado          | `neon`  |

---

## Autocomplete (`getAutocomplete`)

- Para texto parcial: filtra `COMMAND_NAMES` que começam com o digitado
- Caso especial: se começa com `"open "`, sugere **slugs de projetos** em vez de nomes de comando

---

## Temas

Aplicados como classe no `<html>`:
- `neon` → padrão (sem classe extra)
- `mono` → classe `theme-mono`
- `retro` → classe `theme-retro`

As variáveis CSS de cada tema estão definidas em `src/index.css`.
