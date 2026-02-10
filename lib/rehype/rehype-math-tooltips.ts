type MathTooltipDefinition = {
  tex: string;
  tooltip: string;
};

type HastElement = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children?: any[];
};

type HastNode = HastElement | { type: string; [key: string]: any };

type MdxJsxAttribute = {
  type: "mdxJsxAttribute";
  name: string;
  value?: any;
};

type MdxJsxTextElement = {
  type: "mdxJsxTextElement";
  name: string;
  attributes?: MdxJsxAttribute[];
  children?: any[];
};

function getClassNames(node: HastNode): string[] {
  const props = (node as any)?.properties;
  const className = props?.className;

  if (Array.isArray(className)) {
    return className.filter((x) => typeof x === "string") as string[];
  }

  if (typeof className === "string") {
    return className.split(/\s+/).filter(Boolean);
  }

  return [];
}

function extractTooltipId(classNames: string[]): number | null {
  for (const cn of classNames) {
    const m = /^math-var-tooltip-(\d+)$/.exec(cn);
    if (m) return Number(m[1]);
  }
  return null;
}

function walk(
  node: HastNode,
  visitor: (node: HastNode, parent: HastNode | null, index: number | null) => void,
  parent: HastNode | null = null,
  index: number | null = null
) {
  visitor(node, parent, index);

  const children = (node as any)?.children;
  if (!Array.isArray(children)) return;

  for (let i = 0; i < children.length; i++) {
    walk(children[i], visitor, node, i);
  }
}

export interface RehypeMathTooltipsOptions {
  tooltips?: MathTooltipDefinition[];
}

export function rehypeMathTooltips(options: RehypeMathTooltipsOptions = {}) {
  const tooltips = options.tooltips ?? [];

  return (tree: HastNode) => {
    if (tooltips.length === 0) return;

    walk(tree, (node, parent, index) => {
      if (!parent || index === null) return;
      if ((node as any)?.type !== "element") return;

      const classNames = getClassNames(node);
      if (classNames.length === 0) return;

      if (!classNames.includes("math-var-tooltip")) return;

      const id = extractTooltipId(classNames);
      if (id === null) return;

      const tooltip = tooltips[id]?.tooltip;
      if (typeof tooltip !== "string") return;

      const classNameValue = classNames.join(" ");

      const replacement: MdxJsxTextElement = {
        type: "mdxJsxTextElement",
        name: "VarTooltip",
        attributes: [
          { type: "mdxJsxAttribute", name: "tooltip", value: tooltip },
          { type: "mdxJsxAttribute", name: "className", value: classNameValue },
        ],
        children: (node as any).children ?? [],
      };

      (parent as any).children[index] = replacement;
    });
  };
}
