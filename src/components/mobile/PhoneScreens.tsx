import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { usePhone, useMenuNav, usePhoneInput } from './PhoneContext';
import { projects } from '@/data/projects';
import { skillGroups } from '@/data/skills';

/* ════════════════════════════════════════
   Shared layout components
   ════════════════════════════════════════ */

function ScreenLayout({ title, softLeft, softRight, children }: {
  title?: string;
  softLeft?: string;
  softRight?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'VT323', monospace" }}>
      {title && (
        <div
          className="px-2 py-1 text-center text-[14px] font-bold border-b tracking-wide"
          style={{ borderColor: 'var(--phone-dim)' }}
        >
          ◄ {title}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-2 py-1 phone-screen-area text-[15px]">
        {children}
      </div>
      <div
        className="flex justify-between px-2 py-1 text-[11px] border-t"
        style={{ borderColor: 'var(--phone-dim)', color: 'var(--phone-dim)' }}
      >
        <span>{softLeft || ''}</span>
        <span>{softRight || ''}</span>
      </div>
    </div>
  );
}

function MenuList({ items, selectedIndex, onTap }: {
  items: { label: string; icon?: string }[];
  selectedIndex: number;
  onTap: (i: number) => void;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          className="px-2 py-[3px] cursor-pointer transition-colors"
          style={
            i === selectedIndex
              ? { backgroundColor: 'var(--phone-highlight)', color: 'var(--phone-highlight-text)' }
              : {}
          }
          onClick={() => onTap(i)}
        >
          {item.icon ? `${item.icon} ` : '> '}{item.label}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   Loading overlay
   ════════════════════════════════════════ */

function LoadingOverlay({ text }: { text: string }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-[14px]"
      style={{ backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text)', fontFamily: "'VT323', monospace" }}
    >
      <div>{text}</div>
      <div className="mt-1 animate-pulse">...</div>
    </div>
  );
}

/* ════════════════════════════════════════
   HOME SCREEN
   ════════════════════════════════════════ */

function HomeScreen() {
  const { push } = usePhone();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const menuItems = [
    { label: 'About', icon: '☺' },
    { label: 'Projects', icon: '◆' },
    { label: 'Skills', icon: '★' },
    { label: 'Timeline', icon: '◷' },
    { label: 'Contact', icon: '✉' },
    { label: 'Settings', icon: '⚙' },
    { label: 'Extras', icon: '♪' },
  ];

  const screens = ['about', 'projects', 'skills', 'timeline', 'contact', 'settings', 'extras'];

  const go = useCallback((i: number) => push(screens[i]), [push]);
  const { selectedIndex, setSelectedIndex } = useMenuNav(menuItems.length, go);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const carrier = 'BR-DEV';

  return (
    <ScreenLayout softLeft="Menu" softRight="Select">
      {/* Status bar */}
      <div className="flex justify-between px-1 text-[11px] mb-1" style={{ color: 'var(--phone-dim)' }}>
        <span>{carrier}</span>
        <span>▓▓▓░ ████░</span>
      </div>

      {/* Clock */}
      <div className="text-center mb-2">
        <div className="text-[40px] leading-none">{hh}:{mm}</div>
        <div className="text-[12px]" style={{ color: 'var(--phone-dim)' }}>
          {time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Menu */}
      <MenuList
        items={menuItems}
        selectedIndex={selectedIndex}
        onTap={(i) => { setSelectedIndex(i); go(i); }}
      />
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   ABOUT SCREEN
   ════════════════════════════════════════ */

function AboutScreen() {
  const [page, setPage] = useState(0);

  const pages = [
    'Israel Zeferino\nSoftware Engineer\n\n4+ anos de experiência em\ndesenvolvimento fullstack.\n\nStack principais:\nPHP, Node.js, React.js, NestJS,TypeScript, Web3',
    'Conquistas:\n\n🏆 Campeão ETHSamba 2024\n   Rio de Janeiro\n\n🏆 Campeão HackaNation 2025\n   São Paulo\n\nFoco em arquitetura\nescalável e código limpo.',
  ];

  usePhoneInput(useCallback((t: string) => {
    if (t === 'right' || t === 'down') setPage(p => Math.min(pages.length - 1, p + 1));
    if (t === 'left' || t === 'up') setPage(p => Math.max(0, p - 1));
  }, [pages.length]));

  return (
    <ScreenLayout title="About" softLeft="Back" softRight={`${page + 1}/${pages.length}`}>
      <pre className="whitespace-pre-wrap text-[14px] leading-snug py-1">{pages[page]}</pre>
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   PROJECTS SCREEN
   ════════════════════════════════════════ */

function ProjectsScreen() {
  const { push } = usePhone();
  const items = projects.map(p => ({
    label: p.title,
    icon: p.featured ? '★' : '◆',
  }));

  const go = useCallback((i: number) => push('project-detail', { slug: projects[i].slug }), [push]);
  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, go);

  return (
    <ScreenLayout title="Projects" softLeft="Back" softRight="Open">
      <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); go(i); }} />
    </ScreenLayout>
  );
}

function ProjectDetailScreen({ slug }: { slug: string }) {
  const project = projects.find(p => p.slug === slug);

  const items = project
    ? [
        ...(project.links.live ? [{ label: 'Live ↗', icon: '▸' }] : []),
        ...(project.links.github ? [{ label: 'GitHub ↗', icon: '▸' }] : []),
      ]
    : [];

  const handleLink = useCallback((i: number) => {
    if (!project) return;
    if (items[i]?.label.startsWith('Live') && project.links.live) window.open(project.links.live, '_blank');
    if (items[i]?.label.startsWith('GitHub') && project.links.github) window.open(project.links.github, '_blank');
  }, [project, items]);

  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, handleLink);

  if (!project) return <ScreenLayout title="Error"><div>Not found</div></ScreenLayout>;

  return (
    <ScreenLayout title={project.title} softLeft="Back" softRight={items.length ? 'Open' : ''}>
      <div className="text-[13px] leading-snug py-1">
        <div className="mb-2" style={{ color: 'var(--phone-dim)' }}>{project.year} • {project.tags.join(', ')}</div>
        <div className="mb-2">{project.oneLiner}</div>
        {project.highlights.map((h, i) => (
          <div key={i} className="mb-1">• {h}</div>
        ))}
        <div className="mt-2 text-[11px]" style={{ color: 'var(--phone-dim)' }}>
          Stack: {project.stack.join(', ')}
        </div>
      </div>
      {items.length > 0 && (
        <div className="mt-2 border-t pt-1" style={{ borderColor: 'var(--phone-dim)' }}>
          <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); handleLink(i); }} />
        </div>
      )}
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   SKILLS SCREEN
   ════════════════════════════════════════ */

function SkillsScreen() {
  const { push } = usePhone();
  const items = skillGroups.map(g => ({ label: g.group, icon: '▸' }));

  const go = useCallback((i: number) => push('skill-group', { group: skillGroups[i].group }), [push]);
  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, go);

  return (
    <ScreenLayout title="Skills" softLeft="Back" softRight="Open">
      <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); go(i); }} />
    </ScreenLayout>
  );
}

function SkillGroupScreen({ group }: { group: string }) {
  const sg = skillGroups.find(g => g.group === group);
  if (!sg) return <ScreenLayout title="Error"><div>Not found</div></ScreenLayout>;

  const barMap: Record<string, string> = {
    'Avançado': '██████████',
    'Intermediário': '██████░░░░',
    'Básico': '███░░░░░░░',
  };

  return (
    <ScreenLayout title={sg.group} softLeft="Back" softRight="">
      <div className="text-[13px] py-1">
        {sg.skills.map((s, i) => (
          <div key={i} className="mb-2">
            <div className="font-bold">{s.name}</div>
            <div className="text-[12px]" style={{ color: 'var(--phone-dim)' }}>
              {barMap[s.level] || '███░░░░░░░'} {s.level}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--phone-dim)' }}>{s.proof}</div>
          </div>
        ))}
      </div>
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   TIMELINE SCREEN
   ════════════════════════════════════════ */

const timelineData = [
  { year: 2017, title: 'Aprendendo a Programar', desc: 'Início da jornada como desenvolvedor.' },
  { year: 2022, title: 'Estágio em Desenvolvimento', desc: 'Estágio em Desenvolvimento de Software | Empresa Seja Prime' },
  { year: 2022, title: 'Monkey Branch', desc: 'Desenvolvedor na Monkey Branch (Cargo atual)' },
  { year: 2023, title: 'Discord Bots & Mobile', desc: 'Automações com Discord.js, apps React Native, e projetos freelance.' },
  { year: 2024, title: 'Valocracia', desc: 'Campeão ETHSamba 2024. Desenvolvedor Web3 na Valocracia.' },
  { year: 2025, title: 'HackaNation', desc: 'Campeão do HackaNation 2025 – São Paulo' },
];

function TimelineScreen() {
  const { push } = usePhone();
  const items = timelineData.map(t => ({ label: `${t.year} – ${t.title}`, icon: '◷' }));

  const go = useCallback((i: number) => push('timeline-detail', { index: i }), [push]);
  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, go);

  return (
    <ScreenLayout title="Timeline" softLeft="Back" softRight="Open">
      <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); go(i); }} />
    </ScreenLayout>
  );
}

function TimelineDetailScreen({ index }: { index: number }) {
  const entry = timelineData[index];
  if (!entry) return <ScreenLayout title="Error"><div>Not found</div></ScreenLayout>;

  return (
    <ScreenLayout title={`${entry.year}`} softLeft="Back" softRight="">
      <div className="text-[14px] py-1">
        <div className="font-bold mb-2">{entry.title}</div>
        <div className="leading-snug">{entry.desc}</div>
      </div>
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   CONTACT SCREEN
   ════════════════════════════════════════ */

function ContactScreen() {
  const [copied, setCopied] = useState(false);
  const [pinged, setPinged] = useState(false);

  const items = [
    { label: 'Email (copiar)', icon: '✉' },
    { label: 'LinkedIn ↗', icon: '▸' },
    { label: 'GitHub ↗', icon: '▸' },
    { label: 'Send Ping 📡', icon: '►' },
  ];

  const handleSelect = useCallback((i: number) => {
    switch (i) {
      case 0:
        navigator.clipboard.writeText('israel.zeferino@hotmail.com').then(() => setCopied(true));
        setTimeout(() => setCopied(false), 2000);
        break;
      case 1:
        window.open('https://www.linkedin.com/in/dev-israel-zeferino/', '_blank');
        break;
      case 2:
        window.open('https://github.com/RaeII', '_blank');
        break;
      case 3:
        setPinged(true);
        setTimeout(() => setPinged(false), 2000);
        break;
    }
  }, []);

  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, handleSelect);

  return (
    <ScreenLayout title="Contact" softLeft="Back" softRight="Select">
      <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); handleSelect(i); }} />
      {copied && (
        <div className="mt-3 text-center text-[12px] animate-pulse">
          ✓ Email copiado!
        </div>
      )}
      {pinged && (
        <div className="mt-3 text-center text-[12px] animate-pulse">
          ✓ Ping enviado! Mensagem recebida.
        </div>
      )}
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   SETTINGS SCREEN
   ════════════════════════════════════════ */

function SettingsScreen() {
  const { theme, setTheme, soundOn, setSoundOn } = usePhone();

  const items = [
    { label: `Tema: ${theme === 'green' ? 'LCD Green' : theme === 'gray' ? 'Mono Gray' : 'Amber'}`, icon: '◈' },
    { label: `Som: ${soundOn ? 'On' : 'Off'}`, icon: '♪' },
  ];

  const handleSelect = useCallback((i: number) => {
    switch (i) {
      case 0: {
        const themes: Array<'green' | 'gray' | 'amber'> = ['green', 'gray', 'amber'];
        const next = themes[(themes.indexOf(theme) + 1) % themes.length];
        setTheme(next);
        break;
      }
      case 1:
        setSoundOn(!soundOn);
        break;
    }
  }, [theme, soundOn, setTheme, setSoundOn]);

  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, handleSelect);

  return (
    <ScreenLayout title="Settings" softLeft="Back" softRight="Toggle">
      <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); handleSelect(i); }} />
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   EXTRAS SCREEN
   ════════════════════════════════════════ */

function ExtrasScreen() {
  const [msg, setMsg] = useState('');

  const items = [
    { label: 'Ringtone 🔔', icon: '♪' },
    { label: 'Secret Code', icon: '?' },
    { label: 'About Phone', icon: 'ℹ' },
  ];

  const handleSelect = useCallback((i: number) => {
    switch (i) {
      case 0:
        setMsg('♪ beep boop beep ♪');
        break;
      case 1:
        setMsg('↑↑↓↓←→←→BA\n... nothing happened 😄');
        break;
      case 2:
        setMsg('PocketOS v1.0\nby Israel Zeferino\nPowered by ☕ and 💻');
        break;
    }
  }, []);

  const { selectedIndex, setSelectedIndex } = useMenuNav(items.length, handleSelect);

  return (
    <ScreenLayout title="Extras" softLeft="Back" softRight="Select">
      <MenuList items={items} selectedIndex={selectedIndex} onTap={(i) => { setSelectedIndex(i); handleSelect(i); }} />
      {msg && (
        <div className="mt-3 text-center text-[12px] whitespace-pre-wrap">{msg}</div>
      )}
    </ScreenLayout>
  );
}

/* ════════════════════════════════════════
   SCREEN ROUTER
   ════════════════════════════════════════ */

export function PhoneScreens() {
  const { current } = usePhone();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const prevIdRef = useRef(current.id);

  useEffect(() => {
    if (current.id !== prevIdRef.current) {
      const screenNames: Record<string, string> = {
        about: 'About', projects: 'Projects', skills: 'Skills',
        timeline: 'Timeline', contact: 'Contact', settings: 'Settings',
        extras: 'Extras', 'project-detail': 'Project', 'skill-group': 'Skills',
        'timeline-detail': 'Timeline',
      };
      setLoadingText(`Opening ${screenNames[current.id] || current.id}...`);
      setLoading(true);
      prevIdRef.current = current.id;
      const t = setTimeout(() => setLoading(false), 180);
      return () => clearTimeout(t);
    }
  }, [current.id]);

  const screen = (() => {
    switch (current.id) {
      case 'home': return <HomeScreen />;
      case 'about': return <AboutScreen />;
      case 'projects': return <ProjectsScreen />;
      case 'project-detail': return <ProjectDetailScreen slug={current.params?.slug} />;
      case 'skills': return <SkillsScreen />;
      case 'skill-group': return <SkillGroupScreen group={current.params?.group} />;
      case 'timeline': return <TimelineScreen />;
      case 'timeline-detail': return <TimelineDetailScreen index={current.params?.index} />;
      case 'contact': return <ContactScreen />;
      case 'settings': return <SettingsScreen />;
      case 'extras': return <ExtrasScreen />;
      default: return <HomeScreen />;
    }
  })();

  return (
    <div className="relative w-full h-full">
      {screen}
      {loading && <LoadingOverlay text={loadingText} />}
    </div>
  );
}
