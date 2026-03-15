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

const interpretWaterQualityPrompt = ai.definePrompt({
  name: 'interpretWaterQualityPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: WaterQualityTestInputSchema },
  output: { schema: WaterQualityTestOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `You are an expert water quality analyst. You are provided with chemical test strip data. 
Provide a concise, scientific analysis and safety classification based on international water standards.

Reference Standards:
- pH: Safe (6.5-8.5), Warning (6.0-6.4 or 8.6-9.0), Critical (<6.0 or >9.0).
- Iron (Fe): Safe (<0.3 mg/L), Warning (0.3-1.0 mg/L), Critical (>1.0 mg/L).
- Hardness: Safe (<120 mg/L), Warning (121-180 mg/L), Critical (>180 mg/L).
- Chlorine: Safe (<2.0 mg/L), Warning (2.0-4.0 mg/L), Critical (>4.0 mg/L).

You MUST return a valid JSON object matching the requested schema. Do not include any markdown formatting in your response.`,
  prompt: `Analyze the following water quality test result:
- Parameter: {{{testType}}}
- Concentration: {{{value}}} {{{unit}}}
- Strip Color: {{{colorDetected}}}

Required Tasks:
1. Explain the scientific significance of this specific concentration.
2. Provide actionable maintenance or treatment steps.
3. Classify the status as Safe, Warning, or Critical.`,
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
      throw new Error('The AI model failed to generate a response. This may be due to safety filters or a model timeout.');
    }
    return output;
  }
);

export async function interpretWaterQualityResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  return dynamicInterpretiveResultsFlow(input);
}
