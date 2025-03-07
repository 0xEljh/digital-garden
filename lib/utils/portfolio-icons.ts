import { ComponentType } from "react";

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
  AsciiIconProps,
  BattleBotIcon,
  AirdropIcon,
  BacksimIcon
  
} from "@/components/portfolio/AsciiIcons";

const iconComponents = {
  CryptoChartIcon,
  LightSabreIcon,
  PostQuantumEncryptionIcon,
  DreamboothIcon,
  UnderTheRockIcon,
  ETHTokyo23Icon,
  MaritimeSatelliteIcon,
  EdgeAIIcon,
  CandlestickChartIcon,
  DegenLogoIcon,
  BattleBotIcon,
  AirdropIcon,
  BacksimIcon
};

export const getIconComponent = (
  iconName: string
): ComponentType<AsciiIconProps> => {
  return iconComponents[iconName as keyof typeof iconComponents];
};
