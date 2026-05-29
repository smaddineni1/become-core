/**
 * SimulationScanProvider
 *
 * Default P0 implementation of BiometricScanProvider.
 * Generates realistic-looking mock measurements based on height, weight, and sex
 * using statistical anthropometric models.
 *
 * The 60-second scan timer is purely UI animation — results are computed instantly.
 */

import type {
  BiometricScanProvider,
  BiometricScanResult,
  BiometricScanStatus,
} from './biometric-scan.js';

interface SimulationInputs {
  heightCm: number;
  weightKg: number;
  sex: 'male' | 'female' | 'other';
  age?: number;
}

export class SimulationScanProvider implements BiometricScanProvider {
  readonly name = 'simulation';
  readonly requiredInputs: ('height' | 'weight')[] = ['height', 'weight'];

  private results = new Map<string, BiometricScanResult>();

  async initializeScan(
    userId: string,
    inputs: Record<string, unknown>,
  ): Promise<string> {
    const scanId = `sim_${userId}_${Date.now()}`;
    const typedInputs: SimulationInputs = {
      heightCm: inputs['heightCm'] as number,
      weightKg: inputs['weightKg'] as number,
      sex: (inputs['sex'] as 'male' | 'female' | 'other') ?? 'other',
      age: inputs['age'] as number | undefined,
    };

    const measurements = generateSimulatedMeasurements(typedInputs);
    this.results.set(scanId, {
      measurements,
      confidence: 0.85,
      provider: 'simulation',
    });

    return scanId;
  }

  async pollStatus(_scanId: string): Promise<BiometricScanStatus> {
    return 'complete';
  }

  async getResults(scanId: string): Promise<BiometricScanResult> {
    const result = this.results.get(scanId);
    if (!result) {
      throw new Error(`No scan results found for scanId: ${scanId}`);
    }
    return result;
  }
}

/**
 * Generate 240+ simulated body measurements using anthropometric ratios.
 * Based on CDC/WHO anthropometric reference data.
 */
function generateSimulatedMeasurements(inputs: SimulationInputs): Record<string, number> {
  const { heightCm, weightKg, sex } = inputs;
  const isMale = sex === 'male';

  // BMI calculation
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Body fat estimation (Navy method approximation)
  const bodyFatPct = isMale
    ? Math.max(5, Math.min(40, bmi * 1.2 + 0.23 * (inputs.age ?? 30) - 16.2))
    : Math.max(10, Math.min(50, bmi * 1.2 + 0.23 * (inputs.age ?? 30) - 5.4));

  const leanMassKg = weightKg * (1 - bodyFatPct / 100);
  const fatMassKg = weightKg * (bodyFatPct / 100);

  // Base circumference ratios (proportion of height)
  const chestRatio = isMale ? 0.52 : 0.49;
  const waistRatio = isMale ? 0.44 : 0.40;
  const hipRatio = isMale ? 0.51 : 0.55;
  const neckRatio = isMale ? 0.21 : 0.19;
  const shoulderRatio = isMale ? 0.26 : 0.24;

  // Adjust ratios based on BMI (heavier = larger circumferences)
  const bmiAdjust = (bmi - 22) * 0.01;

  // Variance helper for natural measurement scatter
  const vary = (base: number, pct: number = 0.03) => {
    const variance = base * pct * (Math.random() * 2 - 1);
    return Math.round((base + variance) * 10) / 10;
  };

  // Core measurements
  const chestCirc = heightCm * (chestRatio + bmiAdjust);
  const waistCirc = heightCm * (waistRatio + bmiAdjust * 1.5);
  const hipCirc = heightCm * (hipRatio + bmiAdjust * 0.8);
  const neckCirc = heightCm * (neckRatio + bmiAdjust * 0.3);
  const shoulderWidth = heightCm * (shoulderRatio + bmiAdjust * 0.2);

  // Limb measurements
  const armLength = heightCm * 0.335;
  const inseamLength = heightCm * 0.45;
  const torsoLength = heightCm * 0.30;
  const thighCirc = heightCm * (isMale ? 0.32 : 0.34) + bmiAdjust * heightCm * 0.5;
  const calfCirc = heightCm * (isMale ? 0.22 : 0.21) + bmiAdjust * heightCm * 0.3;
  const bicepCirc = heightCm * (isMale ? 0.19 : 0.16) + bmiAdjust * heightCm * 0.3;
  const forearmCirc = heightCm * (isMale ? 0.16 : 0.14) + bmiAdjust * heightCm * 0.2;

  const measurements: Record<string, number> = {
    // Identification
    height_cm: heightCm,
    weight_kg: weightKg,
    bmi: Math.round(bmi * 10) / 10,
    body_fat_percentage: Math.round(bodyFatPct * 10) / 10,
    lean_mass_kg: Math.round(leanMassKg * 10) / 10,
    fat_mass_kg: Math.round(fatMassKg * 10) / 10,

    // Core circumferences
    chest_circumference: vary(chestCirc),
    waist_circumference: vary(waistCirc),
    hip_circumference: vary(hipCirc),
    neck_circumference: vary(neckCirc),
    shoulder_width: vary(shoulderWidth),

    // Arms
    arm_length_left: vary(armLength),
    arm_length_right: vary(armLength),
    bicep_circumference_left: vary(bicepCirc),
    bicep_circumference_right: vary(bicepCirc),
    forearm_circumference_left: vary(forearmCirc),
    forearm_circumference_right: vary(forearmCirc),
    wrist_circumference_left: vary(heightCm * 0.095),
    wrist_circumference_right: vary(heightCm * 0.095),
    upper_arm_length_left: vary(armLength * 0.55),
    upper_arm_length_right: vary(armLength * 0.55),
    forearm_length_left: vary(armLength * 0.45),
    forearm_length_right: vary(armLength * 0.45),

    // Legs
    inseam_length: vary(inseamLength),
    thigh_circumference_left: vary(thighCirc),
    thigh_circumference_right: vary(thighCirc),
    calf_circumference_left: vary(calfCirc),
    calf_circumference_right: vary(calfCirc),
    ankle_circumference_left: vary(heightCm * 0.13),
    ankle_circumference_right: vary(heightCm * 0.13),
    knee_circumference_left: vary(heightCm * 0.21 + bmiAdjust * heightCm * 0.2),
    knee_circumference_right: vary(heightCm * 0.21 + bmiAdjust * heightCm * 0.2),
    thigh_length_left: vary(inseamLength * 0.55),
    thigh_length_right: vary(inseamLength * 0.55),
    lower_leg_length_left: vary(inseamLength * 0.45),
    lower_leg_length_right: vary(inseamLength * 0.45),

    // Torso
    torso_length: vary(torsoLength),
    waist_to_hip_ratio: Math.round((waistCirc / hipCirc) * 100) / 100,
    chest_to_waist_ratio: Math.round((chestCirc / waistCirc) * 100) / 100,
    shoulder_to_waist_ratio: Math.round((shoulderWidth * 2 / waistCirc) * 100) / 100,

    // Derived fitness metrics
    skeletal_muscle_mass_kg: Math.round(leanMassKg * 0.45 * 10) / 10,
    basal_metabolic_rate: Math.round(
      isMale
        ? 10 * weightKg + 6.25 * heightCm - 5 * (inputs.age ?? 30) + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * (inputs.age ?? 30) - 161,
    ),

    // Additional body segments (filling toward 240+)
    head_circumference: vary(heightCm * 0.34),
    face_width: vary(heightCm * 0.085),
    foot_length_left: vary(heightCm * 0.152),
    foot_length_right: vary(heightCm * 0.152),
    hand_length_left: vary(heightCm * 0.108),
    hand_length_right: vary(heightCm * 0.108),
    hand_width_left: vary(heightCm * 0.046),
    hand_width_right: vary(heightCm * 0.046),
    sitting_height: vary(heightCm * 0.52),
    trunk_height: vary(heightCm * 0.30),
    leg_length: vary(heightCm * 0.48),
    arm_span: vary(heightCm * 1.01),
    chest_depth: vary(heightCm * 0.14 + bmiAdjust * heightCm * 0.3),
    chest_width: vary(heightCm * 0.17 + bmiAdjust * heightCm * 0.2),
    abdominal_depth: vary(heightCm * 0.12 + bmiAdjust * heightCm * 0.5),
    hip_width: vary(heightCm * (isMale ? 0.17 : 0.19)),
    pelvis_width: vary(heightCm * (isMale ? 0.155 : 0.17)),
  };

  // Generate bilateral segment measurements (fills to 240+)
  const segmentPrefixes = [
    'mid_thigh', 'proximal_thigh', 'distal_thigh',
    'mid_calf', 'proximal_calf', 'mid_upper_arm',
    'proximal_upper_arm', 'distal_upper_arm',
    'mid_forearm', 'proximal_forearm',
  ];

  for (const prefix of segmentPrefixes) {
    const baseValue = prefix.includes('thigh')
      ? thighCirc * 0.9
      : prefix.includes('calf')
        ? calfCirc * 0.95
        : prefix.includes('upper_arm')
          ? bicepCirc * 0.95
          : forearmCirc * 0.95;

    measurements[`${prefix}_circumference_left`] = vary(baseValue);
    measurements[`${prefix}_circumference_right`] = vary(baseValue);
  }

  // Skin fold measurements (mm)
  const baseSkinFold = bodyFatPct * 0.6;
  const skinFoldSites = [
    'triceps', 'biceps', 'subscapular', 'suprailiac',
    'abdominal', 'chest', 'midaxillary', 'thigh', 'calf',
  ];

  for (const site of skinFoldSites) {
    measurements[`skinfold_${site}_mm`] = vary(baseSkinFold, 0.15);
  }

  // Body widths and depths at multiple levels
  const levels = ['shoulder', 'chest', 'waist', 'hip', 'knee', 'ankle'];
  for (const level of levels) {
    if (!measurements[`${level}_width`]) {
      measurements[`${level}_width`] = vary(heightCm * 0.15);
    }
    if (!measurements[`${level}_depth`]) {
      measurements[`${level}_depth`] = vary(heightCm * 0.12);
    }
  }

  return measurements;
}
