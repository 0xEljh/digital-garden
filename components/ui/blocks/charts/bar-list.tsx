'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

export interface BarListData {
  name: string
  value: number
}

interface BarListProps {
  data: BarListData[]
  labels: { title: string; value: string }
}

export const BarList = (props: BarListProps) => {
  const { data, labels } = props

  const sortedData = [...data].sort((a, b) => b.value - a.value)
  const maxValue = Math.max(...sortedData.map((d) => d.value), 1)

  return (
    <Stack gap={2}>
      {sortedData.map((item) => {
        const percentage = (item.value / maxValue) * 100
        return (
          <HStack key={item.name} gap={3} align="center">
            <Box flex="1" position="relative">
              <Box
                position="absolute"
                top="0"
                left="0"
                h="full"
                w={`${percentage}%`}
                bg="cyan.900"
                borderRadius="sm"
                transition="width 0.3s"
              />
              <Text
                position="relative"
                fontSize="sm"
                fontFamily="Tickerbit"
                py={1}
                px={2}
                zIndex={1}
              >
                {item.name}
              </Text>
            </Box>
            <Text
              fontSize="sm"
              fontFamily="Tickerbit"
              color="fg.muted"
              minW="50px"
              textAlign="right"
            >
              {item.value.toFixed(1)}{labels.value === '%' ? '%' : ''}
            </Text>
          </HStack>
        )
      })}
    </Stack>
  )
}
