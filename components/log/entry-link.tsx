import {
  Link as ChakraLink,
  Text,
  type LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";
import NextLink from "next/link";
import * as React from "react";
import { classifyHref } from "@/lib/links/classify";
import { glyphForStage } from "@/lib/content/schema";
import { SITE } from "@/lib/site";
import type { SearchRecord } from "@/lib/search/types";
import searchIndex from "@/lib/generated/search-index.json";
import {
  LinkPreviewCard,
  type LinkPreview,
} from "@/components/log/link-preview-card";
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

/** Slug -> preview, lifted once from the search index (post records already
 *  carry title/excerpt/state/updated — no new build artifact). */
const PREVIEW_BY_SLUG: Map<string, LinkPreview> = (() => {
  const map = new Map<string, LinkPreview>();
  for (const r of searchIndex.records as unknown as SearchRecord[]) {
    if (r.type !== "post") continue;
    const slug = r.id.startsWith("post:")
      ? r.id.slice("post:".length)
      : r.url.replace(/^\/posts\//, "");
    map.set(slug, {
      slug,
      title: r.title,
      excerpt: r.subtitle ?? "",
      url: r.url,
      stage: r.stage,
      tended: r.tended,
    });
  }
  return map;
})();

/** Shared prose-link look: accent, never underlined (underlines fight the
 *  display faces); hover brightens the color instead of decorating the text. */
const linkStyle = {
  color: "accent",
  textDecoration: "none",
  transition: "color 0.15s ease",
  _hover: { color: "accent.emphasized", textDecoration: "none" },
} as const;

/** ChakraLink (styling) over NextLink (routing), forwardRef so it can be a
 *  HoverCard trigger — the ref must reach the real <a>. */
const ProseAnchor = React.forwardRef<
  HTMLAnchorElement,
  ChakraLinkProps & { href?: string }
>(function ProseAnchor({ href = "#", children, ...rest }, ref) {
  return (
    <ChakraLink ref={ref} asChild {...linkStyle} {...rest}>
      <NextLink href={href}>{children}</NextLink>
    </ChakraLink>
  );
});

/**
 * The MDX `a` renderer. Classifies the href and applies the typed-glyph
 * language: internal post links carry the target's state glyph + a hover
 * preview and stay in-tab; the glyph's presence/absence is itself the
 * internal-vs-external cue, so external links need no marker — they just open
 * in a new tab. Everything else is a plain in-tab anchor.
 */
export function EntryLink(props: Record<string, unknown>) {
  // MDX also hands us a hast `node` — must not spread it onto the DOM.
  const {
    href,
    children,
    node: _node,
    ...rest
  } = props as {
    href?: string;
    children?: React.ReactNode;
    node?: unknown;
  } & Record<string, unknown>;
  void _node;

  const cls = classifyHref(href, SITE.url);

  if (cls.kind === "external") {
    return (
      <ProseAnchor
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </ProseAnchor>
    );
  }

  if (cls.kind === "post") {
    const preview = PREVIEW_BY_SLUG.get(cls.slug);
    if (preview) {
      return (
        <HoverCardRoot
          openDelay={180}
          closeDelay={120}
          positioning={{ placement: "top", gutter: 6 }}
        >
          <HoverCardTrigger asChild>
            <ProseAnchor href={href} {...rest}>
              {preview.stage && (
                <Text
                  as="span"
                  color={`state.${preview.stage}`}
                  fontFamily="mono"
                  mr="0.2em"
                  aria-hidden="true"
                >
                  {glyphForStage(preview.stage)}
                </Text>
              )}
              {children}
            </ProseAnchor>
          </HoverCardTrigger>
          <HoverCardContent
            bg="surface.panel"
            borderWidth="1px"
            borderColor="accent.subtle"
            borderRadius="md"
            boxShadow="lg"
            maxW="320px"
            p={3}
          >
            <LinkPreviewCard preview={preview} />
          </HoverCardContent>
        </HoverCardRoot>
      );
    }
    // Internal post link with no index entry — plain in-tab.
    return (
      <ProseAnchor href={href} {...rest}>
        {children}
      </ProseAnchor>
    );
  }

  // internal non-post, anchor, mailto/tel/other → plain in-tab anchor.
  return (
    <ProseAnchor href={href} {...rest}>
      {children}
    </ProseAnchor>
  );
}
