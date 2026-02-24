import { useEffect, useRef, useState } from 'react';

const MIN_DURATION_MS = 1500;
const FADE_DURATION_MS = 800;

interface LoadingScreenProps {
  isReady: boolean;
  onFadeStart?: () => void;
}

export function LoadingScreen({ isReady, onFadeStart }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (!isReady) return;

    const elapsed = Date.now() - mountTime.current;
    const remaining = Math.max(0, MIN_DURATION_MS - elapsed);

    const timer = setTimeout(() => {
      setFadeOut(true);
      onFadeStart?.();
    }, remaining);

    return () => clearTimeout(timer);
  }, [isReady, onFadeStart]);

  useEffect(() => {
    if (!fadeOut) return;
    const timer = setTimeout(() => setVisible(false), FADE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [fadeOut]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'hsl(220 20% 5%)',
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
      }}
    >
      <div className="crt-scanlines fixed inset-0 pointer-events-none" />

      <div className="flex items-center font-mono text-sm sm:text-base terminal-glow">
        <span className="text-terminal-prompt font-bold">
          israel@portfolio:~$
        </span>
        <span className="text-terminal-cursor animate-blink ml-1">█</span>
      </div>
    </div>
  );
}
