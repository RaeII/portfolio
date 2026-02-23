# portfolio - Documentação e Estrutura do Projeto

## Visão Geral
Este projeto é o portfólio interativo do Israel Zeferino, onde o usuário interage através de um **terminal renderizado dentro de um monitor 3D** (estilo computador dos anos 90). Ele foi construído com as tecnologias modernas do ecossistema front-end: React, TypeScript, Vite, TailwindCSS (com Shadcn UI) e Three.js (auxiliado pelo React Three Fiber para renderização 3D declarativa).

Para um desenvolvedor menos experiente que for ler este código: o projeto junta a criação de uma interface 2D regular (o terminal) com uma cena 3D inteira (o computador, a mesa e o ambiente), conectando os dois de forma que a interface web em HTML 2D funcione perfeitamente texturizando a tela de um modelo 3D. 

---

## 🏗 Estrutura de Diretórios e Arquivos

A pasta principal do código é a `src/`. Abaixo está a explicação de como as funcionalidades estão organizadas:

### O Coração da Aplicação
- **`src/main.tsx`** e **`src/App.tsx`**: Os pontos de entrada do React. Eles configuram as rotas principais da aplicação (com o `react-router-dom`), aplicam configurações globais e iniciam a raiz do projeto.
- **`src/pages/Index.tsx`**: É a página inicial e a principal de todo o projeto. O único trabalho dela é encapsular o nome da página (Helmet/Meta) e renderizar e importar o componente `<CrtScene />`, que vai cuidar de gerar e inicializar todo o ambiente 3D.

### A Cena 3D: Como Funciona a Renderização
A mágica gráfica acontece na renderização 3D, que é toda gerenciada dentro da pasta `src/components/3d/`.

- **`src/components/3d/CrtScene.tsx`**: É o grande "maestro" visual do projeto. Ele usa o componente `<Canvas>` do `React Three Fiber` para abrir a porta para o ambiente 3D. É aqui que são definidas a posição da câmera, a iluminação (luzes azuis, esverdeadas retro e sombras), e criados a parede e chão da cena.
- **`src/components/3d/PcModel.tsx`**: É o responsável por desenhar o computador em si. Ele carrega a malha estrutural 3D de um modelo de um PC velho (um arquivo na extensão `.glb` extraído da pasta `public/models`) usando o hook `useGLTF` fornecido pela biblioteca do Drei.
- **`<Html>` (dentro de CrtScene)**: É aqui onde o 2D encosta no 3D. O React Three Fiber tem uma funcionalidade poderosa (`<Html transform>`) que pega o nosso componente `<Terminal />` (feito inteiramente de código HTML e CSS de DOM normal) e o converte para fixar perfeitamente a uma posição, escala e rotação exatas dentro do mundo 3D (para bater na mesma posição do buraco da tela do monitor 3D). Quando a lente virtual da câmera 3D vira, a página terminal HTML de dentro acompanha exatamente a mesma distorção.
- **`src/components/3d/ScreenOverlay.tsx`**: Acionado na frente da tela do terminal, ele adiciona texturas falsas (efeito de curvatura na tela, luzes CRT e scanlines), deixando a camada de HTML realista para uma tela retroiluminada bem suja de anos 90.
- **`CrtFallback.tsx`**: Como experiências de 3D pesam no navegador, este componente entra em ação garantindo que não quebremos a internet de ninguém. Se você visita por um Mobile ou o browser não tem `WebGL` rodando, você é redirecionado para esta versão de segurança (somente HTML/CSS em tela cheia regular).

### O Terminal 2D: Lógica e Componentes Genéricos
A interface do terminal que recebe a digitação está na pasta `src/components/`, cuidando de tudo que renderiza no PC do universo.

- **`Terminal.tsx`**: Funciona como o mestre desta tela, utilizando o gancho `useReducer` do React para gerenciar todas as coisas do sistema operacional, desde os comandos ("history"), cor do tema ("theme") ou modo. Exibe a própria janela gráfica unindo os três elementos menores listados abaixo.
- **`TerminalHeader.tsx`**: Configura aquele topo de barras onde indica a data da máquina.
- **`TerminalHistory.tsx`**: Cuida de listar verticalmente toda informação anterior em forma de log retro-antigo que rolou ou que o sistema já "devolveu".
- **`TerminalInput.tsx`**: A barra piscadinha interativa debaixo e do prompt da seta, onde a digitação e os eventos de seta para pegar o que já foi digitado antes (histórico local) ocorrem.

### Lógica de Respostas (Processando as Palavras)
Quando você envia uma palavra falsa ao terminal virtual da máquina, o React reage checando e rodando scripts na pasta `src/lib/`. 

- **`src/lib/commands/parser.ts`**: Ferramenta utilitária que vai quebrar as strings jogadas no input pelo usuário. Exemplo: um comando gigantesco estilo `projects --tag web3` entra ali, e a ferramenta o limpa cortando e extraindo partes para devolver que foi apenas comando de nome "projects" mais a flag "tag" marcada com string "web3".
- **`src/lib/commands/handlers.ts`**: É o grande cérebro da matriz. Ele exporta o array `commands`, onde cada funcionalidade (como de menu no painel, ajuda, `skills`, `clear`, e bobeiras como de `ping`, de `sudo` etc.) possui a lógica (`run()`) definindo com exatidão o que ele vai responder caso chame. Dali sai apenas a resposta que será montada como novo `HistoryEntry` renderizando dados de volta ao `TerminalHistory.tsx`.

### Os Dados (Data)
O conteúdo biográfico do projeto mora no `src/data/`, para não misturar em linha com a interface.
- **`src/data/projects.ts`**: Array com todos os trabalhos do criador do repositório, nome, detalhes curtos, longos, tecnologias e links de sites vivos ou github.
- **`src/data/skills.ts`**: Array com listas de habilidades e classificações/graus em níveis categorizados como frontend e frameworks para injetar e fazer aqueles bloquinhos visuais nas horas em que requisitam as skills do Dev.

### Outros Diretórios e Dicionários
- **`src/components/ui/`**: Diversos componentes estáticos feitos para o React extraídos diretamente do uso de scripts para frameworks (conhecido da famosa biblioteca do Shadcn UI, para botões e menus complexos mantendo TailwindCSS e tipografia Radix).
- **`src/hooks/`**: Pedaços lógicos independentes, de exemplos como o utilitário do `use-mobile` (responsável por dizer o status se a janela exata de abertura no momento possui comportamento enquadrado como mobile ou desktop).

---

## 💡 Resumo do Fluxo Principal (Como as coisas conversam)

Se perdeu na hora de ler como ele roda pela primeira vez? Basta seguir este fluxo da requisição de quem acessou sua aba:

1. Sua Rota (`main.tsx` + `App.tsx`) acessa sua página nativa `Index.tsx`.
2. Em `Index.tsx`, se ele é habilitado por hardware para 3D e é desktop, inicializa a aplicação pelo Canvas do `CrtScene.tsx`.
3. O mundo (Luz, Sombras) inicia e o computador no centro em 3D aparece (`PcModel.tsx`), baixado dentro estático local (`public/models/`).
4. Logo na reta da tela real física de malha do modelo do Computador (objeto). O script atrela na medida de pixels perfeitamente convertida para proporção tridimensional um bloco inteiro nativo e plano com todo o `<Terminal />` construído. O mesmo tem sobreposições que afetam sua distorção para emular que seu vidro tenha curvaturas normais e imperfeitas.
5. Quando você enxerga perfeitamente a sua tela 2D rodando HTML via render ali enclausurada e clica com seu cursor. Sobe o Evento e o zoom foca pra frente em `TerminalInput.tsx`. 
6. Você escreve **"about"**. 
7. Ao pressionar `[ENTER]`: Ele captura de seu evento submetido o que digitou. Despeja via Propriedades da função pra passar ele todo limpo ali em `src/lib/parser.ts` para capturar a tag certinha.
8. Envia à verificação em `handlers.ts` encontrando o que o texto `about` fará, aciona o texto fixo na mão dele e manda atualizar o objeto Reducer do `Terminal.tsx` em tempo real injetando as Respostas de todo esse Processo pra baixo na tela do Componente de logs.

Este projeto é uma obra visual de arquitetos digitais visando emular como é simples mesclar interatividade de websites comuns nativos em HTML unificados sobrepostos por imersão total com `React Three Fiber`.
