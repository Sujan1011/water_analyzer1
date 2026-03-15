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
    case 'pH':
      if (value < 6.0 || value > 9.0) {
        safetyLevel = 'Critical';
        explanation = `The detected pH level of ${value} is significantly outside the neutral range. This indicates highly corrosive or scale-forming water that can damage plumbing and irritate skin.`;
        recommendation = 'Immediate adjustment is required. Use a pH balancer and re-test after 2 hours.';
        emojis = '🔴';
      } else if ((value >= 6.0 && value < 6.5) || (value > 8.5 && value <= 9.0)) {
        safetyLevel = 'Warning';
        explanation = `A pH of ${value} shows a moderate imbalance. While not immediately hazardous, it can affect the effectiveness of disinfectants and lead to minor pipe corrosion over time.`;
        recommendation = 'Monitor the source water and consider a neutralizing filter to stabilize levels.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `The water maintains a healthy neutral balance at ${value} pH. This level is optimal for human consumption and household appliance longevity.`;
        recommendation = 'No action required. Continue regular monthly testing to maintain these baseline levels.';
        emojis = '✅';
      }
      break;

    case 'Iron':
      if (value > 1.0) {
        safetyLevel = 'Critical';
        explanation = `Severe iron concentration detected (${value} mg/L). This will cause significant metallic taste, staining of laundry/fixtures, and potential bacterial growth in pipes.`;
        recommendation = 'Install an iron oxidation filter or a water softener specifically designed for high metallic content.';
        emojis = '🔴';
      } else if (value >= 0.3) {
        safetyLevel = 'Warning';
        explanation = `Iron levels are elevated at ${value} mg/L. You may notice a slight metallic aftertaste and "rusty" colored deposits on water-using appliances.`;
        recommendation = 'Consider a whole-house sediment filter or iron-specific media to reduce trace metals.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Iron levels are within the negligible range (${value} mg/L). The water is clear, odorless, and safe for all domestic uses.`;
        recommendation = 'Maintain existing filtration systems. Trace iron is normal in many water supplies.';
        emojis = '✅';
      }
      break;

    case 'Hardness':
      if (value > 180) {
        safetyLevel = 'Critical';
        explanation = `Extreme mineral density detected (${value} mg/L). This "Very Hard" water will lead to rapid scale buildup in heaters and significantly reduced appliance lifespan.`;
        recommendation = 'A high-capacity water softener is strongly recommended to protect your plumbing infrastructure.';
        emojis = '🔴';
      } else if (value > 120) {
        safetyLevel = 'Warning';
        explanation = `The water is classified as "Hard" (${value} mg/L). You may experience reduced soap lathering and white mineral spots on glassware.`;
        recommendation = 'Use rinse aids in dishwashers and consider a salt-based softener if scale becomes visible on faucets.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Optimal mineral balance detected (${value} mg/L). The water is soft enough to protect pipes while retaining essential minerals.`;
        recommendation = 'Perfect for standard use. Soft water enhances the efficiency of cleaning agents.';
        emojis = '✅';
      }
      break;

    case 'Chlorine':
      if (value > 4.0) {
        safetyLevel = 'Critical';
        explanation = `Dangerous chlorine residual detected (${value} mg/L). This exceeds safety limits and can cause respiratory irritation and strong chemical odors.`;
        recommendation = 'Stop consumption immediately. Use an activated carbon block filter to dissipate excess gas.';
        emojis = '🔴';
      } else if (value >= 2.0) {
        safetyLevel = 'Warning';
        explanation = `Chlorine levels are higher than standard drinking water norms (${value} mg/L). While disinfected, the taste and odor may be unpleasant.`;
        recommendation = 'An inline carbon filter will easily remove this excess chlorine for better taste control.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Chlorine residual is at a safe disinfection level (${value} mg/L). This ensures the water is free from harmful pathogens without being over-treated.`;
        recommendation = 'Continue monitoring. This level provides a safe "residual" for microbial protection.';
        emojis = '✅';
      }
      break;
  }

  return {
    explanation: `${explanation} (Matched to: ${colorDetected})`,
    recommendation,
    safetyLevel,
    emojis
  };
}

export async function interpretResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  // Simulate network latency for UX
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    // We use the local engine for production reliability
    return localDiagnosticAnalysis(input);
  } catch (error: any) {
    console.error('Diagnostic Engine Error:', error);
    throw new Error('Analysis Engine encountered an unexpected error.');
  }
}
