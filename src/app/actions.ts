
'use server';

import { interpretWaterQualityResults, type WaterQualityTestInput, type WaterQualityTestOutput } from '@/ai/flows/dynamic-interpretive-results-flow';

export async function interpretResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  try {
    return await interpretWaterQualityResults(input);
  } catch (error) {
    console.error('GenAI Error:', error);
    throw new Error('Failed to generate interpretation.');
  }
}
