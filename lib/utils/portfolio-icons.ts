import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { AIBrainIcon, UpChartIcon, EyeIcon, BrowserIcon, UnderRockIcon, WaveIcon, MedalIcon, CryptoChartIcon, LightSabreIcon, LockModelIcon, HighlightableIconProps } from '@/components/svgIcons';

const iconComponents = {
  AIBrainIcon,
  UpChartIcon,
  EyeIcon,
  BrowserIcon,
  UnderRockIcon,
  WaveIcon,
  MedalIcon,
  CryptoChartIcon,
  LightSabreIcon,
  LockModelIcon,
};

export const getIconComponent = (
    iconName: string
  ): ComponentType<HighlightableIconProps> => {
    return iconComponents[iconName as keyof typeof iconComponents];
  };