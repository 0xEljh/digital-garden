import React, { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import katex from "katex";

interface InlineLatexProps {
  math: string;
  display?: boolean;
}

export function InlineLatex({ math, display = false }: InlineLatexProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return math;
    }
  }, [math, display]);

  return (
    <Box
      as={display ? "div" : "span"}
      display={display ? "block" : "inline"}
      dangerouslySetInnerHTML={{ __html: html }}
      css={{
        ".katex-display": {
          margin: 0,
        },
      }}
    />
  );
}
