'use server';

import { type WaterQualityTestInput, type WaterQualityTestOutput } from '@/ai/flows/dynamic-interpretive-results-flow';

/**
 * Local Diagnostic Engine
 * Uses deterministic logic based on international water quality standards.
 * This ensures the app works perfectly on Vercel without an external API key.
 */
function localDiagnosticAnalysis(input: WaterQualityTestInput): WaterQualityTestOutput {
  const { testType, value, colorDetected } = input;
  let safetyLevel: 'Safe' | 'Warning' | 'Critical' = 'Safe';
  let explanation = '';
  let recommendation = '';
  let emojis = '✅';

  switch (testType) {
    case 'pH': {
      const acidityType = value < 7 ? 'Acidic' : value > 7 ? 'Base (Alkaline)' : 'Neutral';
      const safeMin = 6.5;
      const safeMax = 8.5;
      
      if (value < 6.0 || value > 9.0) {
        safetyLevel = 'Critical';
        explanation = `Diagnostic Status: ${acidityType}. The detected pH of ${value} is a critical deviation from the neutral standard (7.0). Compared to the safe consumption range of ${safeMin}–${safeMax}, this water is ${value < 7 ? 'highly corrosive' : 'excessively alkaline'} and may damage plumbing or irritate skin.`;
        recommendation = 'Immediate adjustment is required. Use a pH stabilizer and re-test in 2 hours. Do not consume.';
        emojis = '🔴';
      } else if (value < safeMin || value > safeMax) {
        safetyLevel = 'Warning';
        explanation = `Diagnostic Status: ${acidityType}. A pH of ${value} shows a moderate imbalance. While ${acidityType}, it falls just outside the optimal ${safeMin}–${safeMax} range. This can lead to bitter taste or minor pipe scaling over long periods.`;
        recommendation = 'Monitor the source water. Consider a neutralizing filter to bring the levels closer to 7.0.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Diagnostic Status: ${acidityType} (Optimal). The water maintains a healthy balance at ${value} pH. This is well within the international safety range (${safeMin}–${safeMax}) and is ideal for domestic use.`;
        recommendation = 'No action required. This level provides the best protection for your pipes and appliances.';
        emojis = '✅';
      }
      break;
    }

    case 'Iron': {
      const safeLimit = 0.3;
      if (value > 1.0) {
        safetyLevel = 'Critical';
        explanation = `Detection Analysis: Severe concentration. At ${value} mg/L, the level is over 3x higher than the secondary safety standard (${safeLimit} mg/L). This causes metallic taste, visible staining, and potential bacterial nesting in pipes.`;
        recommendation = 'Install an iron oxidation system or a dedicated sediment filter immediately.';
        emojis = '🔴';
      } else if (value >= safeLimit) {
        safetyLevel = 'Warning';
        explanation = `Detection Analysis: Elevated levels. The detected ${value} mg/L exceeds the aesthetic threshold of ${safeLimit} mg/L. You may notice "rusty" tinting on fixtures and a slight metallic aftertaste.`;
        recommendation = 'Consider a whole-house carbon filter to reduce trace metallic content.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Detection Analysis: Trace/Negligible. At ${value} mg/L, the concentration is well below the ${safeLimit} mg/L limit. The water remains clear and free from metallic contaminants.`;
        recommendation = 'Maintain current filtration. These levels are excellent for drinking and laundry.';
        emojis = '✅';
      }
      break;
    }

    case 'Hardness': {
      const softLimit = 120;
      const hardLimit = 180;
      if (value > hardLimit) {
        safetyLevel = 'Critical';
        explanation = `Mineral Profile: Very Hard. The detected ${value} mg/L significantly exceeds the "soft" threshold of ${softLimit} mg/L. Compared to balanced water, this will cause rapid scale buildup in water heaters and reduce appliance life by 30-50%.`;
        recommendation = 'A high-capacity ion-exchange water softener is strongly recommended.';
        emojis = '🔴';
      } else if (value > softLimit) {
        safetyLevel = 'Warning';
        explanation = `Mineral Profile: Hard. At ${value} mg/L, the water is above the ideal limit. While safe to drink, it will leave white mineral deposits (limescale) on glassware and faucets over time.`;
        recommendation = 'Use rinse aids in dishwashers and monitor for scale on showerheads.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Mineral Profile: Soft/Balanced. The detected ${value} mg/L is within the ideal range. This ensures your appliances run efficiently and soap lathers perfectly without scale issues.`;
        recommendation = 'Perfect for standard use. No softening treatment required.';
        emojis = '✅';
      }
      break;
    }

    case 'Chlorine': {
      const idealMax = 2.0;
      const criticalMax = 4.0;
      if (value > criticalMax) {
        safetyLevel = 'Critical';
        explanation = `Purity Analysis: Excessive Residual. At ${value} mg/L, the concentration exceeds the EPA maximum contaminant level goal of ${criticalMax} mg/L. This is chemically aggressive and can cause respiratory irritation.`;
        recommendation = 'Stop consumption. Use an activated carbon filter or allow the water to aerate to dissipate chlorine.';
        emojis = '🔴';
      } else if (value >= idealMax) {
        safetyLevel = 'Warning';
        explanation = `Purity Analysis: High Residual. The detected ${value} mg/L is safe from a bacterial standpoint but significantly higher than the ideal ${idealMax} mg/L for taste and odor.`;
        recommendation = 'An inline carbon block filter will easily remove this excess "bleach" taste.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Purity Analysis: Optimal Disinfection. The detected ${value} mg/L provides a safe residual for pathogen protection without affecting taste or safety.`;
        recommendation = 'No action required. This indicates well-maintained disinfection protocols.';
        emojis = '✅';
      }
      break;
    }
  }

  return {
    explanation: `${explanation} (Reference Color: ${colorDetected})`,
    recommendation,
    safetyLevel,
    emojis
  };
}

export async function interpretResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  // Simulate network latency for UX
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    // We use the local engine for production reliability on Vercel without API keys
    return localDiagnosticAnalysis(input);
  } catch (error: any) {
    console.error('Diagnostic Engine Error:', error);
    throw new Error('Analysis Engine encountered an unexpected error.');
  }
}
