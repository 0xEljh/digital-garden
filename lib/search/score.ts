/**
 * Case-insensitive subsequence fuzzy score.
 *
 * Returns `-1` when `query` is not a subsequence of `text`. An empty query scores `0` (neutral —
 * everything weakly matches, so the palette can show all records at rest). Otherwise the score is
 * positive and rewards:
 *   - contiguity    — matched chars adjacent in `text` score more than scattered ones
 *   - word-boundary — a char matched at the start of `text`, or right after a separator, scores more
 *
 * Pure and dependency-free; the single hot path behind every keystroke.
 */
export function score(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (q.length === 0) return 0;

  let qi = 0;
  let total = 0;
  let prevMatch = -2; // index of the previous match; -2 ⇒ the first match is never "contiguous"
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;
    let s = 1; // base for any matched char
    if (ti === prevMatch + 1) s += 2; // contiguity: adjacent to the previous match
    const atBoundary = ti === 0 || /[^a-z0-9]/.test(t[ti - 1]);
    if (atBoundary) s += 3; // start of text, or just after a separator
    total += s;
    prevMatch = ti;
    qi += 1;
  }
  return qi === q.length ? total : -1;
}
