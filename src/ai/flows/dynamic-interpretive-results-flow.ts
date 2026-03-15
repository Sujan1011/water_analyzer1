
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
  system: `You are an expert water quality analyst. You are provided with sensor data from a chemical test strip. 
Your goal is to provide a concise, scientific analysis and safety classification.
Guidelines:
1. pH: Safe (6.5-8.5), Warning (6.0-6.4 or 8.6-9.0), Critical (<6.0 or >9.0).
2. Iron (Fe): Safe (<0.3 mg/L), Warning (0.3-1.0 mg/L), Critical (>1.0 mg/L).
3. Hardness: Safe (<120 mg/L), Warning (121-180 mg/L), Critical (>180 mg/L).
4. Chlorine: Safe (<2.0 mg/L), Warning (2.0-4.0 mg/L), Critical (>4.0 mg/L).`,
  prompt: `Analyze the following water quality test result:
- Test Module: {{{testType}}}
- Detected Concentration: {{{value}}} {{{unit}}}
- Chromatic Data: {{{colorDetected}}}

Tasks:
1. Formulate a scientific explanation.
2. Provide specific mitigation or maintenance recommendations.
3. Classify safety and choose the corresponding emoji (✅, ⚠️, 🔴).`,
});

const dynamicInterpretiveResultsFlow = ai.defineFlow(
  {
    name: 'dynamicInterpretiveResultsFlow',
    inputSchema: WaterQualityTestInputSchema,
    outputSchema: WaterQualityTestOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await interpretWaterQualityPrompt(input);
      if (!output) {
        throw new Error('AI Model returned empty response.');
      }
      return output;
    } catch (err) {
      console.error('Flow error:', err);
      throw new Error(`AI interpretation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
);
