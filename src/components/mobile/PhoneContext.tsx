import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';

export type PhoneTheme = 'green' | 'gray' | 'amber';

export interface ScreenEntry {
  id: string;
  params?: Record<string, any>;
}

interface PhoneContextType {
  stack: ScreenEntry[];
  current: ScreenEntry;
  push: (id: string, params?: Record<string, any>) => void;
  back: () => void;
  theme: PhoneTheme;
  setTheme: (t: PhoneTheme) => void;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
}

const PhoneCtx = createContext<PhoneContextType>(null!);

export function usePhone() {
  return useContext(PhoneCtx);
}

/* ── Input event bus (DOM CustomEvent) ── */

export function dispatchPhoneInput(type: 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'menu') {
  window.dispatchEvent(new CustomEvent('phone-input', { detail: type }));
}

export function usePhoneInput(handler: (type: string) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const fn = (e: Event) => handlerRef.current((e as CustomEvent).detail);
    window.addEventListener('phone-input', fn);
    return () => window.removeEventListener('phone-input', fn);
  }, []);
}

/* ── Reusable menu navigation hook ── */

export function useMenuNav(itemCount: number, onOk?: (index: number) => void) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const indexRef = useRef(selectedIndex);
  indexRef.current = selectedIndex;

  // Reset selection when item count changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [itemCount]);

  usePhoneInput(useCallback((type: string) => {
    if (type === 'up') setSelectedIndex(i => Math.max(0, i - 1));
    else if (type === 'down') setSelectedIndex(i => Math.min(itemCount - 1, i + 1));
    else if (type === 'ok' && onOk) onOk(indexRef.current);
  }, [itemCount, onOk]));

  return { selectedIndex, setSelectedIndex };
}

/* ── Provider ── */

const LS_KEY_SOUND = 'phone-sound-on';

function readSoundPref(): boolean {
  try {
    return localStorage.getItem(LS_KEY_SOUND) === 'true';
  } catch {
    return false;
  }
}

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ScreenEntry[]>([{ id: 'home' }]);
  const [theme, setTheme] = useState<PhoneTheme>('green');
  const [soundOn, _setSoundOn] = useState(readSoundPref);

  const setSoundOn = useCallback((v: boolean) => {
    _setSoundOn(v);
    try { localStorage.setItem(LS_KEY_SOUND, String(v)); } catch {}
  }, []);

  const push = useCallback((id: string, params?: Record<string, any>) => {
    setStack(s => [...s, { id, params }]);
  }, []);

  const back = useCallback(() => {
    setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const current = stack[stack.length - 1];

  // Keyboard support for desktop testing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        Enter: 'ok',
        Escape: 'back',
      };
      if (map[e.key]) {
        e.preventDefault();
        dispatchPhoneInput(map[e.key] as any);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Global back handler
  usePhoneInput(useCallback((type: string) => {
    if (type === 'back') back();
  }, [back]));

  return (
    <PhoneCtx.Provider value={{ stack, current, push, back, theme, setTheme, soundOn, setSoundOn }}>
      {children}
    </PhoneCtx.Provider>
  );
}
