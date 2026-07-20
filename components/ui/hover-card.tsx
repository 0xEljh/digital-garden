import { HoverCard as ChakraHoverCard, Portal } from "@chakra-ui/react";
import * as React from "react";

interface HoverCardContentProps extends ChakraHoverCard.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

/** Portalled, positioned hover-card content — mirrors the popover wrapper. */
export const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  HoverCardContentProps
>(function HoverCardContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props;
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraHoverCard.Positioner>
        <ChakraHoverCard.Content
          ref={ref}
          {...rest}
          _open={{ _motionReduce: { animationName: "fade-in", transform: "none" } }}
          _closed={{ _motionReduce: { animationName: "fade-out", transform: "none" } }}
        />
      </ChakraHoverCard.Positioner>
    </Portal>
  );
});

export const HoverCardArrow = React.forwardRef<
  HTMLDivElement,
  ChakraHoverCard.ArrowProps
>(function HoverCardArrow(props, ref) {
  return (
    <ChakraHoverCard.Arrow {...props} ref={ref}>
      <ChakraHoverCard.ArrowTip />
    </ChakraHoverCard.Arrow>
  );
});

export const HoverCardRoot = ChakraHoverCard.Root;
export const HoverCardTrigger = ChakraHoverCard.Trigger;
