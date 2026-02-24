import { PhoneProvider } from './PhoneContext';
import { PhoneShell } from './PhoneShell';
import { PhoneScreens } from './PhoneScreens';

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
