import { ButtonGroup, IconButton, useToken } from "@chakra-ui/react";
import type { ButtonGroupProps } from "@chakra-ui/react";
import {
  FaXTwitter,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaThreads,
  FaTelegram,
} from "react-icons/fa6";
import { m } from "motion/react";
import { Link } from "@/components/ui/link";

export const MotionButton = m.create(IconButton);

// AnimatedIconButton Component
interface AnimatedIconButtonProps {
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
  delay?: number;
}

function AnimatedIconButton({
  href,
  ariaLabel,
  icon,
  delay = 0,
}: AnimatedIconButtonProps) {
  const [initialColor, highlightColor] = useToken("colors", [
    "gray.600",
    "accent",
  ]);

  return (
    <Link href={href}>
      <MotionButton
        animate={{ color: [null, highlightColor, initialColor] }}
        transition={{ repeat: Infinity, duration: 0.75, repeatDelay: 2, delay }}
        aria-label={ariaLabel}
      >
        {icon}
      </MotionButton>
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
    href: "https://threads.net/@0xEljh",
    ariaLabel: "Threads",
    icon: <FaThreads />,
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
  return (
    <ButtonGroup variant="outline" {...props}>
      {socials.map((social, i) => (
        <AnimatedIconButton
          key={i}
          href={social.href}
          ariaLabel={social.ariaLabel}
          icon={social.icon}
          delay={i * -0.5}
        />
      ))}
    </ButtonGroup>
  );
}
