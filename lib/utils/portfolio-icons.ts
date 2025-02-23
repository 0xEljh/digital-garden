import dynamic from "next/dynamic";
import { ComponentType } from "react";
import {
  AIBrainIcon,
  UpChartIcon,
  EyeIcon,
  BrowserIcon,
  WaveIcon,
  MedalIcon,
  LockModelIcon,
  HighlightableIconProps,
} from "@/components/portfolio/svgIcons";

import {
  LightSabreIcon,
  PostQuantumEncryptionIcon,
  DreamboothIcon,
  CryptoChartIcon,
  UnderTheRockIcon,
  ETHTokyo23Icon,
  MaritimeSatelliteIcon,
  EdgeAIIcon,
  CandlestickChartIcon,
  DegenLogoIcon,
} from "@/components/portfolio/AsciiIcons";

const iconComponents = {
  AIBrainIcon,
  UpChartIcon,
  EyeIcon,
  BrowserIcon,
  WaveIcon,
  MedalIcon,
  CryptoChartIcon,
  LightSabreIcon,
  LockModelIcon,
  PostQuantumEncryptionIcon,
  DreamboothIcon,
  UnderTheRockIcon,
  ETHTokyo23Icon,
  MaritimeSatelliteIcon,
  EdgeAIIcon,
  CandlestickChartIcon,
  DegenLogoIcon,
};

export const getIconComponent = (
  iconName: string
): ComponentType<HighlightableIconProps> => {
  return iconComponents[iconName as keyof typeof iconComponents];
};
