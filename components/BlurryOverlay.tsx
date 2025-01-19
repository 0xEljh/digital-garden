import { Box, BoxProps } from "@chakra-ui/react";
import styled from "@emotion/styled";

const StyledOverlay = styled(Box)`
  background-color: transparent;
  background-image: radial-gradient(transparent 1px, #ffffff 1px);
  background-size: 4px 4px;
  backdrop-filter: blur(3px);
  mask: linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);
  opacity: 1;
`;

interface BlurryOverlayProps extends BoxProps {
  children?: React.ReactNode;
}

export const BlurryOverlay = ({ children, ...props }: BlurryOverlayProps) => {
  return (
    <StyledOverlay {...props}>
      {children}
    </StyledOverlay>
  );
};