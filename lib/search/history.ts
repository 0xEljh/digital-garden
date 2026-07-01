/** A recently-executed item, persisted so the palette can show recents when it opens. */
export interface HistoryEntry {
  kind: "record" | "command";
  id: string;
}

/**
 * Prepend `entry`, de-duplicating by (kind, id) so a re-run moves to the front, then cap at
 * `max`. Pure — the localStorage read/write is the component's thin shell.
 */
export function pushHistory(
  history: HistoryEntry[],
  entry: HistoryEntry,
  max = 8,
): HistoryEntry[] {
  const deduped = history.filter(
    (h) => !(h.kind === entry.kind && h.id === entry.id),
  );
  return [entry, ...deduped].slice(0, max);
}
