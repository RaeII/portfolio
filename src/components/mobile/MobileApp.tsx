import { useEffect } from 'react';
import { PhoneProvider } from './PhoneContext';
import { PhoneShell } from './PhoneShell';
import { PhoneScreens } from './PhoneScreens';
import { useKeySound } from './useKeySound';

function PhoneApp() {
  useKeySound();

  return (
    <div className="min-h-screen bg-[#111118] flex items-center justify-center p-3">
      <PhoneShell>
        <PhoneScreens />
      </PhoneShell>
    </div>
  );
}

export function MobileApp({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <PhoneProvider>
      <PhoneApp />
    </PhoneProvider>
  );
}
