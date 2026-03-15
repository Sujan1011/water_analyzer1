'use server';
/**
 * @fileOverview This file provides an AI flow for interpreting water quality test results.
 *
 * - interpretWaterQualityResults - A function that takes water quality test data and returns a scientific explanation, recommendations, and safety level.
 * - WaterQualityTestInput - The input type for the interpretWaterQualityResults function.
 * - WaterQualityTestOutput - The return type for the interpretWaterQualityResults function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WaterQualityTestInputSchema = z.object({
  testType: z.enum(['pH', 'Iron', 'Hardness', 'Chlorine']).describe('The type of water quality test performed.'),
  value: z.number().describe('The numerical value detected for the water quality parameter.'),
  unit: z.string().describe('The unit of measurement for the detected value (e.g., "pH", "mg/L").'),
  colorDetected: z.string().describe('The color detected on the test strip for this parameter (e.g., "Green", "Orange").'),
});
export type WaterQualityTestInput = z.infer<typeof WaterQualityTestInputSchema>;

const WaterQualityTestOutputSchema = z.object({
  explanation: z.string().describe('A scientific explanation of the detected water quality parameter and its implications.'),
  recommendation: z.string().describe('Practical recommendations and actionable advice based on the test result.'),
  safetyLevel: z.enum(['Safe', 'Warning', 'Critical']).describe('The safety level classification for the detected value.'),
  emojis: z.string().describe('An emoji corresponding to the safety level (e.g., ✅ for Safe, ⚠️ for Warning, 🔴 for Critical).'),
});
export type WaterQualityTestOutput = z.infer<typeof WaterQualityTestOutputSchema>;

export async function interpretWaterQualityResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  return dynamicInterpretiveResultsFlow(input);
}

const interpretWaterQualityPrompt = ai.definePrompt({
  name: 'interpretWaterQualityPrompt',
  input: { schema: WaterQualityTestInputSchema },
  output: { schema: WaterQualityTestOutputSchema },
  prompt: `You are an expert water quality analyst. Your task is to provide a scientific explanation, practical recommendations, and classify the safety level for a given water quality test result. Use precise language and ensure the recommendations are actionable. Also, provide a single emoji corresponding to the safety level.

Here are the water quality test details:
Test Type: {{{testType}}}
Detected Value: {{{value}}} {{{unit}}}
Detected Color: {{{colorDetected}}}

Consider the following general guidelines for safety levels (you may refine based on specific context):

{{#eq testType 'pH'}}
  pH (potential of Hydrogen) measures the acidity or alkalinity of water. A neutral pH is around 7.0.
  - Critical (🔴): pH < 6.5 (acidic, can corrode pipes, leach heavy metals) or pH > 8.5 (basic, can cause scale buildup, affect taste).
  - Warning (⚠️): pH 6.5 - 7.5 is ideal for most purposes. pH between 6.5 and 7.5 is generally safe. Values slightly outside this range (e.g., 6.0-6.4 or 7.6-8.0) might be concerning for specific uses.
  - Safe (✅): pH 6.5 - 7.5 is generally considered safe and optimal for drinking water and most aquatic life.
{{/eq}}

{{#eq testType 'Iron'}}
  Iron (Fe) in water can cause staining, taste issues, and promote bacterial growth. It's measured in milligrams per liter (mg/L).
  - Critical (🔴): Iron > 1.0 mg/L (severe staining, metallic taste, potential health concerns over long-term exposure for very high levels).
  - Warning (⚠️): Iron 0.3 - 1.0 mg/L (noticeable staining, taste/odor issues, not acutely harmful but undesirable).
  - Safe (✅): Iron < 0.3 mg/L (generally acceptable, minimal issues).
{{/eq}}

{{#eq testType 'Hardness'}}
  Water hardness is primarily caused by dissolved calcium and magnesium. It's typically measured in mg/L as CaCO3.
  - Critical (🔴): Hardness > 180 mg/L (Very Hard/Extremely Hard/Severe - significant scale buildup, soap scum, reduced appliance efficiency).
  - Warning (⚠️): Hardness 60 - 180 mg/L (Moderately Hard/Hard - some scale buildup, increased soap usage).
  - Safe (✅): Hardness < 60 mg/L (Very Soft/Soft - minimal issues, though very soft water can be corrosive).
{{/eq}}

{{#eq testType 'Chlorine'}}
  Chlorine is often used as a disinfectant. While necessary for sanitation, high levels can be harmful and affect taste.
  - Critical (🔴): Chlorine > 4.0 mg/L (can cause health issues, very strong taste/odor).
  - Warning (⚠️): Chlorine 0.5 - 4.0 mg/L (acceptable for disinfection, but higher end may cause taste/odor issues or irritation).
  - Safe (✅): Chlorine < 0.5 mg/L (generally acceptable, though very low levels might indicate insufficient disinfection).
{{/eq}}

Based on the provided details and the general guidelines, provide:
1. A scientific explanation of what the detected value means for water quality.
2. Practical recommendations for action or further investigation.
3. The safety level classification (Safe, Warning, Critical).
4. A single emoji (✅, ⚠️, 🔴) that best represents the safety level.
`,
});

const dynamicInterpretiveResultsFlow = ai.defineFlow(
  {
    name: 'dynamicInterpretiveResultsFlow',
    inputSchema: WaterQualityTestInputSchema,
    outputSchema: WaterQualityTestOutputSchema,
  },
  async (input) => {
    const { output } = await interpretWaterQualityPrompt(input);
    if (!output) {
      throw new Error('Failed to interpret water quality results: No output from AI model.');
    }
    return output;
  }
);
