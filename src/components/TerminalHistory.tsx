import { motion } from "framer-motion";
import type { HistoryEntry } from "./Terminal";

interface Props {
  entries: HistoryEntry[];
}

export function TerminalHistory({ entries }: Props) {
  return (
    <div className="space-y-1">
      {entries.map((entry, i) => (
        <motion.div
          key={`${entry.timestamp}-${i}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: i > entries.length - 3 ? 0.05 : 0 }}
        >
          {entry.type === "input" ? (
            <div className="flex items-start gap-0 flex-wrap">
              <span className="text-terminal-prompt font-bold shrink-0">israel@portfolio:~$</span>
              <span className="ml-2 text-foreground">{entry.content}</span>
            </div>
          ) : typeof entry.content === "string" ? (
            <pre className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-mono text-xs sm:text-sm break-words">
              {processOutput(entry.content)}
            </pre>
          ) : (
            <div className="text-foreground/90 leading-relaxed font-mono text-xs sm:text-sm">
              {entry.content}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function processOutput(content: string): React.ReactNode {
  // Make URLs clickable, handle download link
  const lines = content.split("\n");
  return lines.map((line, i) => {
    // Special: download PDF link
    if (line.includes("[↓ DOWNLOAD PDF]")) {
      return (
        <span key={i}>
          {"  "}
          <a
            href={`${import.meta.env.BASE_URL}israel_zeferino_dev.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-terminal-link underline hover:text-primary transition-colors cursor-pointer"
          >
            [↓ DOWNLOAD PDF]
          </a>
          {"\n"}
        </span>
      );
    }
    // URLs
    if (line.includes("github.com") || line.includes("linkedin.com") || line.includes("http")) {
      const urlRegex = /(https?:\/\/[^\s]+|github\.com\/[^\s]+|linkedin\.com\/[^\s]+)/g;
      const parts = line.split(urlRegex);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            urlRegex.test(part) ? (
              <a
                key={j}
                href={part.startsWith("http") ? part : `https://${part}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-link underline hover:text-primary transition-colors"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
          {i < lines.length - 1 ? "\n" : ""}
        </span>
      );
    }
    return i < lines.length - 1 ? line + "\n" : line;
  });
}
