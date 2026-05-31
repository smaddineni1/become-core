/**
 * Biometric Scan Provider Adapter Interface
 *
 * All biometric scan integrations must implement this interface.
 * Business logic depends ONLY on this interface — never a concrete SDK.
 */

export interface BiometricScanResult {
  measurements: Record<string, number>; // 240+ standardized measurement keys
  confidence: number;                    // 0-1 confidence score
  provider: string;                      // Provider identifier
  rawData?: unknown;                     // Original provider response
}

export type BiometricScanStatus = 'processing' | 'complete' | 'failed';

export type BiometricScanInput = 'front_photo' | 'side_photo' | 'height' | 'weight';

export interface BiometricScanProvider {
  readonly name: string;
  readonly requiredInputs: BiometricScanInput[];

  /**
   * Initialize a new scan. Returns a scanId for polling.
   */
  initializeScan(
    userId: string,
    inputs: Record<string, unknown>,
  ): Promise<string>;

  /**
   * Poll the scan status.
   */
  pollStatus(scanId: string): Promise<BiometricScanStatus>;

  /**
   * Retrieve completed scan results.
   * Should only be called when pollStatus returns 'complete'.
   */
  getResults(scanId: string): Promise<BiometricScanResult>;
}
