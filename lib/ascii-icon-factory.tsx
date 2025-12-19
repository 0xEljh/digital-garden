"use client";

import { ComponentType, useMemo } from "react";
import { BoxProps } from "@chakra-ui/react";
import {
    DynamicAsciiImage,
    DynamicScrambledAsciiImage,
} from "@/components/common/ascii-image";


/**
 * Configuration for an ASCII icon
 */
export interface AsciiIconConfig {
    /** Path to the image file in /public */
    imagePath: string;
    /** Font size ratio relative to width (default: 0.0083, which gives 2px at width=240) */
    fontSizeRatio?: number;
    /** Width divisor for scaling (default: 1, use 2 for half-size images) */
    widthDivisor?: number;
    /** Default sample factor for ASCII conversion (default: 2) */
    sampleFactor?: number;
}

/**
 * Props for ASCII icon components
 */
export interface AsciiIconProps extends BoxProps {
    width?: number;
    sampleFactor?: number;
    fontSize?: string;
    highlightColor?: string;
    isHighlighted?: boolean;
    scrambleAnimationDuration?: number;
    noAnimation?: boolean;
}

// ============ Icon Registry ============

/**
 * Central registry of all ASCII icon configurations.
 * To add a new icon, simply add an entry here.
 */
const ICON_CONFIGS = {
    LightSabreIcon: {
        imagePath: "/images/lightsabre.jpg",
        fontSizeRatio: 0.0166,
        widthDivisor: 2,
    },
    PostQuantumEncryptionIcon: {
        imagePath: "/images/post-quantum-encryption.jpg",
    },
    DreamboothIcon: {
        imagePath: "/images/dreambooth.jpg",
    },
    CryptoChartIcon: {
        imagePath: "/images/crypto-candlestick-charts.jpg",
    },
    CandlestickChartIcon: {
        imagePath: "/images/candlestick-charts.jpg",
    },
    UnderTheRockIcon: {
        imagePath: "/images/under-the-rock.jpg",
        fontSizeRatio: 0.0166,
        widthDivisor: 2,
    },
    ETHTokyo23Icon: {
        imagePath: "/images/ethtokyo23-square.jpg",
    },
    EdgeAIIcon: {
        imagePath: "/images/edge-ai.jpg",
    },
    MaritimeSatelliteIcon: {
        imagePath: "/images/maritime-satellite.jpg",
    },
    DegenLogoIcon: {
        imagePath: "/images/degen-logo.jpg",
    },
    BattleBotIcon: {
        imagePath: "/images/edhbattlebot.jpg",
    },
    AirdropIcon: {
        imagePath: "/images/airdrop.jpg",
    },
    BacksimIcon: {
        imagePath: "/images/backsim.jpg",
    },
    TeatheGatheringLogoIcon: {
        imagePath: "images/teathegathering.jpg"
    }
} as const satisfies Record<string, AsciiIconConfig>;

/**
 * Type-safe icon names derived from the config registry
 */
export type AsciiIconName = keyof typeof ICON_CONFIGS;

/**
 * Array of all available icon names (useful for validation)
 */
export const ICON_NAMES = Object.keys(ICON_CONFIGS) as AsciiIconName[];


/**
 * Default configuration values
 */
const DEFAULTS = {
    fontSizeRatio: 0.0083, // 2px at width=240
    widthDivisor: 1,
    sampleFactor: 2,
    width: 240,
} as const;

/**
 * Calculate font size based on width and ratio
 */
const calculateFontSize = (width: number, ratio: number): string => {
    return `${Math.max(1, Math.round(width * ratio))}px`;
};

/**
 * Factory function that creates an ASCII icon component from configuration
 */
export function createAsciiIcon(
    config: AsciiIconConfig,
    displayName?: string
): ComponentType<AsciiIconProps> {
    const {
        imagePath,
        fontSizeRatio = DEFAULTS.fontSizeRatio,
        widthDivisor = DEFAULTS.widthDivisor,
        sampleFactor: defaultSampleFactor = DEFAULTS.sampleFactor,
    } = config;

    function AsciiIcon({
        width = DEFAULTS.width,
        sampleFactor,
        fontSize,
        scrambleAnimationDuration,
        noAnimation = false,
        ...props
    }: AsciiIconProps) {
        const calculatedFontSize = useMemo(() => {
            return fontSize || calculateFontSize(width, fontSizeRatio);
        }, [width, fontSize]);

        const AsciiComponent = noAnimation
            ? DynamicAsciiImage
            : DynamicScrambledAsciiImage;

        return (
            <AsciiComponent
                imagePath={imagePath}
                width={width / widthDivisor}
                sampleFactor={sampleFactor || defaultSampleFactor}
                fontSize={calculatedFontSize}
                scrambleAnimationDuration={scrambleAnimationDuration}
                {...props}
            />
        );
    }

    // Set display name for React DevTools
    AsciiIcon.displayName = displayName || "AsciiIcon";

    return AsciiIcon;
}


/**
 * Auto-generated icon components from the config registry
 */
const iconComponents = Object.fromEntries(
    Object.entries(ICON_CONFIGS).map(([name, config]) => [
        name,
        createAsciiIcon(config, name),
    ])
) as Record<AsciiIconName, ComponentType<AsciiIconProps>>;

/**
 * Type-safe getter for icon components by name.
 * Returns undefined if the icon name is not found.
 */
export function getIconComponent(
    name: string
): ComponentType<AsciiIconProps> | undefined {
    return iconComponents[name as AsciiIconName];
}

/**
 * Type-safe getter that throws if icon is not found
 */
export function getIconComponentOrThrow(
    name: AsciiIconName
): ComponentType<AsciiIconProps> {
    const component = iconComponents[name];
    if (!component) {
        throw new Error(`Unknown icon: ${name}. Available icons: ${ICON_NAMES.join(", ")}`);
    }
    return component;
}


export const LightSabreIcon = iconComponents.LightSabreIcon;
export const PostQuantumEncryptionIcon = iconComponents.PostQuantumEncryptionIcon;
export const DreamboothIcon = iconComponents.DreamboothIcon;
export const CryptoChartIcon = iconComponents.CryptoChartIcon;
export const CandlestickChartIcon = iconComponents.CandlestickChartIcon;
export const UnderTheRockIcon = iconComponents.UnderTheRockIcon;
export const ETHTokyo23Icon = iconComponents.ETHTokyo23Icon;
export const EdgeAIIcon = iconComponents.EdgeAIIcon;
export const MaritimeSatelliteIcon = iconComponents.MaritimeSatelliteIcon;
export const DegenLogoIcon = iconComponents.DegenLogoIcon;
export const BattleBotIcon = iconComponents.BattleBotIcon;
export const AirdropIcon = iconComponents.AirdropIcon;
export const BacksimIcon = iconComponents.BacksimIcon;
