# Comandos do Terminal — Referência Completa

> Documentação técnica de todos os comandos disponíveis no terminal interativo do **portfolio**.

---

## 📐 Arquitetura Geral: Como um comando é processado

Antes de detalhar cada comando, é importante entender o fluxo completo que acontece desde a digitação até a resposta na tela.

### 1. Entrada do Usuário (`TerminalInput.tsx`)

O componente `TerminalInput` é a barra de prompt na parte inferior do terminal, exibida como:

```
israel@portfolio:~$ █
```

Ele captura a digitação do usuário e intercepta os seguintes eventos de teclado:

| Tecla          | Ação                                                                 |
|----------------|----------------------------------------------------------------------|
| `Enter`        | Submete o texto digitado para processamento via `handleCommand()`    |
| `Tab`          | Aciona o autocomplete — preenche o comando se há uma única sugestão ou lista múltiplas opções |
| `Seta ↑`       | Navega para o comando anterior no histórico de inputs                |
| `Seta ↓`       | Navega para o próximo comando no histórico de inputs                 |

### 2. Parser (`src/lib/commands/parser.ts`)

A string digitada é enviada à função `parseCommand()`, que retorna um objeto `ParsedCommand`:

```typescript
interface ParsedCommand {
  command: string;      // Nome do comando (lowercase)
  args: string[];       // Argumentos posicionais (ex: o slug em "open valocracia")
  flags: Record<string, string | boolean>; // Flags nomeadas (ex: --tag web3)
}
```

**Regras de parsing:**
- Tokens são separados por espaço.
- Strings entre aspas simples (`'`) ou duplas (`"`) são preservadas como token único (ignora espaços internos).
- O primeiro token se torna o `command` (sempre convertido para lowercase).
- Tokens que começam com `--` são tratados como **flags**:
  - Se o token seguinte **não** começa com `--`, ele é usado como **valor** da flag (ex: `--tag web3` → `{ tag: "web3" }`).
  - Se não há valor depois, a flag é marcada como `true` (ex: `--featured` → `{ featured: true }`).
- Todos os outros tokens viram **args** posicionais.

**Exemplos de parsing:**

| Input                          | command      | args             | flags                         |
|--------------------------------|--------------|------------------|-------------------------------|
| `help`                         | `"help"`     | `[]`             | `{}`                          |
| `open valocracia`              | `"open"`     | `["valocracia"]` | `{}`                          |
| `open valocracia --case`       | `"open"`     | `["valocracia"]` | `{ case: true }`              |
| `projects --tag web3`          | `"projects"` | `[]`             | `{ tag: "web3" }`             |
| `projects --tag web3 --year 2024` | `"projects"` | `[]`          | `{ tag: "web3", year: "2024" }` |
| `skills --group frontend`     | `"skills"`   | `[]`             | `{ group: "frontend" }`       |
| `theme neon`                   | `"theme"`    | `["neon"]`       | `{}`                          |
| `cat about.txt`                | `"cat"`      | `["about.txt"]`  | `{}`                          |
| `sudo hire me`                 | `"sudo"`     | `["hire", "me"]` | `{}`                          |

### 3. Handler (`src/lib/commands/handlers.ts`)

O `ParsedCommand` é comparado contra o array `commands[]`. Cada comando é definido pela interface:

```typescript
interface CommandDef {
  name: string;                              // Nome para match
  description: string;                       // Descrição exibida no "help"
  usage: string;                             // Sintaxe de uso
  run: (parsed: ParsedCommand, ctx: CommandContext) => string | ReactNode;
}
```

O `CommandContext` (ctx) é um objeto que permite ao handler interagir com o estado do terminal:

| Método/Prop         | Tipo                                              | Descrição                                          |
|----------------------|---------------------------------------------------|----------------------------------------------------|
| `setTheme(t)`        | `(t: ThemeName) => void`                          | Altera o tema visual (`neon`, `mono`, `retro`)     |
| `setMode(m)`         | `(m: ModeName) => void`                           | Altera o modo de conteúdo (`dev`, `recruiter`)     |
| `mode`               | `ModeName`                                        | Modo atual da sessão                               |
| `clearHistory()`     | `() => void`                                      | Limpa todo o histórico de saída do terminal        |
| `addOutput(content)` | `(content: string \| ReactNode) => void`          | Adiciona uma linha de saída ao terminal            |
| `openProject(slug)`  | `(slug: string, showCase?: boolean) => void`      | Abre o modal de detalhes de um projeto             |

Se o comando **não é encontrado**, o terminal exibe:
```
Comando não encontrado: "<texto>"
Digite "help" para ver os comandos disponíveis.
```

### 4. Autocomplete (`getAutocomplete()`)

A função de autocomplete funciona em tempo real enquanto o usuário digita:

- Para qualquer texto parcial, filtra os nomes de comandos que começam com o texto digitado.
- Caso especial: se o texto começa com `"open "`, o autocomplete passa a sugerir **slugs de projetos** em vez de nomes de comando.

---

## 🧩 Referência dos Comandos

### `help`

| Campo      | Valor                                    |
|------------|------------------------------------------|
| **Uso**    | `help`                                   |
| **Descrição** | Lista todos os comandos disponíveis   |

**Comportamento:**
Exibe a lista completa de todos os comandos registrados no sistema, formatados como `nome` + `descrição`. Ao final, exibe uma dica sugerindo o uso de `--help` em qualquer comando e exemplos de filtros.

**Saída exemplo:**
```
Comandos disponíveis:

  help                 Lista todos os comandos disponíveis
  clear                Limpa o histórico do terminal
  about                Sobre mim – bio, foco e stack
  ...

Dica: use --help em qualquer comando para mais info.
Ex: projects --tag web3 | skills --group frontend
```

---

### `clear`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `clear`                                        |
| **Descrição** | Limpa o histórico do terminal               |

**Comportamento:**
Invoca `ctx.clearHistory()`, que dispara a action `CLEAR` no reducer do Terminal, zerando completamente o array `history[]`. A tela fica limpa, sem nenhuma entrada ou saída anterior. Retorna string vazia (não adiciona nova saída).

---

### `about`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `about`                                        |
| **Descrição** | Sobre mim – bio, foco e stack               |

**Comportamento:**
Exibe uma bio/resumo pessoal do Israel Zeferino. O conteúdo muda conforme o **modo ativo**:

- **Modo `dev` (padrão):** Exibe um card completo com box-drawing (┌─ ─┐), incluindo bio detalhada com experiência fullstack, menções de conquistas em hackathons, email, GitHub e localização.
- **Modo `recruiter`:** Exibe uma versão mais concisa e voltada ao recrutamento, com foco em anos de experiência, localização, disponibilidade e sugestões dos comandos `contact` e `resume`.

---

### `skills`

| Campo      | Valor                                                |
|------------|------------------------------------------------------|
| **Uso**    | `skills [--group <nome>]`                            |
| **Descrição** | Skills agrupadas com nível                        |

**Flags disponíveis:**

| Flag       | Tipo     | Descrição                                                          |
|------------|----------|--------------------------------------------------------------------|
| `--group`  | `string` | Filtra por nome do grupo (busca parcial, case-insensitive)         |

**Comportamento:**
Exibe as habilidades técnicas organizadas por grupo. Cada skill mostra uma barra de nível visual:

| Nível           | Barra visual       |
|-----------------|---------------------|
| Avançado        | `██████████`        |
| Intermediário   | `███████░░░`        |
| Básico          | `██████░░░░`        |

**Grupos disponíveis:** Frontend, Backend, Web3 / Blockchain, DevOps / Infra, Banco de Dados, Ferramentas.

**Diferença por modo:**
- **Modo `dev`:** Exibe uma linha extra abaixo de cada skill com a prova/contexto de uso (ex: `↳ 4+ anos em produção – Monkey Branch, Valocracia`).
- **Modo `recruiter`:** Omite as linhas de prova, exibindo apenas nome + barra + nível.

**Exemplos:**
```bash
skills                        # Lista todas as skills de todos os grupos
skills --group frontend       # Filtra somente o grupo "Frontend"
skills --group web3           # Filtra somente "Web3 / Blockchain"
```

Se o grupo informado não existir, retorna mensagem de erro listando os grupos válidos.

---

### `projects`

| Campo      | Valor                                                          |
|------------|----------------------------------------------------------------|
| **Uso**    | `projects [--tag <tag>] [--year <ano>] [--featured]`           |
| **Descrição** | Lista de projetos (use --tag, --year, --featured)           |

**Flags disponíveis:**

| Flag         | Tipo      | Descrição                                                |
|--------------|-----------|----------------------------------------------------------|
| `--tag`      | `string`  | Filtra projetos pela tag (ex: `web3`, `fullstack`)       |
| `--year`     | `string`  | Filtra projetos pelo ano (ex: `2024`)                    |
| `--featured` | `boolean` | Filtra apenas projetos marcados como destaque            |

**Comportamento:**
Exibe os projetos cadastrados em formato de "cards ASCII", contendo:
- Título e ano
- One-liner de descrição
- Stack (limitada a 4 tecnologias no card)
- Links (GitHub / Live) se disponíveis
- Tags (somente no modo `dev`; omitidas no modo `recruiter`)

Ao final, sugere o uso do comando `open <slug>` e lista os slugs disponíveis.

**Exemplos:**
```bash
projects                      # Lista todos os projetos
projects --featured           # Somente projetos em destaque
projects --tag web3           # Somente projetos com tag "web3"
projects --year 2024          # Somente projetos de 2024
projects --tag fullstack --year 2024  # Combinação de filtros
```

**Card de saída exemplo:**
```
┌─ Valocracia (2024) ─────────────────────┐
│ Plataforma Web3 de governança...        │
│ Stack: Next.js, TypeScript, Solidity... │
│ Links: Live                             │
│ Tags: [web3] [blockchain] [frontend]    │
└──────────────────────────────────────────┘
```

Se nenhum projeto é encontrado com os filtros, retorna: `Nenhum projeto encontrado com esses filtros. Tente: projects --featured`.

**Projetos atualmente cadastrados:**
| Slug            | Título                              | Ano  | Destaque |
|-----------------|-------------------------------------|------|----------|
| `valocracia`    | Valocracia                          | 2024 | ✅        |
| `hackanation`   | HackaNation Project                 | 2025 | ✅        |
| `monkey-branch` | Sistemas Corporativos – Monkey Branch | 2024 | ✅      |
| `discord-bots`  | Discord Bots & Automações           | 2023 | ❌        |
| `mobile-apps`   | Apps Mobile – React Native          | 2023 | ❌        |

---

### `open`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `open <slug> [--case]`                         |
| **Descrição** | Abre detalhes de um projeto                 |

**Argumentos:**

| Argumento  | Tipo     | Obrigatório | Descrição                                   |
|------------|----------|-------------|---------------------------------------------|
| `slug`     | `string` | Sim         | Identificador único do projeto              |

**Flags disponíveis:**

| Flag      | Tipo      | Descrição                                              |
|-----------|-----------|--------------------------------------------------------|
| `--case`  | `boolean` | Inclui a seção "Case Study" no modal (se disponível)   |

**Comportamento:**
Abre um **modal visual** (`ProjectModal.tsx`) com os detalhes completos do projeto selecionado. O modal exibe:
- Título e ano
- One-liner
- Descrição completa
- Stack (em badges)
- Highlights (lista com ▸)
- Tags
- Links (GitHub / Live) clicáveis
- **Case Study** (somente se `--case` for passado E o projeto tiver `caseStudy` definido)

O modal possui animação de entrada (fade + slide up) via Framer Motion e pode ser fechado clicando no botão vermelho (●), no backdrop ou pressionando ESC.

Se o slug não existir, exibe mensagem de erro com a lista de slugs válidos.

Sem slug: exibe uso correto e lista os slugs disponíveis.

**Exemplos:**
```bash
open valocracia              # Abre modal do Valocracia
open valocracia --case       # Abre modal com Case Study incluído
open monkey-branch           # Abre modal do Monkey Branch
```

---

### `contact`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `contact [--copy email]`                       |
| **Descrição** | Informações de contato                      |

**Flags disponíveis:**

| Flag      | Tipo     | Descrição                                                        |
|-----------|----------|------------------------------------------------------------------|
| `--copy`  | `string` | Se o valor for `"email"`, copia o endereço de email para a área de transferência |

**Comportamento:**
Exibe um card ASCII com todas as informações de contato:
- 📧 Email
- 📱 Telefone
- 🔗 GitHub
- 💼 LinkedIn
- 📍 Localização

Possui a funcionalidade de **copiar o email para a clipboard** via `navigator.clipboard.writeText()` quando usado com `--copy email`.

**Exemplos:**
```bash
contact                      # Exibe card de contato completo
contact --copy email         # Copia "israel.zeferino@hotmail.com" para o clipboard
```

---

### `resume`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `resume`                                       |
| **Descrição** | Resumo profissional + download do currículo |

**Comportamento:**
Exibe um card ASCII estilizado com o resumo profissional, incluindo:
- Nome completo
- Cargo e anos de experiência
- Histórico profissional (empresas, cargos e períodos)
- Reconhecimentos (hackathons vencidos)
- Link para download do currículo em PDF (`/israel_zeferino_dev.pdf`)

---

### `theme`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `theme <neon\|mono\|retro>`                    |
| **Descrição** | Troca o tema (neon \| mono \| retro)        |

**Argumentos:**

| Argumento  | Tipo       | Valores válidos         | Descrição                |
|------------|------------|-------------------------|--------------------------|
| `nome`     | `ThemeName`| `neon`, `mono`, `retro` | Nome do tema desejado    |

**Comportamento:**
Altera o tema visual do terminal. Internamente:
1. Chama `ctx.setTheme(name)` → dispara action `SET_THEME` no reducer.
2. O `useEffect` de tema no `Terminal.tsx` reage removendo classes CSS anteriores (`theme-mono`, `theme-retro`) do elemento `<html>` e aplicando a nova (exceto `neon`, que é o padrão sem classe).
3. Salva a preferência no `localStorage` como `"terminal-theme"` para persistência entre sessões.

Sem argumento ou com valor inválido: exibe os temas disponíveis e a sintaxe de uso.

**Exemplos:**
```bash
theme neon                   # Aplica tema neon (padrão)
theme mono                   # Aplica tema monocromático
theme retro                  # Aplica tema retro
```

---

### `mode`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `mode <dev\|recruiter>`                        |
| **Descrição** | Altera o modo de exibição (dev \| recruiter)|

**Argumentos:**

| Argumento  | Tipo       | Valores válidos       | Descrição                |
|------------|------------|-----------------------|--------------------------|
| `nome`     | `ModeName` | `dev`, `recruiter`    | Nome do modo desejado    |

**Comportamento:**
Altera como o conteúdo é exibido em outros comandos (principalmente `about`, `skills` e `projects`):

| Modo         | Efeito                                                                 |
|--------------|------------------------------------------------------------------------|
| `dev`        | Conteúdo completo, técnico e detalhado (padrão)                        |
| `recruiter`  | Conteúdo simplificado, focado no que importa para recrutadores         |

Internamente:
1. Chama `ctx.setMode(name)` → dispara action `SET_MODE` no reducer.
2. Salva a preferência no `localStorage` como `"terminal-mode"` para persistência.

**Exemplos:**
```bash
mode dev                     # Modo desenvolvedor (padrão, conteúdo completo)
mode recruiter               # Modo recrutador (conteúdo simplificado)
```

---

### `whoami`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `whoami`                                       |
| **Descrição** | Quem sou eu?                                |

**Comportamento:**
Retorna uma string simples e divertida com a identidade do dono do portfólio:

```
israel.zeferino – Software Engineer, cafeinado, builder de hackathons 🏆☕
```

Esse comando é uma referência direta ao `whoami` do Unix/Linux, que retorna o usuário logado no sistema.

---

### `ls`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `ls`                                           |
| **Descrição** | Lista diretórios do portfólio               |

**Comportamento:**
Simula o comportamento do comando `ls -l` do Unix, listando "arquivos e diretórios" fictícios que representam as seções do portfólio:

```
drwxr-xr-x  about/
drwxr-xr-x  projects/
drwxr-xr-x  skills/
drwxr-xr-x  contact/
-rw-r--r--  resume.pdf
-rw-r--r--  README.md
```

É puramente decorativo — serve para reforçar a imersão de terminal real. Não aceita argumentos ou flags.

---

### `cat`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `cat <arquivo>`                                |
| **Descrição** | Mostra conteúdo de um arquivo               |

**Argumentos:**

| Argumento  | Tipo     | Obrigatório | Descrição                  |
|------------|----------|-------------|----------------------------|
| `arquivo`  | `string` | Sim         | Nome do arquivo para ler   |

**Comportamento:**
Simula o comando `cat` do Unix. Reconhece os seguintes arquivos:

| Arquivo           | Conteúdo exibido                                              |
|-------------------|---------------------------------------------------------------|
| `about.txt`       | Mini resumo do Israel com sugestão de usar o comando `about`  |
| `readme.md`       | Mesmo conteúdo de `about.txt` (alias)                         |
| Qualquer outro    | `cat: <nome>: Arquivo não encontrado`                         |

Sem argumento, exibe a sintaxe de uso: `Uso: cat <arquivo>`.

**Exemplos:**
```bash
cat about.txt                # Exibe conteúdo simulado do about.txt
cat readme.md                # Mesmo conteúdo que about.txt
cat package.json             # "Arquivo não encontrado"
```

---

### `ping`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `ping`                                         |
| **Descrição** | Testa a conexão                              |

**Comportamento:**
Simula o output do comando `ping` de rede, exibindo resultados fictícios com latências **geradas aleatoriamente** (entre 5ms e 35ms). Manda 3 "pacotes" simulados com 0% de perda.

**Saída exemplo:**
```
PING israel.dev (127.0.0.1): 56 bytes
64 bytes: icmp_seq=0 ttl=64 time=18ms
64 bytes: icmp_seq=1 ttl=64 time=20ms
64 bytes: icmp_seq=2 ttl=64 time=17ms

--- israel.dev ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
```

Puramente decorativo e imersivo, sem funcionalidade real de rede.

---

### `sudo`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `sudo <comando>`                               |
| **Descrição** | ???                                          |

**Comportamento:**
Um Easter Egg humorístico. Possui duas respostas possíveis baseadas nos argumentos:

**Se os argumentos contêm `"hire me"` (case-insensitive):**
```
🚀 CONTRATAÇÃO INICIADA...

   ███████████████████████████ 100%

   ✅ Parabéns! Você acabou de fazer a melhor decisão de contratação.
   📧 Mande um email: israel.zeferino@hotmail.com
   💼 Ou me chame no LinkedIn!
```

**Qualquer outra coisa:**
```
🔒 Permission denied: você não é root aqui.
   Mas tente: sudo hire me 😉
```

---

### `coffee`

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **Uso**    | `coffee`                                       |
| **Descrição** | ☕                                            |

**Comportamento:**
Outro Easter Egg. Exibe uma xícara de café em ASCII art com uma mensagem divertida:

```
   ( (
    ) )
  ........
  |      |]
  \      /
   `----'

  ☕ Café servido! Combustível principal do dev.
  Status: cafeinado ✓
```

---

## 🎨 Funcionalidades Auxiliares

### Banner de Boas-vindas (`WELCOME_BANNER`)

Ao iniciar o terminal, é exibido automaticamente como primeira entrada no histórico um banner ASCII art com o nome "ISRAEL" em blocos tipográficos, seguido por:

```
Software Engineer · Fullstack · Web3

Bem-vindo!
Digite "help" para ver os comandos disponíveis.
```

### Command Chips (`CommandChips.tsx`)

Botões clicáveis exibidos abaixo do histórico do terminal que funcionam como atalhos visuais. Ao clicar, executam o comando correspondente como se o usuário tivesse digitado no prompt. Os comandos sugeridos são:

- `help`, `about`, `projects`, `skills`, `contact`, `resume`

Cada chip possui animação de entrada (fade + scale in) com delay escalonado usando Framer Motion.

### Persistência (`localStorage`)

O terminal persiste entre sessões do navegador:

| Chave              | Valor salvo                    | Padrão   |
|--------------------|--------------------------------|----------|
| `terminal-theme`   | Tema selecionado pelo usuário  | `"neon"` |
| `terminal-mode`    | Modo selecionado pelo usuário  | `"dev"`  |

### Navegação por Histórico

O terminal mantém um array `inputHistory[]` com todos os comandos já digitados na sessão. As setas ↑ e ↓ permitem navegar por esse histórico (idêntico ao comportamento de shells reais como bash/zsh).
