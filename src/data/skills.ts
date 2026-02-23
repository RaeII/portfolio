export interface Skill {
  name: string;
  level: string;
  proof: string;
}

export interface SkillGroup {
  group: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    group: "Frontend",
    skills: [
      { name: "React", level: "Avançado", proof: "4+ anos em produção – Monkey Branch, Valocracia" },
      { name: "Next.js", level: "Avançado", proof: "Valocracia, projetos corporativos" },
      { name: "React Native", level: "Intermediário", proof: "Apps mobile multiplataforma" },
      { name: "TypeScript", level: "Avançado", proof: "Utilizado em todos os projetos" },
      { name: "TailwindCSS", level: "Avançado", proof: "Estilização em projetos modernos" },
    ],
  },
  {
    group: "Backend",
    skills: [
      { name: "Node.js", level: "Avançado", proof: "4+ anos – APIs, automações, bots" },
      { name: "NestJS", level: "Avançado", proof: "Sistemas corporativos Monkey Branch" },
      { name: "PHP", level: "Intermediário", proof: "Sistemas legados e manutenção" },
      { name: "REST APIs", level: "Avançado", proof: "Construção e consumo em produção" },
    ],
  },
  {
    group: "Web3 / Blockchain",
    skills: [
      { name: "Solidity", level: "Intermediário", proof: "Smart contracts – Valocracia" },
      { name: "Ethers.js", level: "Intermediário", proof: "Integração blockchain ↔ frontend" },
      { name: "Hardhat", level: "Intermediário", proof: "Testes e deploy de contratos" },
    ],
  },
  {
    group: "DevOps / Infra",
    skills: [
      { name: "Docker", level: "Avançado", proof: "Containerização em produção" },
      { name: "Nginx", level: "Intermediário", proof: "Proxy reverso e deploy" },
      { name: "Linux", level: "Intermediário", proof: "Administração de servidores VPS" },
      { name: "CI/CD", level: "Intermediário", proof: "Pipelines automatizados" },
      { name: "Digital Ocean", level: "Intermediário", proof: "Infraestrutura cloud" },
    ],
  },
  {
    group: "Banco de Dados",
    skills: [
      { name: "PostgreSQL", level: "Avançado", proof: "Modelagem e otimização" },
      { name: "MySQL", level: "Avançado", proof: "Sistemas corporativos" },
      { name: "MongoDB", level: "Intermediário", proof: "Bots e automações" },
      { name: "MS SQL Server", level: "Básico", proof: "Integrações pontuais" },
    ],
  },
  {
    group: "Ferramentas",
    skills: [
      { name: "Git", level: "Avançado", proof: "Versionamento, PRs, code review" },
      { name: "Docker Compose", level: "Intermediário", proof: "Ambientes de desenvolvimento" },
      { name: "Discord.js", level: "Intermediário", proof: "Bots e automações" },
    ],
  },
];
