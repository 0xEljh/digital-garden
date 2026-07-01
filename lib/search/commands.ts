import { score } from "./score";
import type { SearchRecord } from "./types";

/** The side-effect surface a command's `run` is handed by the palette at execution time. */
export interface CommandContext {
  /** Close the palette and go to a url (internal route, or a raw .xml / http asset). */
  navigate: (url: string) => void;
  /** Print a one-line, in-world response and keep the palette open (eggs). */
  printLine: (line: string) => void;
  /** The full search index, for commands like /random. */
  records: SearchRecord[];
}

export type CommandKind = "navigate" | "action" | "egg";

export interface Command {
  id: string;
  verb: string; // slash-free, e.g. "random"
  label: string; // display form, e.g. "/random"
  hint: string; // right-meta description
  kind: CommandKind;
  run: (ctx: CommandContext) => void;
}

export type ParsedInput =
  | { mode: "search"; query: string }
  | { mode: "command"; verb: string; arg: string };

/** Split raw input: a leading "/" is command mode (verb + optional arg), else search. */
export function parseInput(raw: string): ParsedInput {
  if (!raw.startsWith("/")) return { mode: "search", query: raw };
  const rest = raw.slice(1);
  const sp = rest.indexOf(" ");
  const verb = (sp === -1 ? rest : rest.slice(0, sp)).toLowerCase();
  const arg = sp === -1 ? "" : rest.slice(sp + 1);
  return { mode: "command", verb, arg };
}

/**
 * Filter the registry by a typed verb fragment. An empty fragment lists the browsable commands
 * (eggs stay hidden — discovered, not advertised); a non-empty fragment fuzzy-matches every
 * command, so a known egg surfaces when you type toward it.
 */
export function matchCommands(commands: Command[], verb: string): Command[] {
  if (verb === "") return commands.filter((c) => c.kind !== "egg");
  return commands
    .map((c) => ({ c, s: score(verb, c.verb) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}

function cmd(
  verb: string,
  hint: string,
  kind: CommandKind,
  run: (ctx: CommandContext) => void,
): Command {
  return { id: `cmd:${verb}`, verb, label: `/${verb}`, hint, kind, run };
}

/** The command registry. Nav verbs are browsable; eggs are hidden until typed toward. */
export const COMMANDS: Command[] = [
  cmd("random", "jump to a random note", "action", (ctx) => {
    const posts = ctx.records.filter((r) => r.type === "post");
    const pick = posts[Math.floor(Math.random() * posts.length)];
    if (pick) ctx.navigate(pick.url);
  }),
  cmd("home", "back to spawn", "navigate", (ctx) => ctx.navigate("/")),
  cmd("posts", "the garden", "navigate", (ctx) => ctx.navigate("/posts")),
  cmd("portfolio", "projects & work", "navigate", (ctx) => ctx.navigate("/portfolio")),
  cmd("dashboard", "time-accounting", "navigate", (ctx) => ctx.navigate("/dashboard")),
  // cmd("rss", "subscribe", "navigate", (ctx) => ctx.navigate("/rss.xml")),
  // Eggs — hidden from the browse list; resolve when typed toward.
  cmd("whoami", "?", "egg", (ctx) => ctx.printLine("behind the glass.")),
  cmd("respawn", "?", "egg", (ctx) => ctx.navigate("/")),
];
