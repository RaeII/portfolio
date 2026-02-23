export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
}

export function parseCommand(input: string): ParsedCommand {
  const tokens: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === " " && !inQuotes) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);

  if (tokens.length === 0) {
    return { command: "", args: [], flags: {} };
  }

  const command = tokens[0].toLowerCase();
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith("--")) {
      const flagName = token.slice(2);
      const nextToken = tokens[i + 1];
      if (nextToken && !nextToken.startsWith("--")) {
        flags[flagName] = nextToken;
        i++;
      } else {
        flags[flagName] = true;
      }
    } else {
      args.push(token);
    }
  }

  return { command, args, flags };
}
