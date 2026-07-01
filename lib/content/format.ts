/** Shared human date format: "Jun 15, 2026". Used by garden meta + link previews. */
export function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
