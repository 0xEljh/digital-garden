type MathTooltipDefinition = {
  tex: string;
  tooltip: string;
};

type TooltipPattern = {
  id: number;
  tex: string;
};

type Match = {
  start: number;
  end: number;
  id: number;
};

function collectMatches(input: string, patterns: TooltipPattern[]): Match[] {
  const matches: Match[] = [];

  for (const p of patterns) {
    let idx = input.indexOf(p.tex);
    while (idx !== -1) {
      matches.push({ start: idx, end: idx + p.tex.length, id: p.id });
      idx = input.indexOf(p.tex, idx + p.tex.length);
    }
  }

  return matches;
}

function wrapTooltipMatches(input: string, patterns: TooltipPattern[]): string {
  const matches = collectMatches(input, patterns);
  if (matches.length === 0) return input;

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const lenA = a.end - a.start;
    const lenB = b.end - b.start;
    if (lenA !== lenB) return lenB - lenA;
    return a.id - b.id;
  });

  const chosen: Match[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    chosen.push(m);
    cursor = m.end;
  }

  let out = "";
  let last = 0;
  for (const m of chosen) {
    const matched = input.slice(m.start, m.end);
    out += input.slice(last, m.start);
    out += `\\htmlClass{math-var-tooltip math-var-tooltip-${m.id}}{${matched}}`;
    last = m.end;
  }
  out += input.slice(last);

  return out;
}

function walk(node: any, fn: (n: any) => void) {
  fn(node);

  const children = node?.children;
  if (!Array.isArray(children)) return;

  for (const child of children) {
    walk(child, fn);
  }
}

function overwriteTextDescendants(children: any, nextValue: string) {
  if (!Array.isArray(children)) return;

  for (const child of children) {
    if (child?.type === "text" && typeof child.value === "string") {
      child.value = nextValue;
    }

    if (Array.isArray(child?.children)) {
      overwriteTextDescendants(child.children, nextValue);
    }
  }
}

export interface RemarkMathTooltipsOptions {
  tooltips?: MathTooltipDefinition[];
}

export function remarkMathTooltips(options: RemarkMathTooltipsOptions = {}) {
  const tooltips = options.tooltips ?? [];
  const patterns: TooltipPattern[] = tooltips
    .map((t, id) => ({ id, tex: t?.tex }))
    .filter((t): t is TooltipPattern => typeof t.tex === "string" && t.tex.length > 0);

  return (tree: any) => {
    if (patterns.length === 0) return;

    walk(tree, (node) => {
      if (
        (node?.type === "inlineMath" || node?.type === "math") &&
        typeof node.value === "string"
      ) {
        const nextValue = wrapTooltipMatches(node.value, patterns);
        node.value = nextValue;

        overwriteTextDescendants(node?.data?.hChildren, nextValue);
      }
    });
  };
}
