/**
 * Biometric Profile — Digital Twin scan data
 */
export type BiometricProvider = 'simulation' | 'bodygram';

export interface UserBiometricProfile {
  id: string;
  userId: string;
  provider: BiometricProvider;
  measurements: Record<string, number>; // 240+ measurement keys
  confidence: number; // 0-1
  scannedAt: string;
}

/**
 * Standard measurement keys (subset — full list in schema)
 */
export type BiometricMeasurementKey =
  | 'chest_circumference'
  | 'waist_circumference'
  | 'hip_circumference'
  | 'neck_circumference'
  | 'shoulder_width'
  | 'arm_length_left'
  | 'arm_length_right'
  | 'inseam_length'
  | 'thigh_circumference_left'
  | 'thigh_circumference_right'
  | 'calf_circumference_left'
  | 'calf_circumference_right'
  | 'bicep_circumference_left'
  | 'bicep_circumference_right'
  | 'forearm_circumference_left'
  | 'forearm_circumference_right'
  | 'torso_length'
  | 'body_fat_percentage'
  | 'lean_mass_kg'
  | 'bmi';
