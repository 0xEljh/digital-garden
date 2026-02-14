import type { Element, Node, Parent, RootContent } from "hast";
import type {
  MdxJsxAttribute,
  MdxJsxTextElementHast,
} from "mdast-util-mdx-jsx";

type MathTooltipDefinition = {
  tex: string;
  tooltip: string;
};

type HastNode = Node;

function isElement(node: HastNode): node is Element {
  return node.type === "element";
}

function isParent(node: HastNode): node is Parent {
  return Array.isArray((node as Parent).children);
}

function getClassNames(node: HastNode): string[] {
  if (!isElement(node)) return [];
  const className = node.properties?.className;

  if (Array.isArray(className)) {
    return className.filter((x): x is string => typeof x === "string");
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
  visitor: (node: HastNode, parent: Parent | null, index: number | null) => void,
  parent: Parent | null = null,
  index: number | null = null
) {
  visitor(node, parent, index);

  if (!isParent(node)) return;

  const children = node.children as RootContent[];
  for (let i = 0; i < children.length; i++) {
    walk(children[i] as HastNode, visitor, node, i);
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
      if (!isElement(node)) return;

      const classNames = getClassNames(node);
      if (classNames.length === 0) return;

      if (!classNames.includes("math-var-tooltip")) return;

      const id = extractTooltipId(classNames);
      if (id === null) return;

      const tooltip = tooltips[id]?.tooltip;
      if (typeof tooltip !== "string") return;

      const classNameValue = classNames.join(" ");

      const attributes: MdxJsxAttribute[] = [
        { type: "mdxJsxAttribute", name: "tooltip", value: tooltip },
        { type: "mdxJsxAttribute", name: "className", value: classNameValue },
      ];

      const replacement: MdxJsxTextElementHast = {
        type: "mdxJsxTextElement",
        name: "VarTooltip",
        attributes,
        children: node.children,
      };

      parent.children[index] = replacement;
    });
  };
}
