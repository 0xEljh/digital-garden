import React, { useState } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { ElasticSlider } from "./elastic-slider";
import { InlineLatex } from "./latex";

interface VariableConfig {
  key: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
}

interface VariableEquationProps {
  variables: VariableConfig[];
  latex: (values: Record<string, number>) => string;
  compute?: (values: Record<string, number>) => number;
  valueLabel?: string;
  formatResult?: (v: number) => string;
}

export function VariableEquation({
  variables,
  latex: latexFn,
  compute,
  valueLabel,
  formatResult,
}: VariableEquationProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const v of variables) {
      initial[v.key] = v.defaultValue;
    }
    return initial;
  });

  const updateValue = (key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const latexString = latexFn(values);
  const computedValue = compute ? compute(values) : null;
  const formattedResult = computedValue !== null
    ? formatResult
      ? formatResult(computedValue)
      : String(Math.round(computedValue * 1000) / 1000)
    : null;

  return (
    <Box
      my={6}
      p={5}
      rounded="lg"
      border="1px solid"
      borderColor="gray.700"
      bg="gray.900"
    >
      <Stack gap={5}>
        {/* Equation display */}
        <Flex justify="center" py={3}>
          <Box fontSize="lg">
            <InlineLatex math={latexString} display />
          </Box>
        </Flex>

        {/* Computed result */}
        {computedValue !== null && (
          <Flex justify="center" align="center" gap={2}>
            {valueLabel && (
              <Text fontSize="sm" color="gray.400" fontFamily="Aeion Mono">
                {valueLabel} =
              </Text>
            )}
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="cyan.400"
              fontFamily="Aeion Mono"
            >
              {formattedResult}
            </Text>
          </Flex>
        )}

        {/* Sliders */}
        <Flex wrap="wrap" gap={6} justify="center">
          {variables.map((v) => (
            <ElasticSlider
              key={v.key}
              defaultValue={v.defaultValue}
              min={v.min}
              max={v.max}
              step={v.step ?? 0.1}
              label={v.label}
              onValueChange={(val) => updateValue(v.key, val)}
              formatValue={(val) => `${v.label} = ${val.toFixed(2)}`}
              width="10rem"
            />
          ))}
        </Flex>
      </Stack>
    </Box>
  );
}
