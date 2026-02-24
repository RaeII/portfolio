import { type ReactNode } from 'react';
import { usePhone, dispatchPhoneInput } from './PhoneContext';

interface Props {
  children: ReactNode;
}

export function PhoneShell({ children }: Props) {
  const { theme } = usePhone();

  const btn = (label: string, action: Parameters<typeof dispatchPhoneInput>[0], className?: string) => (
    <button
      className={`phone-btn select-none ${className || ''}`}
      onClick={() => dispatchPhoneInput(action)}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className={`phone-theme-${theme} flex flex-col items-center w-full h-full`}>
      {/* Phone body */}
      <div className="phone-body relative flex flex-col items-center w-[300px] max-w-[95vw] rounded-[36px] overflow-hidden">
        {/* Edge curvature overlay */}
        <div className="phone-edge-overlay" />

        {/* Earpiece */}
        <div
          className="mt-4 w-14 h-[5px] rounded-full bg-[#1a1a22]"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06)' }}
        />

        {/* Screen bezel */}
        <div
          className="mx-4 mt-3 rounded-lg bg-[#1a1a22] p-[3px]"
          style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.7), inset 0 0 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          {/* LCD Screen */}
          <div
            className="relative w-[248px] h-[340px] rounded-md overflow-hidden"
            style={{ backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text)' }}
          >
            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px)',
              }}
            />
            {/* Content */}
            <div className="relative z-0 w-full h-full phone-screen-area">
              {children}
            </div>
          </div>
        </div>

        {/* Brand */}
        <div
          className="mt-2 text-[9px] tracking-[5px] uppercase font-bold select-none"
          style={{ color: '#555', textShadow: '0 1px 0 rgba(255,255,255,0.06)' }}
        >
          ISRAEL
        </div>

        {/* Soft keys */}
        <div className="flex justify-between w-full px-8 mt-3">
          {btn('Menu', 'menu', 'phone-btn-soft w-16 h-7 rounded-md bg-[#333] text-[#aaa] text-[11px] hover:bg-[#3a3a3a]')}
          {btn('OK', 'ok', 'phone-btn-soft w-12 h-7 rounded-md bg-[#444] text-[#ccc] text-[11px] font-bold hover:bg-[#4a4a4a]')}
          {btn('Back', 'back', 'phone-btn-soft w-16 h-7 rounded-md bg-[#333] text-[#aaa] text-[11px] hover:bg-[#3a3a3a]')}
        </div>

        {/* D-Pad */}
        <div className="relative w-[110px] h-[110px] mt-3 mb-2">
          {/* Circular bg */}
          <div className="absolute inset-0 rounded-full bg-[#2a2a35] border border-[#444] phone-dpad-ring" />
          {/* Up */}
          {btn('▲', 'up', 'absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center active:scale-90 active:text-white')}
          {/* Down */}
          {btn('▼', 'down', 'absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center active:scale-90 active:text-white')}
          {/* Left */}
          {btn('◄', 'left', 'absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center active:scale-90 active:text-white')}
          {/* Right */}
          {btn('►', 'right', 'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center active:scale-90 active:text-white')}
          {/* Center */}
          {btn('●', 'ok', 'phone-btn-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#383848] border border-[#555] text-[#aaa] text-sm flex items-center justify-center hover:bg-[#484858] active:scale-95')}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-1 px-8 pb-5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => (
            <button
              key={k}
              className="phone-btn phone-btn-num h-8 rounded-md bg-[#333] text-[#888] text-sm hover:bg-[#3a3a3a] select-none"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Table surface shadow */}
      <div className="phone-table-shadow" />
    </div>
  );
}
