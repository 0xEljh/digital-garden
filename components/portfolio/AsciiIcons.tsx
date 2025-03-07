import { DynamicAsciiImage } from "@/components/common/AsciiImage"
import { BoxProps } from "@chakra-ui/react"
import { useMemo } from "react"

// Common interface for all ASCII icons, extending BoxProps to be consistent with SVG icons
export interface AsciiIconProps extends BoxProps {
    width?: number;
    sampleFactor?: number;
    fontSize?: string;
    highlightColor?: string;
    isHighlighted?: boolean;
}

// Helper function to calculate fontSize based on width
const calculateFontSize = (width: number, ratio: number = 0.0167): string => {
    return `${Math.max(1, Math.round(width * ratio))}px`;
}

export const LightSabreIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0166); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/lightsabre.jpg" 
            width={width / 2} // scale down to account for larger font size 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const PostQuantumEncryptionIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/post-quantum-encryption.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const DreamboothIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/dreambooth.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const CryptoChartIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/crypto-candlestick-charts.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const CandlestickChartIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/candlestick-charts.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const UnderTheRockIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0166); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/under-the-rock.jpg" 
            width={width / 2} // scale down to account for larger font size 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const ETHTokyo23Icon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/ethtokyo23-square.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const EdgeAIIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/edge-ai.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const MaritimeSatelliteIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/maritime-satellite.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const DegenLogoIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/degen-logo.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const BattleBotIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/edhbattlebot.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const AirdropIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/airdrop.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}

export const BacksimIcon = ({ 
    width = 240, 
    sampleFactor,
    fontSize,
    ...props 
}: AsciiIconProps) => {
    const calculatedFontSize = useMemo(() => {
        return fontSize || calculateFontSize(width, 0.0083); // 2px at width=240
    }, [width, fontSize]);

    return (
        <DynamicAsciiImage 
            imagePath="/images/backsim.jpg" 
            width={width} 
            sampleFactor={sampleFactor || 2}
            fontSize={calculatedFontSize} 
            {...props}
        />
    )
}
