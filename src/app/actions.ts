
'use server';

import { interpretWaterQualityResults, type WaterQualityTestInput, type WaterQualityTestOutput } from '@/ai/flows/dynamic-interpretive-results-flow';

export async function interpretResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  try {
    const result = await interpretWaterQualityResults(input);
    return result;
  } catch (error: any) {
    // Log the actual error for server-side debugging
    console.error('GenAI Action Error:', error);
    
    // Throw a descriptive error that includes the underlying message if available
    const message = error instanceof Error ? error.message : 'Unknown interpretation error';
    throw new Error(`AI Analysis Failed: ${message}`);
  }
}
