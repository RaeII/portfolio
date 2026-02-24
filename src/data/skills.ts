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
      { name: "Next.js", level: "Intermediário", proof: "Valocracia, projetos corporativos" },
      { name: "React Native", level: "Intermediário", proof: "Apps mobile multiplataforma" },
      { name: "TypeScript", level: "Avançado", proof: "Utilizado em todos os projetos" },
      { name: "TailwindCSS", level: "Avançado", proof: "Estilização em projetos modernos" },
    ],
  },
  {
    group: "Backend",
    skills: [
      { name: "Node.js", level: "Avançado", proof: "4+ anos – APIs, automações, bots" },
      { name: "NestJS", level: "Intermediário", proof: "Sistemas corporativos Monkey Branch" },
      { name: "PHP", level: "Avançado", proof: "Sistemas legados e manutenção" },
      { name: "REST APIs", level: "Avançado", proof: "Construção e consumo em produção" },
    ],
  },
  {
    group: "Web3 / Blockchain",
    skills: [
      { name: "Solidity", level: "Avançado", proof: "Smart contracts – Valocracia" },
      { name: "Ethers.js", level: "Avançado", proof: "Integração blockchain ↔ frontend" },
      { name: "Hardhat", level: "Avançado", proof: "Testes e deploy de contratos" },
    ],
  },
  {
    group: "DevOps / Infra",
    skills: [
      { name: "Docker", level: "Avançado", proof: "Containerização em produção" },
      { name: "Nginx", level: "Intermediário", proof: "Proxy reverso e deploy" },
      { name: "Linux", level: "Avançado", proof: "Administração de servidores VPS" },
      { name: "CI/CD", level: "Intermediário", proof: "Pipelines automatizados" },
      { name: "Digital Ocean", level: "Avançado", proof: "Infraestrutura cloud" },
    ],
  },
  {
    group: "Banco de Dados",
    skills: [
      { name: "MySQL", level: "Avançado", proof: "Sistemas corporativos" },
      { name: "PostgreSQL", level: "Intermediário", proof: "Sistemas corporativos" },
      { name: "MongoDB", level: "Intermediário", proof: "Bots e automações" },
      { name: "MS SQL Server", level: "Básico", proof: "Integrações pontuais" },
    ],
  },
  {
    group: "Ferramentas",
    skills: [
      { name: "Git", level: "Avançado", proof: "Versionamento, PRs, code review" },
      { name: "Docker Compose", level: "Avançado", proof: "Ambientes de desenvolvimento" },
      { name: "Discord.js", level: "Avançado", proof: "Bots e automações" },
    ],
  },
];
