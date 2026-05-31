/**
 * Knee Valgus Detector
 *
 * Specialized detection for "Knee Cave" — one of the most important
 * corrective cues in squat and lunge movements.
 *
 * Knee valgus is measured by the angle between:
 * - The line from hip to knee (projected to frontal plane)
 * - The line from knee to ankle (projected to frontal plane)
 *
 * If the knee is medial (inside) of the line between hip and ankle,
 * valgus is present.
 */

import type { Landmark } from '../../src/packages/scoring';

export interface KneeValgusResult {
  leftValgusAngle: number;    // Degrees of inward collapse (0 = neutral, >0 = valgus)
  rightValgusAngle: number;
  isLeftCaving: boolean;
  isRightCaving: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
}

const VALGUS_THRESHOLD_MILD = 5;      // degrees
const VALGUS_THRESHOLD_MODERATE = 10;
const VALGUS_THRESHOLD_SEVERE = 15;

/**
 * Calculate knee valgus angle in the frontal plane.
 *
 * We project hip, knee, and ankle onto the frontal plane (x-y only)
 * and measure how far the knee deviates medially from the hip-ankle line.
 */
export function detectKneeValgus(
  leftHip: Landmark,
  leftKnee: Landmark,
  leftAnkle: Landmark,
  rightHip: Landmark,
  rightKnee: Landmark,
  rightAnkle: Landmark,
): KneeValgusResult {
  const leftAngle = calculateFrontalPlaneValgus(leftHip, leftKnee, leftAnkle, 'left');
  const rightAngle = calculateFrontalPlaneValgus(rightHip, rightKnee, rightAnkle, 'right');

  const maxAngle = Math.max(leftAngle, rightAngle);
  let severity: KneeValgusResult['severity'] = 'none';
  if (maxAngle >= VALGUS_THRESHOLD_SEVERE) severity = 'severe';
  else if (maxAngle >= VALGUS_THRESHOLD_MODERATE) severity = 'moderate';
  else if (maxAngle >= VALGUS_THRESHOLD_MILD) severity = 'mild';

  return {
    leftValgusAngle: leftAngle,
    rightValgusAngle: rightAngle,
    isLeftCaving: leftAngle >= VALGUS_THRESHOLD_MILD,
    isRightCaving: rightAngle >= VALGUS_THRESHOLD_MILD,
    severity,
  };
}

/**
 * Calculate the valgus angle for one leg in the frontal (coronal) plane.
 *
 * Method:
 * 1. Project all three points onto the frontal plane (use x and y only, ignore z)
 * 2. Find the expected knee x-position (linear interpolation between hip and ankle)
 * 3. Calculate the angular deviation of actual knee position from expected
 */
function calculateFrontalPlaneValgus(
  hip: Landmark,
  knee: Landmark,
  ankle: Landmark,
  side: 'left' | 'right',
): number {
  // In frontal plane, we compare the knee's x-position relative to hip-ankle line
  // Vertical fraction from hip to ankle where knee sits
  const totalVertical = Math.abs(ankle.y - hip.y);
  if (totalVertical < 0.001) return 0; // Not in a meaningful pose

  const kneeVerticalFraction = Math.abs(knee.y - hip.y) / totalVertical;

  // Expected knee x-position (linear interpolation along hip-ankle in x)
  const expectedKneeX = hip.x + kneeVerticalFraction * (ankle.x - hip.x);

  // Actual knee deviation from expected position
  const deviationX = knee.x - expectedKneeX;

  // Convert deviation to angle using atan2
  const verticalDistance = Math.abs(knee.y - hip.y);
  if (verticalDistance < 0.001) return 0;

  const deviationAngle = Math.atan2(Math.abs(deviationX), verticalDistance) * (180 / Math.PI);

  // For left leg: knee collapsing inward = knee moving RIGHT (positive x in screen coords)
  // For right leg: knee collapsing inward = knee moving LEFT (negative x in screen coords)
  const isCollapsing = side === 'left' ? deviationX > 0 : deviationX < 0;

  return isCollapsing ? deviationAngle : 0;
}
