import { Tag, Stack, StackProps } from "@chakra-ui/react";

type CategoryTagProps = {
  category: string;
};

export const CategoryTag = ({ category }: CategoryTagProps) => {
  return (
    <Tag.Root
      variant="subtle"
      colorScheme="teal"
      color={category === "draft" ? "orange.300" : "cyan.600"}
      fontFamily="Topoline"
      size="md"
    >
      {category}
    </Tag.Root>
  );
};

type CategoryTagsProps = StackProps & {
  categories?: string[];
};

export const CategoryTags = ({ categories, ...stackProps }: CategoryTagsProps) => {
  if (!categories?.length) return null;

  return (
    <Stack direction="row" gap={2} {...stackProps}>
      {categories.map((category) => (
        <CategoryTag key={category} category={category} />
      ))}
    </Stack>
  );
};
