import { type ReactNode } from 'react';
import { usePhone, dispatchPhoneInput } from './PhoneContext';

interface Props {
  children: ReactNode;
}

export function PhoneShell({ children }: Props) {
  const { theme } = usePhone();

  const btn = (label: string, action: Parameters<typeof dispatchPhoneInput>[0], className?: string) => (
    <button
      className={`active:scale-95 active:brightness-125 transition-all select-none ${className || ''}`}
      onClick={() => dispatchPhoneInput(action)}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className={`phone-theme-${theme} flex flex-col items-center w-full h-full`}>
      {/* Phone body */}
      <div className="relative flex flex-col items-center w-[300px] max-w-[95vw] rounded-[36px] bg-gradient-to-b from-[#4e4e5e] via-[#3a3a4a] to-[#28283a] shadow-[0_10px_60px_rgba(0,0,0,0.6)] border border-[#5a5a6a] overflow-hidden">

        {/* Earpiece */}
        <div className="mt-4 w-14 h-[5px] rounded-full bg-[#222] shadow-inner" />

        {/* Screen bezel */}
        <div className="mx-4 mt-3 rounded-lg bg-[#1a1a22] p-[3px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
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
        <div className="mt-2 text-[9px] tracking-[5px] uppercase text-[#666] font-bold select-none">
          ISRAEL
        </div>

        {/* Soft keys */}
        <div className="flex justify-between w-full px-8 mt-3">
          {btn('Menu', 'menu', 'w-16 h-7 rounded-md bg-[#333] text-[#aaa] text-[11px] hover:bg-[#444] shadow-md')}
          {btn('OK', 'ok', 'w-12 h-7 rounded-md bg-[#444] text-[#ccc] text-[11px] font-bold hover:bg-[#555] shadow-md')}
          {btn('Back', 'back', 'w-16 h-7 rounded-md bg-[#333] text-[#aaa] text-[11px] hover:bg-[#444] shadow-md')}
        </div>

        {/* D-Pad */}
        <div className="relative w-[110px] h-[110px] mt-3 mb-2">
          {/* Circular bg */}
          <div className="absolute inset-0 rounded-full bg-[#2a2a35] border border-[#444] shadow-inner" />
          {/* Up */}
          {btn('▲', 'up', 'absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center hover:text-white')}
          {/* Down */}
          {btn('▼', 'down', 'absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center hover:text-white')}
          {/* Left */}
          {btn('◄', 'left', 'absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center hover:text-white')}
          {/* Right */}
          {btn('►', 'right', 'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-[#999] text-lg flex items-center justify-center hover:text-white')}
          {/* Center */}
          {btn('●', 'ok', 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#383848] border border-[#555] text-[#aaa] text-sm flex items-center justify-center hover:bg-[#484858] shadow-md')}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-1 px-8 pb-5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => (
            <button
              key={k}
              className="h-8 rounded-md bg-[#333] text-[#888] text-sm hover:bg-[#444] active:scale-95 transition-all shadow-sm select-none"
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
