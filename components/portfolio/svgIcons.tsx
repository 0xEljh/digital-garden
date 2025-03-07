// import { Box, BoxProps } from "@chakra-ui/react";
// import { DynamicAsciiImage } from "@/components/common/AsciiImage";
// import {
//   AIBrain,
//   UpChart,
//   Eye,
//   Browser,
//   UnderRock,
//   Wave,
//   Medal,
//   CryptoChart,
//   LightSabre,
//   LockModel,
// } from "@/public/svgs/portfolio-svgs";

// export interface HighlightableIconProps extends BoxProps {
//   // backgroundColor: string;
//   // shadeColor: string;
//   highlightColor: string;
//   isHighlighted: boolean;
// }

// const BACKGROUND_COLOR = "black";
// const SHADE_COLOR = "teal.900";

// export const AIBrainIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box
//       bg={BACKGROUND_COLOR}
//       {...props}
//       transition="background-color 0.5s ease-in-out, color 0.5s ease-in-out"
//     >
//       <AIBrain
//         boxSize={props.boxSize}
//         color={SHADE_COLOR}
//         bg={isHighlighted ? highlightColor : BACKGROUND_COLOR}
//         transition="background-color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const UpChartIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg={BACKGROUND_COLOR}>
//       <UpChart
//         // color={SHADE_COLOR}
//         boxSize={props.boxSize}
//         // color={isHighlighted ? highlightColor : SHADE_COLOR}
//         // bg={SHADE_COLOR}
//         color={SHADE_COLOR}
//         bg={isHighlighted ? highlightColor : BACKGROUND_COLOR}
//         transition="background-color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const EyeIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <Eye
//         boxSize={props.boxSize}
//         bg={SHADE_COLOR}
//         color={isHighlighted ? highlightColor : SHADE_COLOR}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const BrowserIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <Browser
//         boxSize={props.boxSize}
//         bg={SHADE_COLOR}
//         color={isHighlighted ? highlightColor : "black"}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const WaveIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <Wave
//         boxSize={props.boxSize}
//         bg={SHADE_COLOR}
//         color={isHighlighted ? highlightColor : SHADE_COLOR}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const UnderRockIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <UnderRock
//         boxSize={props.boxSize}
//         bg={SHADE_COLOR}
//         color={isHighlighted ? highlightColor : SHADE_COLOR}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const MedalIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <Medal
//         boxSize={props.boxSize}
//         bg={SHADE_COLOR}
//         color={isHighlighted ? highlightColor : SHADE_COLOR}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const CryptoChartIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <CryptoChart
//         boxSize={props.boxSize}
//         bg={SHADE_COLOR}
//         color={isHighlighted ? highlightColor : SHADE_COLOR}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };

// export const LightSabreIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <DynamicAsciiImage imagePath="/images/lightsabre.jpg" />
//   );
// };

// export const LockModelIcon = ({
//   highlightColor,
//   isHighlighted,
//   ...props
// }: HighlightableIconProps) => {
//   return (
//     <Box bg="black">
//       <LockModel
//         boxSize={props.boxSize}
//         bg={BACKGROUND_COLOR}
//         color={isHighlighted ? highlightColor : SHADE_COLOR}
//         transition="color 0.5s ease-in-out"
//       />
//     </Box>
//   );
// };
