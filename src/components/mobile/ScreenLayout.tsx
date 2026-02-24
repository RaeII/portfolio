import { type ReactNode } from 'react';

export function ScreenLayout({ title, softLeft, softRight, children }: {
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

export function MenuList({ items, selectedIndex, onTap }: {
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
