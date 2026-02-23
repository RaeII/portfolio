import { motion } from "framer-motion";

interface Props {
  commands: string[];
  onCommand: (cmd: string) => void;
}

export function CommandChips({ commands, onCommand }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-2">
      {commands.map((cmd, i) => (
        <motion.button
          key={cmd}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.05 }}
          onClick={() => onCommand(cmd)}
          className="px-3 py-1 text-xs font-mono rounded border border-border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:terminal-glow cursor-pointer"
        >
          {cmd}
        </motion.button>
      ))}
    </div>
  );
}
