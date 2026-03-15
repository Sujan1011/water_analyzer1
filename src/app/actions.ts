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
      // Direct comparison and classification as requested: Acidic vs Base
      const acidityType = value < 7 ? 'Acidic' : value > 7 ? 'Base (Alkaline)' : 'Neutral';
      const safeMin = 6.5;
      const safeMax = 8.5;
      
      if (value < 6.0 || value > 9.0) {
        safetyLevel = 'Critical';
        explanation = `Analysis Result: ${acidityType}. The pH level of ${value} is a critical deviation. In comparison to the safe range of ${safeMin}–${safeMax}, this water is excessively ${value < 7 ? 'acidic and corrosive' : 'alkaline'} which can cause serious health and infrastructure issues.`;
        recommendation = 'Immediate chemical balancing required. Do not use for drinking or skin contact.';
        emojis = '🔴';
      } else if (value < safeMin || value > safeMax) {
        safetyLevel = 'Warning';
        explanation = `Analysis Result: ${acidityType}. The pH of ${value} is outside the optimal ${safeMin}–${safeMax} range. While not immediately toxic, it is classified as ${acidityType} and may cause minor irritation or scale build-up over time.`;
        recommendation = 'Consider using a neutralizing filter to restore the balance closer to 7.0 (Neutral).';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Analysis Result: ${acidityType} (Balanced). The pH level of ${value} is well within the international safety standard range of ${safeMin}–${safeMax}. This water is chemically balanced and safe for all household uses.`;
        recommendation = 'Levels are optimal. Continue regular maintenance and monitoring.';
        emojis = '✅';
      }
      break;
    }

    case 'Iron': {
      const safeLimit = 0.3;
      if (value > 1.0) {
        safetyLevel = 'Critical';
        explanation = `Detection: Excessive Iron concentration. At ${value} mg/L, it significantly exceeds the secondary safety limit of ${safeLimit} mg/L. This will cause severe metallic taste, red/brown staining, and potential bacterial growth.`;
        recommendation = 'A whole-house iron removal system is required immediately.';
        emojis = '🔴';
      } else if (value >= safeLimit) {
        safetyLevel = 'Warning';
        explanation = `Detection: Elevated Iron. The detected ${value} mg/L is above the aesthetic threshold of ${safeLimit} mg/L. You may experience slight metallic odor and staining on laundry or fixtures.`;
        recommendation = 'Consider a carbon-based filtration system to reduce trace metallic content.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Detection: Minimal Iron. At ${value} mg/L, the level is well below the ${safeLimit} mg/L safety standard. The water remains clear and odorless.`;
        recommendation = 'Perfect for drinking and general household use.';
        emojis = '✅';
      }
      break;
    }

    case 'Hardness': {
      const softLimit = 120;
      const hardLimit = 180;
      if (value > hardLimit) {
        safetyLevel = 'Critical';
        explanation = `Mineral Profile: Very Hard. The level of ${value} mg/L is well above the recommended limit. This will cause rapid limescale buildup, damage water heaters, and significantly reduce appliance lifespan.`;
        recommendation = 'Installation of a high-capacity water softener is strongly advised.';
        emojis = '🔴';
      } else if (value > softLimit) {
        safetyLevel = 'Warning';
        explanation = `Mineral Profile: Hard. At ${value} mg/L, the water is moderately hard. While safe to drink, it will leave mineral deposits on glassware and reduce soap effectiveness.`;
        recommendation = 'Monitor scale buildup in faucets and consider a localized softening solution.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Mineral Profile: Soft/Balanced. The detected ${value} mg/L is within the ideal range. This ensures efficient operation of appliances and prevents scale formation.`;
        recommendation = 'Excellent quality. No softening treatment needed.';
        emojis = '✅';
      }
      break;
    }

    case 'Chlorine': {
      const idealMax = 2.0;
      const criticalMax = 4.0;
      if (value > criticalMax) {
        safetyLevel = 'Critical';
        explanation = `Purity: Excessive Chlorine. At ${value} mg/L, it exceeds the EPA maximum safety goal. This can cause harsh odors and potential respiratory or skin irritation.`;
        recommendation = 'Stop consumption immediately. Use an activated carbon filter to remove excess chlorine.';
        emojis = '🔴';
      } else if (value >= idealMax) {
        safetyLevel = 'Warning';
        explanation = `Purity: High Chlorine. The detected ${value} mg/L is safe from bacteria but notably high for drinking water, affecting taste and odor significantly.`;
        recommendation = 'Allow water to sit or use a standard pitcher filter to improve taste.';
        emojis = '⚠️';
      } else {
        safetyLevel = 'Safe';
        explanation = `Purity: Optimal Chlorine. The level of ${value} mg/L provides effective disinfection without compromising taste or safety.`;
        recommendation = 'Ideal levels for domestic water supply.';
        emojis = '✅';
      }
      break;
    }
  }

  return {
    explanation: `${explanation} (Detected via: ${colorDetected})`,
    recommendation,
    safetyLevel,
    emojis
  };
}

export async function interpretResults(input: WaterQualityTestInput): Promise<WaterQualityTestOutput> {
  // Artificial delay for UX
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Local processing for speed, reliability, and no-cost usage on Vercel
    return localDiagnosticAnalysis(input);
  } catch (error: any) {
    console.error('Diagnostic Engine Error:', error);
    throw new Error('The diagnostic engine encountered an error while analyzing the color data.');
  }
}
