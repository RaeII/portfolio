# Renderização Mobile — Documentação Técnica

> Documentação detalhada da estrutura de código responsável pela versão mobile do portfólio.
> Escrita para servir de referência rápida e guia para desenvolvedores iniciantes.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Ponto de Entrada — `Index.tsx`](#3-ponto-de-entrada--indextsx)
4. [Detecção de Mobile — `useIsMobile`](#4-detecção-de-mobile--useismobile)
5. [Componente Raiz — `MobileApp.tsx`](#5-componente-raiz--mobileapptsx)
6. [Contexto Global — `PhoneContext.tsx`](#6-contexto-global--phonecontexttsx)
7. [Casca do Celular — `PhoneShell.tsx`](#7-casca-do-celular--phoneshelltsx)
8. [Telas e Roteamento — `PhoneScreens.tsx`](#8-telas-e-roteamento--phonescreenstsx)
9. [Sistema de Temas (CSS)](#9-sistema-de-temas-css)
10. [Fluxo Completo de Renderização](#10-fluxo-completo-de-renderização)
11. [Dados Externos](#11-dados-externos)

---

## 1. Visão Geral

A versão mobile do portfólio simula um **celular antigo estilo Nokia/feature phone** dentro do navegador. A interface é composta por:

- Uma **casca física** do aparelho (corpo, teclado, D-pad)
- Uma **tela LCD** com visual retrô (scanlines, fontes monoespaçadas)
- Um **sistema de navegação por pilha** (stack) — semelhante a como apps nativos funcionam
- **Temas** intercambiáveis que alteram as cores da tela LCD
- Duas **personas** (Developer / Recruiter) que mudam o conteúdo exibido

A decisão de exibir a versão mobile ou desktop acontece na própria página `Index.tsx`, baseada na largura da tela (breakpoint de 768px).

---

## 2. Estrutura de Arquivos

```
src/
├── pages/
│   └── Index.tsx              ← Ponto de entrada: decide mobile vs desktop
├── hooks/
│   └── use-mobile.tsx         ← Hook que detecta se a tela é mobile
├── components/
│   └── mobile/
│       ├── MobileApp.tsx      ← Componente raiz da versão mobile
│       ├── PhoneContext.tsx    ← Estado global (navegação, tema, modo, som)
│       ├── PhoneShell.tsx     ← Visual do corpo do celular (carcaça + botões)
│       └── PhoneScreens.tsx   ← Todas as telas + roteador de telas
├── data/
│   ├── projects.ts            ← Lista de projetos (usado na tela Projects)
│   └── skills.ts              ← Lista de skills agrupadas (usado na tela Skills)
└── index.css                  ← Temas de cor do LCD (variáveis CSS)
```

---

## 3. Ponto de Entrada — `Index.tsx`

**Arquivo:** `src/pages/Index.tsx`

```tsx
const Index = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <title>Israel Zeferino – Software Engineer | Portfolio</title>
      <meta name="description" content="..." />
      {isMobile ? <MobileApp /> : <CrtScene />}
    </>
  );
};
```

### O que acontece aqui:

1. O hook `useIsMobile()` retorna `true` se a tela tiver **menos de 768px** de largura.
2. Se for mobile → renderiza `<MobileApp />` (celular retrô).
3. Se for desktop → renderiza `<CrtScene />` (cena 3D com monitor CRT).

Esse é o **único ponto de decisão** entre as duas versões do portfólio. Não existe roteamento adicional — tudo é condicional via esse ternário.

---

## 4. Detecção de Mobile — `useIsMobile`

**Arquivo:** `src/hooks/use-mobile.tsx`

```tsx
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

### Como funciona:

- Usa a API `window.matchMedia` para ouvir mudanças de largura da tela.
- O breakpoint é **767px** (768 - 1). Se a tela for ≤ 767px, é mobile.
- O valor é **reativo**: se o usuário redimensionar a janela, a troca acontece automaticamente.
- No primeiro render (SSR ou antes do effect), `isMobile` é `undefined`, e `!!undefined` retorna `false` — ou seja, começa assumindo desktop e corrige no cliente.

---

## 5. Componente Raiz — `MobileApp.tsx`

**Arquivo:** `src/components/mobile/MobileApp.tsx`

```tsx
export function MobileApp() {
  return (
    <PhoneProvider>
      <div className="min-h-screen bg-[#111118] flex items-center justify-center p-3">
        <PhoneShell>
          <PhoneScreens />
        </PhoneShell>
      </div>
    </PhoneProvider>
  );
}
```

### Responsabilidades:

1. **`<PhoneProvider>`** — Envolve tudo com o Context global (estado de navegação, tema, som, modo).
2. **Container escuro** — O `div` cria um fundo escuro (`#111118`) e centraliza o celular na tela.
3. **`<PhoneShell>`** — Renderiza a carcaça visual do celular (corpo, botões, D-pad).
4. **`<PhoneScreens />`** — Fica **dentro** do Shell, ocupando a área da "tela LCD". É o conteúdo dinâmico.

### Hierarquia visual:

```
PhoneProvider (contexto invisível)
└── div (fundo escuro, centralização)
    └── PhoneShell (carcaça do celular)
        └── PhoneScreens (conteúdo da tela LCD)
```

---

## 6. Contexto Global — `PhoneContext.tsx`

**Arquivo:** `src/components/mobile/PhoneContext.tsx`

Este é o **cérebro** da versão mobile. Gerencia todo o estado compartilhado entre os componentes.

### 6.1 Tipos Exportados

```tsx
export type PhoneTheme = 'green' | 'gray' | 'amber';   // Temas de cor da tela LCD
export type PhoneMode = 'dev' | 'recruiter';             // Persona do conteúdo

export interface ScreenEntry {
  id: string;                         // Identificador da tela (ex: 'home', 'about')
  params?: Record<string, any>;       // Parâmetros opcionais (ex: { slug: 'valocracia' })
}
```

### 6.2 Estado Gerenciado

| Estado    | Tipo            | Default      | Descrição                                     |
|-----------|-----------------|--------------|-----------------------------------------------|
| `stack`   | `ScreenEntry[]` | `[{ id: 'home' }]` | Pilha de navegação (histórico de telas)  |
| `theme`   | `PhoneTheme`    | `'green'`    | Tema visual da tela LCD                       |
| `soundOn` | `boolean`       | `false`      | Se o som está ativado                         |
| `mode`    | `PhoneMode`     | `'dev'`      | Persona ativa (muda textos em About)          |

### 6.3 Funções de Navegação

```tsx
// Adiciona uma nova tela no topo da pilha
const push = (id: string, params?: Record<string, any>) => {
  setStack(s => [...s, { id, params }]);
};

// Remove a tela do topo (volta para a anterior)
const back = () => {
  setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
};

// A tela atual é sempre a última da pilha
const current = stack[stack.length - 1];
```

**Como funciona a navegação por pilha:**

```
Exemplo de fluxo:
1. Início:    stack = [home]
2. Push:      stack = [home, projects]         ← Usuário abre "Projects"
3. Push:      stack = [home, projects, detail]  ← Usuário abre um projeto
4. Back:      stack = [home, projects]          ← Volta para lista
5. Back:      stack = [home]                    ← Volta para home
```

A pilha nunca fica vazia — o `back()` só remove se houver mais de 1 item.

### 6.4 Sistema de Eventos (Event Bus)

O celular simula inputs físicos (cima, baixo, esquerda, direita, ok, back, menu) através de **CustomEvents** do DOM:

```tsx
// Dispara um evento de input para o celular inteiro
export function dispatchPhoneInput(type: 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'menu') {
  window.dispatchEvent(new CustomEvent('phone-input', { detail: type }));
}

// Hook para ouvir eventos de input dentro de qualquer componente
export function usePhoneInput(handler: (type: string) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const fn = (e: Event) => handlerRef.current((e as CustomEvent).detail);
    window.addEventListener('phone-input', fn);
    return () => window.removeEventListener('phone-input', fn);
  }, []);
}
```

**Fluxo de um input:**

```
Botão D-Pad clicado → dispatchPhoneInput('up')
                        → CustomEvent('phone-input', { detail: 'up' })
                          → Todos os usePhoneInput() ouvem
                            → O handler da tela ativa reage
```

Além disso, o **teclado físico** também funciona (para testes no desktop):

| Tecla       | Ação   |
|-------------|--------|
| ArrowUp     | up     |
| ArrowDown   | down   |
| ArrowLeft   | left   |
| ArrowRight  | right  |
| Enter       | ok     |
| Escape      | back   |

### 6.5 Hook de Navegação de Menu — `useMenuNav`

```tsx
export function useMenuNav(itemCount: number, onOk?: (index: number) => void) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  usePhoneInput(useCallback((type: string) => {
    if (type === 'up') setSelectedIndex(i => Math.max(0, i - 1));
    else if (type === 'down') setSelectedIndex(i => Math.min(itemCount - 1, i + 1));
    else if (type === 'ok' && onOk) onOk(indexRef.current);
  }, [itemCount, onOk]));

  return { selectedIndex, setSelectedIndex };
}
```

Esse hook é **reutilizado em quase todas as telas** que possuem listas/menus. Ele:

1. Mantém o índice do item selecionado.
2. Move para cima/baixo com os eventos de D-pad.
3. Executa o callback `onOk` quando o usuário pressiona OK.
4. Reseta a seleção para 0 quando a quantidade de itens muda.

---

## 7. Casca do Celular — `PhoneShell.tsx`

**Arquivo:** `src/components/mobile/PhoneShell.tsx`

Renderiza toda a **aparência física** do celular. Recebe `children` (o conteúdo da tela) e o posiciona dentro da área da "tela LCD".

### Estrutura Visual (de cima para baixo):

```
┌─────────────────────────────┐
│          Earpiece            │  ← Barra do alto-falante
│  ┌───────────────────────┐  │
│  │                       │  │
│  │     TELA LCD          │  │  ← 248x340px, com scanlines overlay
│  │   (children aqui)     │  │
│  │                       │  │
│  └───────────────────────┘  │
│         ISRAEL              │  ← Branding
│  [Menu]   [OK]   [Back]    │  ← Soft keys
│          [▲]               │
│     [◄]  [●]  [►]          │  ← D-Pad
│          [▼]               │
│  [1] [2] [3]               │
│  [4] [5] [6]               │  ← Teclado numérico (decorativo)
│  [7] [8] [9]               │
│  [*] [0] [#]               │
└─────────────────────────────┘
```

### Detalhes Importantes:

- **Classe de tema:** O container principal recebe `phone-theme-{theme}` (ex: `phone-theme-green`), que ativa as variáveis CSS corretas.
- **Tela LCD:** Tem dimensões fixas de `248x340px` com fundo e texto controlados por variáveis CSS.
- **Scanlines:** Um overlay com `repeating-linear-gradient` que simula as linhas de uma tela LCD antiga.
- **Botões funcionais:** Os botões Menu, OK, Back e o D-Pad chamam `dispatchPhoneInput()` ao serem clicados — enviam eventos para o Event Bus.
- **Teclado numérico:** É puramente **decorativo** — os botões não têm ação associada.
- **Função `btn()`:** Uma função auxiliar interna que cria botões com animação de `active:scale-95` (pressionar) e chama `dispatchPhoneInput`.

---

## 8. Telas e Roteamento — `PhoneScreens.tsx`

**Arquivo:** `src/components/mobile/PhoneScreens.tsx`

Este arquivo contém **todas as telas** do celular e o **roteador** que decide qual tela exibir.

### 8.1 Componentes Compartilhados

#### `ScreenLayout`

Layout padrão usado por **todas** as telas. Estrutura em 3 partes:

```
┌─────────────────────┐
│  ◄ Título da Tela   │  ← Header (opcional)
├─────────────────────┤
│                     │
│  Conteúdo aqui      │  ← Área scrollável (flex-1)
│                     │
├─────────────────────┤
│  SoftLeft  SoftRight│  ← Footer com labels dos botões
└─────────────────────┘
```

Props:
- `title` — Texto do header (se omitido, não renderiza o header).
- `softLeft` / `softRight` — Labels do rodapé (ex: "Back" / "Select").
- `children` — Conteúdo da tela.

#### `MenuList`

Componente de lista reutilizável que renderiza itens com highlight no selecionado:

- Cada item mostra um ícone + label.
- O item selecionado (`selectedIndex`) recebe as cores de `--phone-highlight` e `--phone-highlight-text`.
- Cada item é clicável (`onClick → onTap`).

#### `LoadingOverlay`

Overlay de "carregando" que aparece brevemente (180ms) ao trocar de tela, simulando o carregamento de um celular antigo.

### 8.2 Telas Disponíveis

| ID da Tela        | Componente             | Descrição                                      |
|-------------------|------------------------|-------------------------------------------------|
| `home`            | `HomeScreen`           | Tela inicial com relógio, status bar e menu     |
| `about`           | `AboutScreen`          | Sobre o Israel (paginado, muda com o modo)      |
| `projects`        | `ProjectsScreen`       | Lista de projetos (dados de `projects.ts`)      |
| `project-detail`  | `ProjectDetailScreen`  | Detalhe de um projeto (recebe `slug` por param) |
| `skills`          | `SkillsScreen`         | Lista de grupos de skills                       |
| `skill-group`     | `SkillGroupScreen`     | Skills de um grupo com barras de nível          |
| `timeline`        | `TimelineScreen`       | Lista de marcos da carreira                     |
| `timeline-detail` | `TimelineDetailScreen` | Detalhe de um marco (recebe `index` por param)  |
| `contact`         | `ContactScreen`        | Links de contato + copiar email + ping           |
| `settings`        | `SettingsScreen`       | Alterar tema, som e modo (dev/recruiter)        |
| `extras`          | `ExtrasScreen`         | Easter eggs (ringtone, código secreto, about)   |

### 8.3 Detalhes de Cada Tela

**HomeScreen:**
- Exibe relógio em tempo real (atualiza a cada segundo).
- Status bar com nome da operadora (`ISZ-DEV`).
- Menu com 7 itens: About, Projects, Skills, Timeline, Contact, Settings, Extras.
- Usa `useMenuNav` para navegação com D-pad.

**AboutScreen:**
- Conteúdo **paginado** (2 páginas) — navega com esquerda/direita ou cima/baixo.
- Conteúdo muda com o `mode`: Developer mostra stack e conquistas técnicas; Recruiter mostra perfil profissional.

**ProjectsScreen → ProjectDetailScreen:**
- Lista de projetos vem de `src/data/projects.ts`.
- Projetos `featured` ganham ícone `★`, os outros ganham `◆`.
- O detalhe mostra ano, tags, descrição, highlights e stack.
- Links para Live e GitHub abrem em nova aba.

**SkillsScreen → SkillGroupScreen:**
- Grupos de skills vêm de `src/data/skills.ts`.
- Cada skill mostra nome, barra de nível visual (ASCII art) e prova de uso.
- Barras: `██████████` (Avançado), `██████░░░░` (Intermediário), `███░░░░░░░` (Básico).

**TimelineScreen → TimelineDetailScreen:**
- Dados inline no próprio arquivo (constante `timelineData`).
- Lista de marcos de 2021 a 2025 com título e descrição.

**ContactScreen:**
- 4 opções: Copiar email, LinkedIn, GitHub, Send Ping.
- Copiar email usa `navigator.clipboard.writeText()`.
- Links externos abrem com `window.open()`.
- Ping é visual — mostra feedback animado por 2 segundos.

**SettingsScreen:**
- Alterna entre 3 temas: green → gray → amber (cíclico).
- Liga/desliga som.
- Alterna modo: dev ↔ recruiter.

**ExtrasScreen:**
- 3 easter eggs com mensagens temporárias (2-3 segundos).

### 8.4 Roteador de Telas — `PhoneScreens`

```tsx
export function PhoneScreens() {
  const { current } = usePhone();

  // Efeito de loading ao trocar de tela
  useEffect(() => {
    if (current.id !== prevId) {
      setLoading(true);
      setTimeout(() => setLoading(false), 180);  // 180ms de "carregamento"
    }
  }, [current.id]);

  // Switch/case que mapeia o id da tela para o componente
  const screen = (() => {
    switch (current.id) {
      case 'home': return <HomeScreen />;
      case 'project-detail': return <ProjectDetailScreen slug={current.params?.slug} />;
      // ... etc
    }
  })();

  return (
    <div className="relative w-full h-full">
      {screen}
      {loading && <LoadingOverlay text={loadingText} />}
    </div>
  );
}
```

**Como funciona:**

1. Lê `current` do contexto (última entrada da pilha de navegação).
2. Usa um `switch` para mapear `current.id` ao componente correto.
3. Telas que precisam de dados recebem via `current.params` (ex: `slug`, `group`, `index`).
4. Ao trocar de tela, exibe um `LoadingOverlay` por 180ms com texto "Opening {tela}...".

---

## 9. Sistema de Temas (CSS)

**Arquivo:** `src/index.css` (final do arquivo)

Os temas são definidos como **variáveis CSS** aplicadas via classe no `PhoneShell`:

```css
.phone-theme-green {
  --phone-bg: hsl(90 18% 60%);           /* Fundo da tela */
  --phone-text: hsl(90 30% 14%);         /* Texto principal */
  --phone-highlight: hsl(90 30% 14%);    /* Fundo do item selecionado */
  --phone-highlight-text: hsl(90 22% 75%); /* Texto do item selecionado */
  --phone-dim: hsl(90 18% 36%);          /* Texto secundário/opaco */
  --phone-border: hsl(90 14% 48%);       /* Bordas */
}
```

| Tema   | Aparência                          |
|--------|------------------------------------|
| green  | LCD verde clássico (estilo Nokia)  |
| gray   | LCD monocromático cinza            |
| amber  | LCD âmbar/amarelo retrô            |

As variáveis são consumidas nos componentes via `style={{ color: 'var(--phone-dim)' }}` (inline) e via `backgroundColor: 'var(--phone-highlight)'`.

Também existe a classe `.phone-screen-area` que esconde a scrollbar para manter a estética limpa.

---

## 10. Fluxo Completo de Renderização

```
1. Usuário acessa o site no celular (tela < 768px)

2. Index.tsx
   └── useIsMobile() retorna true
   └── Renderiza <MobileApp />

3. MobileApp.tsx
   └── <PhoneProvider> inicializa estado:
   │     stack: [{ id: 'home' }]
   │     theme: 'green'
   │     mode: 'dev'
   │
   └── <PhoneShell> renderiza a carcaça
       │   classe: phone-theme-green (ativa variáveis CSS)
       │   botões: Menu, OK, Back, D-Pad → dispatchPhoneInput()
       │
       └── <PhoneScreens> renderiza conteúdo
             │   current.id === 'home'
             │   → <HomeScreen />
             │
             └── HomeScreen
                   ├── Relógio em tempo real
                   ├── Status bar (ISZ-DEV)
                   └── Menu com 7 itens (useMenuNav)

4. Usuário toca em "Projects" (ou usa D-Pad + OK)
   └── push('projects') → stack: [home, projects]
   └── PhoneScreens re-renderiza
   └── Loading overlay por 180ms
   └── <ProjectsScreen />

5. Usuário toca em um projeto
   └── push('project-detail', { slug: 'valocracia' })
   └── stack: [home, projects, project-detail]
   └── <ProjectDetailScreen slug="valocracia" />

6. Usuário aperta "Back"
   └── dispatchPhoneInput('back')
   └── back() → stack: [home, projects]
   └── Volta para <ProjectsScreen />
```

---

## 11. Dados Externos

### `src/data/projects.ts`

Define a interface `Project` e exporta o array `projects`:

```tsx
interface Project {
  title: string;
  slug: string;         // Identificador único (usado em params de navegação)
  oneLiner: string;
  description: string;
  stack: string[];
  links: { github?: string; live?: string; demo?: string };
  tags: string[];
  year: number;
  featured: boolean;    // Se true, aparece com ícone ★
  highlights: string[];
  caseStudy?: string;
}
```

### `src/data/skills.ts`

Define a interface `SkillGroup` e exporta o array `skillGroups`:

```tsx
interface SkillGroup {
  group: string;        // Nome do grupo (ex: "Frontend", "Backend")
  skills: Skill[];      // Array de skills do grupo
}

interface Skill {
  name: string;         // Nome da skill (ex: "React")
  level: string;        // "Avançado" | "Intermediário" | "Básico"
  proof: string;        // Texto comprovando experiência
}
```

Para adicionar novos projetos ou skills, basta editar esses arquivos — as telas renderizam automaticamente com base nos dados.
