import type { ThemeName, ModeName } from "@/lib/commands/handlers";

interface Props {
  theme: ThemeName;
  mode: ModeName;
}

export function TerminalHeader({ theme, mode }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-terminal-header border-b border-border">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[hsl(0_70%_55%)]" />
          <div className="w-3 h-3 rounded-full bg-[hsl(45_70%_55%)]" />
          <div className="w-3 h-3 rounded-full bg-[hsl(142_60%_45%)]" />
        </div>
        <span className="text-muted-foreground text-xs ml-3 hidden sm:inline">
          israel@portfolio:~
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="hidden sm:inline">tema:{theme}</span>
        <span className="hidden sm:inline">modo:{mode}</span>
        <span className="text-terminal-dim">portfolio v1.0</span>
      </div>
    </div>
  );
}
