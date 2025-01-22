import { Box, Heading, Text, Stack, Tag, Link, useColorModeValue } from '@chakra-ui/react';
import { PortfolioEntry } from '@/types/portfolio';
import { getIconComponent } from '@/lib/utils/portfolio-icons';

interface PortfolioCardProps {
  entry: PortfolioEntry;
  isHighlighted?: boolean;
}

export const PortfolioCard = ({ entry, isHighlighted = false }: PortfolioCardProps) => {
  const IconComponent = getIconComponent(entry.icon);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Link href={`/portfolio/${entry.slug}`} _hover={{ textDecoration: 'none' }}>
      <Box
        p={6}
        h="full"
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          shadow: 'lg',
          borderColor: highlightColor,
        }}
      >
        <Stack spacing={4}>
          <Box>
            <IconComponent
              boxSize={12}
              highlightColor={highlightColor}
              isHighlighted={isHighlighted}
            />
          </Box>
          <Stack spacing={2}>
            <Heading size="md">{entry.title}</Heading>
            <Text color="gray.500" noOfLines={2}>
              {entry.shortDescription}
            </Text>
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {entry.categories.map((category) => (
              <Tag key={category} size="sm" variant="subtle">
                {category}
              </Tag>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Link>
  );
};
