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
  prompt: `You are an expert water quality analyst. Your task is to provide a scientific explanation, practical recommendations, and classify the safety level for a given water quality test result.

Input Data:
- Test Type: {{{testType}}}
- Detected Value: {{{value}}} {{{unit}}}
- Detected Color: {{{colorDetected}}}

Analysis Guidelines:

1. pH:
   - Safe (✅): 6.5 - 8.5. Optimal for drinking and pipes.
   - Warning (⚠️): 6.0 - 6.4 or 8.6 - 9.0. Slightly corrosive or scaling.
   - Critical (🔴): < 6.0 or > 9.0. Highly corrosive or severe scale/bitter taste.

2. Iron (Fe):
   - Safe (✅): < 0.3 mg/L. Minimal staining or taste.
   - Warning (⚠️): 0.3 - 1.0 mg/L. Noticeable orange/brown staining and metallic taste.
   - Critical (🔴): > 1.0 mg/L. Severe staining, plumbing deposits, and strong metallic taste.

3. Hardness (CaCO3):
   - Safe (✅): < 60 mg/L (Soft) or 60-120 mg/L (Moderate). Generally fine.
   - Warning (⚠️): 121 - 180 mg/L (Hard). Scaling on fixtures, more soap required.
   - Critical (🔴): > 180 mg/L (Very Hard). Severe scaling, appliance damage, soap scum.

4. Chlorine:
   - Safe (✅): < 2.0 mg/L. Standard disinfection levels.
   - Warning (⚠️): 2.0 - 4.0 mg/L. Strong odor/taste, potential skin irritation.
   - Critical (🔴): > 4.0 mg/L. Exceeds EPA maximum residual disinfectant level goal.

Tasks:
1. Provide a detailed scientific explanation of the value for the specific test type.
2. Offer practical, actionable advice.
3. Classify the result (Safe, Warning, Critical) based on the guidelines above.
4. Select the matching emoji.`,
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
