export interface Project {
  title: string;
  slug: string;
  oneLiner: string;
  description: string;
  stack: string[];
  links: { github?: string; live?: string; demo?: string };
  tags: string[];
  year: number;
  featured: boolean;
  highlights: string[];
  caseStudy?: string;
}

export const projects: Project[] = [
  {
    title: "Valocracia",
    slug: "valocracia",
    oneLiner: "Plataforma Web3 de governança descentralizada com fan tokens",
    description:
      "Projeto de governança descentralizada que utiliza smart contracts para criar um sistema de votação e participação comunitária através de tokens. Desenvolvido durante hackathons, o projeto conquistou o primeiro lugar no ETHSamba Hack 2024.",
    stack: ["Next.js", "TypeScript", "Solidity", "Ethers.js", "Hardhat", "TailwindCSS"],
    links: { live: "https://valocracy.xyz/en" },
    tags: ["web3", "blockchain", "frontend", "fullstack"],
    year: 2024,
    featured: true,
    highlights: [
      "Campeão do ETHSamba Hack 2024 – Rio de Janeiro",
      "Smart contracts publicados e testados em ambiente de produção",
      "Integração completa blockchain ↔ frontend com Ethers.js",
    ],
    caseStudy:
      "O Valocracia nasceu da ideia de democratizar a governança em comunidades descentralizadas. O projeto utiliza fan tokens como mecanismo de votação proporcional, onde cada token representa poder de voto. A arquitetura foi desenhada para ser modular: smart contracts em Solidity gerenciam a lógica de votação, enquanto o frontend em Next.js oferece uma interface amigável para interagir com a blockchain. O maior desafio técnico foi garantir que as transações on-chain fossem refletidas em tempo real na UI, resolvido com um sistema de polling otimizado e cache local.",
  },
  {
    title: "HackaNation Project",
    slug: "hackanation",
    oneLiner: "Projeto campeão do HackaNation 2025 – São Paulo",
    description:
      "Solução desenvolvida durante o hackathon HackaNation em São Paulo, conquistando o primeiro lugar. Projeto focado em inovação tecnológica e resolução de problemas reais.",
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    links: {},
    tags: ["hackathon", "fullstack", "innovation"],
    year: 2025,
    featured: true,
    highlights: [
      "Campeão do HackaNation 2025 – São Paulo",
      "Desenvolvimento completo em tempo de hackathon",
      "Solução inovadora com impacto real",
    ],
  },
  {
    title: "Sistemas Corporativos – Monkey Branch",
    slug: "monkey-branch",
    oneLiner: "Sistemas web corporativos para automatização de processos",
    description:
      "Desenvolvimento e manutenção de múltiplos sistemas corporativos na Monkey Branch, focados em automatização de processos operacionais e organização de fluxos de negócio para empresas de diferentes ramos.",
    stack: ["React", "Node.js", "NestJS", "PHP", "MySQL", "PostgreSQL", "Docker", "Nginx"],
    links: {},
    tags: ["fullstack", "backend", "enterprise", "devops"],
    year: 2024,
    featured: true,
    highlights: [
      "Arquitetura escalável preparada para alto volume de acessos",
      "CI/CD pipelines e deploy automatizado em produção",
      "Referência técnica em decisões de engenharia",
    ],
    caseStudy:
      "Na Monkey Branch, atuei de ponta a ponta no ciclo de desenvolvimento de sistemas corporativos. Defini arquiteturas de banco de dados, APIs RESTful e integrações com sistemas de terceiros. Implementei pipelines de CI/CD, gerenciei infraestrutura com Docker e Nginx em servidores Linux (VPS/Digital Ocean), e orientei desenvolvedores juniores. O foco sempre foi em escalabilidade, qualidade de código e boas práticas de engenharia de software.",
  },
  {
    title: "Discord Bots & Automações",
    slug: "discord-bots",
    oneLiner: "Bots e automações customizadas utilizando Discord.js",
    description:
      "Desenvolvimento de bots e automações para Discord, incluindo moderação, integrações com APIs externas e funcionalidades personalizadas para comunidades.",
    stack: ["Node.js", "Discord.js", "TypeScript", "MongoDB"],
    links: { github: "https://github.com/RaeII" },
    tags: ["backend", "automation", "bots"],
    year: 2023,
    featured: false,
    highlights: [
      "Automações complexas com Discord.js SDK",
      "Integrações com APIs externas e webhooks",
      "Gestão de dados com MongoDB",
    ],
  },
  {
    title: "Apps Mobile – React Native",
    slug: "mobile-apps",
    oneLiner: "Aplicações mobile multiplataforma com React Native",
    description:
      "Desenvolvimento de aplicações mobile utilizando React Native, com foco em experiência do usuário e integração com APIs backend.",
    stack: ["React Native", "TypeScript", "Node.js", "REST APIs"],
    links: {},
    tags: ["mobile", "frontend", "fullstack"],
    year: 2023,
    featured: false,
    highlights: [
      "Apps multiplataforma (iOS e Android)",
      "Integração com APIs RESTful",
      "UX otimizada para dispositivos móveis",
    ],
  },
];
