/**
 * Resolve a post's "last tended" date.
 *
 * Precedence: explicit frontmatter `tended` override → last git commit touching
 * the file → fall back to the planted date with a warning (covers untracked
 * drafts and git-less build environments). We store only the single most-recent
 * date, never a commit count.
 *
 * The git call is injected (`exec`) so this stays a pure, unit-testable function.
 */

export type GitExec = (args: string[]) => Promise<string>;

export type TendedSource = "frontmatter" | "git" | "fallback";

export interface TendedResult {
  tended: string;
  source: TendedSource;
  warning?: string;
}

function isValidDate(s: string): boolean {
  return !!s && !Number.isNaN(new Date(s).getTime());
}

export async function resolveTended(opts: {
  filePath: string;
  override?: string | null;
  planted: string;
  exec: GitExec;
}): Promise<TendedResult> {
  const { filePath, override, planted, exec } = opts;

  if (override != null && override !== "") {
    if (isValidDate(override)) {
      return { tended: override, source: "frontmatter" };
    }
    return {
      tended: planted,
      source: "fallback",
      warning: `invalid tended override "${override}" in ${filePath}, using planted date`,
    };
  }

  try {
    const out = (await exec(["log", "-1", "--format=%cI", "--", filePath])).trim();
    if (isValidDate(out)) {
      return { tended: out, source: "git" };
    }
    return {
      tended: planted,
      source: "fallback",
      warning: `no git history for ${filePath} (untracked?), tended = planted`,
    };
  } catch (err) {
    return {
      tended: planted,
      source: "fallback",
      warning: `git unavailable for ${filePath} (${
        (err as Error).message
      }), tended = planted`,
    };
  }
}
