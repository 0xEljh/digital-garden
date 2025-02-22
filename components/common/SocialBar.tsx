import { ButtonGroup, IconButton, useToken, HStack } from "@chakra-ui/react";
import { FaXTwitter, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa6";
import { motion } from "motion/react";
import { Box } from "@chakra-ui/react";
import { Link } from "@/components/ui/link";

export const MotionBox = motion.create(Box);

// AnimatedIconButton Component
interface AnimatedIconButtonProps {
  href: string;
  ariaLabel: string;
  icon: any;
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
    "teal.200",
  ]);

  return (
    <Link href={href}>
      <MotionBox
        animate={{ color: [null, highlightColor, initialColor] }}
        transition={{ repeat: Infinity, duration: 0.75, repeatDelay: 2, delay }}
      >
        <IconButton
          aria-label={ariaLabel}
          color="inherit"
        >
          {icon}
        </IconButton>
      </MotionBox>
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
    href: "https://twitter.com/0xEljh",
    ariaLabel: "Twitter",
    icon: <FaXTwitter />,
  },
];

export function SocialBar({ ...props }: any) {
  return (
    <ButtonGroup variant="subtle" {...props}>
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

interface SocialShareBarProps {
  slug: string;
  title: string;
}

export function SocialShareBar({ slug, title, ...props }: SocialShareBarProps) {
  const postUrl = `https://0xeljh.com/${slug}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(postUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    postUrl
  )}`;

  return (
    <HStack gap="4" {...props}>
      <ButtonGroup variant="surface">
        <AnimatedIconButton
          href={twitterShareUrl}
          ariaLabel="Share on Twitter"
          icon={<FaXTwitter />}
        />
        <AnimatedIconButton
          href={linkedinShareUrl}
          ariaLabel="Share on LinkedIn"
          icon={<FaLinkedin />}
          delay={1}
        />
      </ButtonGroup>
    </HStack>
  );
}
