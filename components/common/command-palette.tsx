import { Box, Input, Text, VisuallyHidden } from "@chakra-ui/react";
import { DialogContent, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { useAnalytics } from "@/components/common/analytics-provider";
import { DEFAULT_DISPLAY_THEME } from "@/lib/display-theme";
import { search } from "@/lib/search/search";
import {
  COMMANDS,
  matchCommands,
  parseInput,
  type Command,
  type CommandContext,
} from "@/lib/search/commands";
import { pushHistory, type HistoryEntry } from "@/lib/search/history";
import type { SearchRecord } from "@/lib/search/types";
import { STAGE_GLYPH } from "@/lib/content/schema";
import searchIndex from "@/lib/generated/search-index.json";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

const RECORDS = searchIndex.records as unknown as SearchRecord[];
const LIMIT = 8;
const HISTORY_KEY = "cmdk:history";
const optionId = (i: number) => `cmdk-option-${i}`;

function recordGlyph(r: SearchRecord): { glyph: string; color: string } {
  if (r.type === "post" && r.stage) {
    return { glyph: STAGE_GLYPH[r.stage], color: `state.${r.stage}` };
  }
  if (r.type === "project") return { glyph: "◆", color: "accent" };
  return { glyph: "→", color: "accent" };
}

function recordMeta(r: SearchRecord): { label: string; color: string } {
  if (r.type === "post" && r.stage) return { label: r.stage, color: `state.${r.stage}` };
  if (r.type === "project") return { label: "project", color: "text.meta" };
  return { label: "page", color: "text.meta" };
}

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
  );
}

/** Unified view-model so search results and commands flow through one combobox. */
interface Row {
  key: string;
  glyph: string;
  glyphColor: string;
  title: string;
  titleFont: "heading" | "mono";
  subtitle?: string;
  meta: string;
  metaColor: string;
  run: () => void;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

interface PaletteProps {
  open: boolean;
  seed: string;
  onOpenChange: (open: boolean) => void;
}

function CommandPalette({ open, seed, onOpenChange }: PaletteProps) {
  const router = useRouter();
  const posthog = useAnalytics();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [output, setOutput] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Fresh state each open: seed the input (so "/" lands in command mode), load recents,
  // focus the field once mounted.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      setQuery(seed);
      setActive(0);
      setOutput(null);
      setHistory(loadHistory());
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, seed]);

  const ctx: CommandContext = useMemo(
    () => ({
      navigate: (url) => {
        onOpenChange(false);
        if (/^https?:|\.xml(\?|$)/.test(url)) window.location.assign(url);
        else void router.push(url);
      },
      printLine: (line) => setOutput(line),
      records: RECORDS,
      theme: theme ?? DEFAULT_DISPLAY_THEME,
      setTheme: (next) => setTheme(next),
      capture: (event, props) => posthog?.capture(event, props),
    }),
    [onOpenChange, posthog, router, setTheme, theme],
  );

  const remember = useCallback((entry: HistoryEntry) => {
    setHistory((h) => {
      const next = pushHistory(h, entry);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* private mode / disabled storage — recents simply won't persist */
      }
      return next;
    });
  }, []);

  const go = useCallback(
    (record: SearchRecord) => {
      posthog?.capture("command_palette_execute", {
        kind: "navigate",
        target: record.url,
        type: record.type,
      });
      remember({ kind: "record", id: record.id });
      ctx.navigate(record.url);
    },
    [posthog, remember, ctx],
  );

  const runCommand = useCallback(
    (command: Command, arg: string) => {
      posthog?.capture("command_palette_execute", {
        kind: command.kind,
        target: command.verb,
        arg: arg || undefined,
      });
      remember({ kind: "command", id: command.id });
      command.run(ctx, arg);
    },
    [posthog, remember, ctx],
  );

  const recordRow = useCallback(
    (record: SearchRecord): Row => {
      const g = recordGlyph(record);
      const m = recordMeta(record);
      return {
        key: record.id,
        glyph: g.glyph,
        glyphColor: g.color,
        title: record.title,
        titleFont: "heading",
        subtitle: record.subtitle,
        meta: m.label,
        metaColor: m.color,
        run: () => go(record),
      };
    },
    [go],
  );

  const commandRow = useCallback(
    (command: Command, arg = ""): Row => ({
      key: command.id,
      glyph: command.kind === "egg" ? "?" : "›",
      glyphColor: "accent",
      title: command.label,
      titleFont: "mono",
      meta: command.hint,
      metaColor: "text.meta",
      run: () => runCommand(command, arg),
    }),
    [runCommand],
  );

  const { rows, label } = useMemo(() => {
    const parsed = parseInput(query);
    if (parsed.mode === "command") {
      return {
        rows: matchCommands(COMMANDS, parsed.verb).map((command) =>
          commandRow(command, parsed.arg),
        ),
        label: "commands",
      };
    }
    if (parsed.query.trim() === "") {
      const recents = history
        .map((h) =>
          h.kind === "record"
            ? RECORDS.find((r) => r.id === h.id)
              ? recordRow(RECORDS.find((r) => r.id === h.id)!)
              : null
            : COMMANDS.find((c) => c.id === h.id)
              ? commandRow(COMMANDS.find((c) => c.id === h.id)!)
              : null,
        )
        .filter((r): r is Row => r !== null);
      if (recents.length) return { rows: recents, label: "recent" };
      return { rows: RECORDS.slice(0, LIMIT).map(recordRow), label: "jump to" };
    }
    return {
      rows: search(RECORDS, parsed.query, LIMIT).map(({ record }) => recordRow(record)),
      label: "results",
    };
  }, [query, history, recordRow, commandRow]);

  const isCommandMode = query.startsWith("/");

  // Keep the active row in view (browsers don't scroll for aria-activedescendant).
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, rows]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      rows[active]?.run();
    }
  };

  const activeId = rows.length ? optionId(active) : undefined;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="top"
      size="lg"
      scrollBehavior="inside"
    >
      <DialogContent
        position="relative"
        overflow="hidden"
        p={0}
        w="full"
        maxW="2xl"
        bg="gray.950"
        borderWidth="1px"
        borderColor="accent.subtle"
        rounded="l3"
        fontFamily="mono"
        shadow="lg"
      >
        <Box
          aria-hidden
          position="absolute"
          inset={0}
          pointerEvents="none"
          zIndex={0}
          opacity={0.5}
          backgroundImage="repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)"
        />

        <Box position="relative" zIndex={1}>
          <VisuallyHidden>
            <DialogTitle>Command palette</DialogTitle>
          </VisuallyHidden>

          <Box borderBottomWidth="1px" borderColor="gray.800" px={4}>
            <Input
              ref={inputRef}
              role="combobox"
              aria-expanded
              aria-controls="cmdk-listbox"
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-label="Search the log, or type / for commands"
              placeholder="search the log — or / for commands"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                setOutput(null);
              }}
              onKeyDown={onKeyDown}
              size="lg"
              fontFamily="mono"
              border="none"
              bg="transparent"
              px={0}
              caretColor="accent"
              _focusVisible={{ outline: "none", boxShadow: "none" }}
              _placeholder={{ color: "gray.600" }}
            />
          </Box>

          {output && (
            <Box
              px={4}
              py={2}
              borderBottomWidth="1px"
              borderColor="gray.800"
              fontSize="sm"
              color="accent.emphasized"
            >
              → {output}
            </Box>
          )}

          <Box
            ref={listRef}
            as="ul"
            id="cmdk-listbox"
            role="listbox"
            aria-label="Results"
            maxH="320px"
            overflowY="auto"
            py={2}
            listStyleType="none"
          >
            <Text px={4} pb={1} fontSize="2xs" letterSpacing="wide" color="gray.600">
              {label}
            </Text>

            {rows.length === 0 ? (
              <Text px={4} py={2} fontSize="sm" color="text.meta">
                {isCommandMode
                  ? "no command matches."
                  : `no matches for "${query}".`}
              </Text>
            ) : (
              rows.map((row, i) => {
                const selected = i === active;
                return (
                  <Box
                    as="li"
                    key={row.key}
                    id={optionId(i)}
                    data-index={i}
                    role="option"
                    aria-selected={selected}
                    onMouseMove={() => setActive(i)}
                    onClick={() => row.run()}
                    cursor="pointer"
                    px={4}
                    py={2}
                    borderLeftWidth="2px"
                    borderColor={selected ? "accent" : "transparent"}
                    bg={selected ? "whiteAlpha.100" : "transparent"}
                    display="flex"
                    alignItems="baseline"
                    gap={3}
                  >
                    <Box
                      as="span"
                      w={4}
                      flexShrink={0}
                      color={row.glyphColor}
                      textAlign="center"
                    >
                      {row.glyph}
                    </Box>
                    <Box flex={1} minW={0}>
                      <Text fontFamily={row.titleFont} fontSize="sm" color="fg" truncate>
                        {row.title}
                      </Text>
                      {row.subtitle && (
                        <Text fontSize="xs" color="text.meta" truncate>
                          {row.subtitle}
                        </Text>
                      )}
                    </Box>
                    <Box as="span" flexShrink={0} fontSize="xs" color={row.metaColor}>
                      {row.meta}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Box
            borderTopWidth="1px"
            borderColor="gray.800"
            px={4}
            py={2}
            fontSize="xs"
            color="gray.600"
          >
            ↑↓ navigate · ↵ select · esc close
            {!isCommandMode && " · / for commands"}
          </Box>
        </Box>
      </DialogContent>
    </DialogRoot>
  );
}

const CommandPaletteContext = createContext<{
  open: (via?: string, seed?: string) => void;
} | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState("");
  const posthog = useAnalytics();

  const summon = useCallback(
    (via: string, seedValue: string) => {
      setSeed(seedValue);
      setOpen(true);
      posthog?.capture("command_palette_opened", { via });
      if (via === "nav") posthog?.capture("nav_search_open");
    },
    [posthog],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else summon("key", "");
        return;
      }
      // "/" summons straight into command mode — but never while typing in a field.
      if (e.key === "/" && !open && !isEditable(e.target)) {
        e.preventDefault();
        summon("slash", "/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, summon]);

  const value = useMemo(
    () => ({ open: (via = "api", seedValue = "") => summon(via, seedValue) }),
    [summon],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} seed={seed} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}
