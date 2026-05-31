import type { Landmark } from './types';

/**
 * Calculate the angle at joint B formed by segments BA and BC
 * using the dot product (cosine rule) in 3D space.
 *
 * @returns Angle in degrees (0-180)
 */
export function calculateJointAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  // Guard against division by zero
  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = dot / (magBA * magBC);
  // Clamp to [-1, 1] to handle floating point errors
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));

  return Math.acos(clampedCos) * (180 / Math.PI);
}

/**
 * Calculate the midpoint between two landmarks
 */
export function calculateMidpoint(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

/**
 * Normalize a 3D vector
 */
export function normalize3D(v: Landmark): Landmark {
  const mag = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}
