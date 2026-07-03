import { Link as ChakraLink, Tag, Stack, StackProps } from "@chakra-ui/react";
import NextLink from "next/link";
import { slugifyCategory } from "@/lib/content/categories";

type CategoryTagProps = {
  category: string;
  /** Render as a link to the category's topic page. */
  linkify?: boolean;
};

export const CategoryTag = ({ category, linkify }: CategoryTagProps) => {
  const tag = (
    <Tag.Root variant="subtle" color="accent.muted" fontFamily="mono" size="md">
      {category}
    </Tag.Root>
  );

  if (!linkify) return tag;

  // position/zIndex keep the link clickable above a surrounding LinkOverlay.
  return (
    <ChakraLink
      asChild
      position="relative"
      zIndex={1}
      _hover={{ textDecoration: "none", opacity: 0.8 }}
    >
      <NextLink href={`/posts/topics/${slugifyCategory(category)}`}>
        {tag}
      </NextLink>
    </ChakraLink>
  );
};

type CategoryTagsProps = StackProps & {
  categories?: string[];
  linkify?: boolean;
};

export const CategoryTags = ({
  categories,
  linkify,
  ...stackProps
}: CategoryTagsProps) => {
  if (!categories?.length) return null;

  return (
    <Stack direction="row" gap={2} wrap="wrap" {...stackProps}>
      {categories.map((category) => (
        <CategoryTag key={category} category={category} linkify={linkify} />
      ))}
    </Stack>
  );
};
