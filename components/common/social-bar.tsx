import { ButtonGroup, IconButton } from "@chakra-ui/react";
import type { ButtonGroupProps } from "@chakra-ui/react";
import type { CSSProperties } from "react";
import {
  FaXTwitter,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTelegram,
} from "react-icons/fa6";
import { Link } from "@/components/ui/link";
import { useAmbientMotion } from "@/components/animations/use-ambient-motion";

// AnimatedIconButton Component
interface AnimatedIconButtonProps {
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
  delay: number;
}

function AnimatedIconButton({
  href,
  ariaLabel,
  icon,
  delay,
}: AnimatedIconButtonProps) {
  return (
    <Link href={href} className="social-link">
      <IconButton
        className="social-pulse"
        color="gray.600"
        style={{ "--social-pulse-delay": `${delay}s` } as CSSProperties}
        aria-label={ariaLabel}
      >
        {icon}
      </IconButton>
    </Link>
  );
}

const socials = [
  {
    href: "https://github.com/0xEljh",
    ariaLabel: "GitHub",
    icon: <FaGithub />,
  },
  {
    href: "https://www.linkedin.com/in/0xEljh/",
    ariaLabel: "LinkedIn",
    icon: <FaLinkedin />,
  },
  {
    href: "mailto:elijah@0xeljh.com",
    ariaLabel: "Email",
    icon: <FaEnvelope />,
  },
  {
    href: "https://telegram.me/elijahngsy",
    ariaLabel: "Telegram",
    icon: <FaTelegram />,
  },
  {
    href: "https://twitter.com/0xEljh",
    ariaLabel: "Twitter",
    icon: <FaXTwitter />,
  },
];

export function SocialBar({ ...props }: ButtonGroupProps) {
  const { ref: ambientRef, active: ambientActive } =
    useAmbientMotion<HTMLDivElement>({ threshold: 0.1 });

  return (
    <ButtonGroup
      {...props}
      ref={ambientRef}
      variant="outline"
      data-motion-id="social.ambient"
      data-motion-state={ambientActive ? "active" : "static"}
      css={{
        "@keyframes social-pulse": {
          "0%, 27.273%, 100%": { color: "var(--chakra-colors-gray-600)" },
          "13.636%": { color: "var(--chakra-colors-accent)" },
        },
        '&[data-motion-state="active"] .social-pulse': {
          animation: "social-pulse 2.75s ease-in-out var(--social-pulse-delay) infinite",
        },
        "& .social-link:hover .social-pulse, & .social-link:focus-visible .social-pulse, & .social-pulse:focus-visible": {
          animation: "none",
          color: "var(--chakra-colors-accent)",
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .social-pulse": { animation: "none !important" },
        },
      }}
    >
      {socials.map((social, index) => (
        <AnimatedIconButton
          key={social.href}
          href={social.href}
          ariaLabel={social.ariaLabel}
          icon={social.icon}
          delay={index * -0.5}
        />
      ))}
    </ButtonGroup>
  );
}
