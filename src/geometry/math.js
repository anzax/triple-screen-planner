/**
 * Math utilities for geometry calculations
 * This module contains composable math functions for geometry calculations
 */

// Constants
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

/**
 * Angle conversion utilities
 */
export const deg2rad = deg => deg * DEG_TO_RAD
export const rad2deg = rad => rad * RAD_TO_DEG

/**
 * Trigonometric utilities that work with degrees
 */
export const sindeg = deg => Math.sin(deg2rad(deg))
export const cosdeg = deg => Math.cos(deg2rad(deg))
export const tandeg = deg => Math.tan(deg2rad(deg))
export const asindeg = x => rad2deg(Math.asin(x))
export const acosdeg = x => rad2deg(Math.acos(x))
export const atandeg = x => rad2deg(Math.atan(x))
export const atan2deg = (y, x) => rad2deg(Math.atan2(y, x))

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} The clamped value
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Calculate field of view in degrees
 * @param {number} width - Width of the object
 * @param {number} distance - Distance to the object
 * @returns {number} Field of view in degrees
 */
export const calculateFOV = (width, distance) => 2 * atandeg(width / (2 * distance))

/**
 * Calculate the sagitta (depth) of a circular arc
 * @param {number} width - Width of the chord
 * @param {number} radius - Radius of the circle
 * @returns {number} Sagitta (depth) of the arc
 */
export const calculateSagitta = (width, radius) =>
  radius * (1 - Math.cos(Math.asin(width / (2 * radius))))

/**
 * Calculate the chord length of a circular arc
 * @param {number} width - Width of the arc (arc length)
 * @param {number} radius - Radius of the circle
 * @returns {number} Chord length
 */
export const calculateChord = (width, radius) => 2 * radius * Math.sin(width / (2 * radius))

/**
 * Calculate the angle between two vectors
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {number} Angle in degrees
 */
export const vectorAngle = (v1, v2) => {
  const dot = v1.x * v2.x + v1.y * v2.y
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
  return rad2deg(Math.acos(dot / (mag1 * mag2)))
}

/**
 * Rotate a point around an origin
 * @param {Object} point - Point to rotate {x, y}
 * @param {Object} origin - Origin to rotate around {x, y}
 * @param {number} angleDeg - Angle in degrees
 * @returns {Object} Rotated point {x, y}
 */
export const rotatePoint = (point, origin, angleDeg) => {
  const angleRad = deg2rad(angleDeg)
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  // Translate point to origin
  const x = point.x - origin.x
  const y = point.y - origin.y

  // Rotate point
  const xNew = x * cos - y * sin
  const yNew = x * sin + y * cos

  // Translate point back
  return {
    x: xNew + origin.x,
    y: yNew + origin.y,
  }
}

/**
 * Calculate the normalized angle (0-360)
 * @param {number} angleDeg - Angle in degrees
 * @returns {number} Normalized angle (0-360)
 */
export const normalizeAngle = angleDeg => ((angleDeg % 360) + 360) % 360

/**
 * Calculate the shortest angular distance between two angles
 * @param {number} a - First angle in degrees
 * @param {number} b - Second angle in degrees
 * @returns {number} Shortest angular distance (-180 to 180)
 */
export const shortestAngularDistance = (a, b) => {
  const normA = normalizeAngle(a)
  const normB = normalizeAngle(b)
  let diff = normB - normA
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return diff
}
