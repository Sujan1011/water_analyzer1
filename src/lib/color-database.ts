
export type TestType = 'pH' | 'Iron' | 'Hardness' | 'Chlorine';

export interface ColorRef {
  name: string;
  value: number;
  unit: string;
  rgb: [number, number, number];
  hex: string;
  description?: string;
}

export const WATER_TEST_DATABASE: Record<TestType, ColorRef[]> = {
  pH: [
    { name: 'Strong Acid', value: 2.0, unit: 'pH', rgb: [255, 0, 0], hex: '#FF0000' },
    { name: 'Acidic', value: 4.0, unit: 'pH', rgb: [255, 165, 0], hex: '#FFA500' },
    { name: 'Slightly Acidic', value: 6.0, unit: 'pH', rgb: [255, 255, 0], hex: '#FFFF00' },
    { name: 'Neutral', value: 7.0, unit: 'pH', rgb: [0, 128, 0], hex: '#008000' },
    { name: 'Slightly Basic', value: 8.0, unit: 'pH', rgb: [0, 0, 255], hex: '#0000FF' },
    { name: 'Basic', value: 9.0, unit: 'pH', rgb: [128, 0, 128], hex: '#800080' },
  ],
  Iron: [
    { name: 'None', value: 0.02, unit: 'mg/L', rgb: [255, 255, 224], hex: '#FFFFE0' },
    { name: 'None', value: 0.05, unit: 'mg/L', rgb: [255, 255, 153], hex: '#FFFF99' },
    { name: 'Trace', value: 0.1, unit: 'mg/L', rgb: [255, 250, 205], hex: '#FFFACD' },
    { name: 'Low', value: 0.2, unit: 'mg/L', rgb: [255, 255, 0], hex: '#FFFF00' },
    { name: 'Low-Moderate', value: 0.4, unit: 'mg/L', rgb: [255, 215, 0], hex: '#FFD700' },
    { name: 'Moderate', value: 0.6, unit: 'mg/L', rgb: [255, 165, 0], hex: '#FFA500' },
    { name: 'Moderate', value: 1.0, unit: 'mg/L', rgb: [255, 140, 0], hex: '#FF8C00' },
    { name: 'Moderate-High', value: 1.5, unit: 'mg/L', rgb: [255, 69, 0], hex: '#FF4500' },
    { name: 'High', value: 2.0, unit: 'mg/L', rgb: [255, 80, 0], hex: '#FF5000' },
    { name: 'Very High', value: 3.0, unit: 'mg/L', rgb: [165, 42, 42], hex: '#A52A2A' },
    { name: 'Severe', value: 5.0, unit: 'mg/L', rgb: [139, 69, 19], hex: '#8B4513' },
    { name: 'Severe', value: 7.0, unit: 'mg/L', rgb: [101, 67, 33], hex: '#654321' },
  ],
  Hardness: [
    { name: 'Very Soft', value: 25, unit: 'mg/L', rgb: [173, 216, 230], hex: '#ADD8E6' },
    { name: 'Soft', value: 75, unit: 'mg/L', rgb: [0, 0, 255], hex: '#0000FF' },
    { name: 'Slightly Hard', value: 125, unit: 'mg/L', rgb: [0, 139, 139], hex: '#008B8B' },
    { name: 'Moderately Hard', value: 175, unit: 'mg/L', rgb: [0, 128, 0], hex: '#008000' },
    { name: 'Hard', value: 225, unit: 'mg/L', rgb: [173, 255, 47], hex: '#ADFF2F' },
    { name: 'Very Hard', value: 275, unit: 'mg/L', rgb: [255, 255, 0], hex: '#FFFF00' },
    { name: 'Extremely Hard', value: 350, unit: 'mg/L', rgb: [255, 165, 0], hex: '#FFA500' },
    { name: 'Severe', value: 450, unit: 'mg/L', rgb: [255, 0, 0], hex: '#FF0000' },
  ],
  Chlorine: [
    { name: 'Very Low', value: 0.2, unit: 'mg/L', rgb: [255, 255, 224], hex: '#FFFFE0' },
    { name: 'Low', value: 0.8, unit: 'mg/L', rgb: [255, 255, 153], hex: '#FFFF99' },
    { name: 'Low-Moderate', value: 1.5, unit: 'mg/L', rgb: [255, 250, 205], hex: '#FFFACD' },
    { name: 'Moderate', value: 2.5, unit: 'mg/L', rgb: [255, 255, 0], hex: '#FFFF00' },
    { name: 'Moderate-High', value: 4.0, unit: 'mg/L', rgb: [255, 215, 0], hex: '#FFD700' },
    { name: 'High', value: 6.0, unit: 'mg/L', rgb: [255, 255, 50], hex: '#FFFF32' },
    { name: 'Very High', value: 8.5, unit: 'mg/L', rgb: [255, 165, 0], hex: '#FFA500' },
  ]
};

export function findClosestColor(testType: TestType, r: number, g: number, b: number): ColorRef {
  const references = WATER_TEST_DATABASE[testType];
  let closest = references[0];
  let minDistance = Infinity;

  for (const ref of references) {
    const dist = Math.sqrt(
      Math.pow(ref.rgb[0] - r, 2) +
      Math.pow(ref.rgb[1] - g, 2) +
      Math.pow(ref.rgb[2] - b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = ref;
    }
  }

  return closest;
}
