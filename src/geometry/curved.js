// Curved screen geometry calculations
// This module contains functions for calculating the geometry of curved screens

// Helper functions for curved screen geometry
/**
 * Convert degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
function degToRad(deg) {
  return (deg * Math.PI) / 180
}

/**
 * Get base Bezier points and deepest point for chord and sagitta.
 * @param {number} halfWidth
 * @param {number} centerY
 * @param {number} sagitta
 * @param {number} apexShift
 * @returns {{p0:{x:number,y:number},p1:{x:number,y:number},p2:{x:number,y:number},actualDeepestPoint:{x:number,y:number}}}
 */
function getBasePoints(halfWidth, centerY, sagitta, apexShift) {
  const p0 = { x: -halfWidth, y: centerY }
  const p1 = { x: 0, y: centerY - sagitta * apexShift }
  const p2 = { x: halfWidth, y: centerY }
  const actualDeepestPoint = { x: 0, y: centerY - sagitta }
  return { p0, p1, p2, actualDeepestPoint }
}

/**
 * Compute circle radius from half chord and sagitta.
 * @param {number} halfWidth
 * @param {number} sagitta
 * @returns {number}
 */
function computeRadius(halfWidth, sagitta) {
  return (halfWidth * halfWidth + sagitta * sagitta) / (2 * sagitta)
}

/**
 * Compute original circle center given centerY, radius, and sagitta.
 * @param {number} centerY
 * @param {number} radius
 * @param {number} sagitta
 * @returns {{x:number,y:number}}
 */
function computeOriginalCircleCenter(centerY, radius, sagitta) {
  return { x: 0, y: centerY + radius - sagitta }
}

/**
 * Compute start and end angles for arc between two points relative to center.
 * @param {{x:number,y:number}} pStart
 * @param {{x:number,y:number}} pEnd
 * @param {{x:number,y:number}} center
 * @returns {{startAngle:number,endAngle:number}}
 */
function computeArcAngles(pStart, pEnd, center) {
  const startAngle = Math.atan2(pStart.y - center.y, pStart.x - center.x)
  const endAngle = Math.atan2(pEnd.y - center.y, pEnd.x - center.x)
  return { startAngle, endAngle }
}

/**
 * Compute point on circle at given angle.
 * @param {{x:number,y:number}} center
 * @param {number} radius
 * @param {number} angle
 * @returns {{x:number,y:number}}
 */
function computePointOnCircle(center, radius, angle) {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  }
}

/**
 * Create a rotation function for a given yaw angle and pivot.
 * @param {number} yawDeg
 * @param {number} pivotX
 * @param {number} pivotY
 * @returns {function({x:number,y:number}):{x:number,y:number}}
 */
function createRotation(yawDeg, pivotX, pivotY) {
  const ang = degToRad(-yawDeg)
  const cos = Math.cos(ang)
  const sin = Math.sin(ang)
  return function (point) {
    const relX = point.x - pivotX
    const relY = point.y - pivotY
    return {
      x: pivotX + cos * relX - sin * relY,
      y: pivotY + sin * relX + cos * relY,
    }
  }
}

/**
 * Mirror a point across vertical line at pivotX.
 * @param {{x:number,y:number}} point
 * @param {number} pivotX
 * @returns {{x:number,y:number}}
 */
function mirrorPoint(point, pivotX) {
  return { x: 2 * pivotX - point.x, y: point.y }
}
/**
 * Calculate curved screen geometry (chord length, sagitta, radius)
 * @param {number} W - Screen width in inches
 * @param {number} curveRadius - Curve radius in mm
 * @returns {{C:number, s:number, Rin:number}}
 */
export function calculateCurvedGeometry(W, curveRadius) {
  const Rin = curveRadius / 25.4
  const theta = W / Rin
  const C = 2 * Rin * Math.sin(theta / 2)
  const s = Rin * (1 - Math.cos(theta / 2))
  return { C, s, Rin }
}
/**
 * Calculates the geometry of a curved screen using a circular arc
 * @param {number} chordW - Width of the chord (screen width)
 * @param {number} centerY - Y-coordinate of the center of the chord
 * @param {number} sagittaIn - Depth of the curve (sagitta)
 * @param {number} yawDeg - Yaw angle in degrees (for side screens)
 * @param {boolean} mirror - Whether to mirror the screen (for side screens)
 * @param {number} pivotX - X-coordinate of the pivot point (for side screens)
 * @param {number} apexShiftMultiplier - Multiplier to adjust the curve apex position (1.0 = true circle)
 * @returns {Object} - Object containing the geometry of the curved screen
 */
export function calculateCurvedScreenGeometry(
  chordW,
  centerY,
  sagittaIn,
  yawDeg = 0,
  mirror = false,
  pivotX = 0,
  apexShiftMultiplier = 1.0
) {
  // Compute half-width for chord
  const half = chordW / 2
  // Compute base Bezier and deepest points
  let { p0, p1, p2, actualDeepestPoint } = getBasePoints(
    half,
    centerY,
    sagittaIn,
    apexShiftMultiplier
  )
  // Compute radius and original circle center
  const radius = computeRadius(half, sagittaIn)
  const originalCenter = computeOriginalCircleCenter(centerY, radius, sagittaIn)
  // Compute original arc angles
  const { startAngle: originalStartAngle, endAngle: originalEndAngle } = computeArcAngles(
    p0,
    p2,
    originalCenter
  )
  // Compute ideal points at 25% and 75% along original arc
  const a1 = originalStartAngle + 0.25 * (originalEndAngle - originalStartAngle)
  const a2 = originalStartAngle + 0.75 * (originalEndAngle - originalStartAngle)
  let idealPoint1 = computePointOnCircle(originalCenter, radius, a1)
  let idealPoint2 = computePointOnCircle(originalCenter, radius, a2)
  // Create rotation and apply
  const rot = createRotation(yawDeg, pivotX, centerY)
  p0 = rot(p0)
  p1 = rot(p1)
  p2 = rot(p2)
  idealPoint1 = rot(idealPoint1)
  idealPoint2 = rot(idealPoint2)
  let rotatedDeepest = rot(actualDeepestPoint)
  // Mirror if needed
  if (mirror) {
    p0 = mirrorPoint(p0, pivotX)
    p1 = mirrorPoint(p1, pivotX)
    p2 = mirrorPoint(p2, pivotX)
    idealPoint1 = mirrorPoint(idealPoint1, pivotX)
    idealPoint2 = mirrorPoint(idealPoint2, pivotX)
    rotatedDeepest = mirrorPoint(rotatedDeepest, pivotX)
  }
  // Transform circle center
  let circleCenter = rot(originalCenter)
  if (mirror) {
    circleCenter = mirrorPoint(circleCenter, pivotX)
  }
  const circleCenterX = circleCenter.x
  const circleCenterY = circleCenter.y
  // Compute final start and end angles
  const { startAngle, endAngle } = computeArcAngles(p0, p2, circleCenter)

  return {
    // Bezier curve points
    startPoint: p0,
    controlPoint: p1,
    endPoint: p2,

    // Circle geometry
    radius,
    circleCenterX,
    circleCenterY,
    startAngle,
    endAngle,

    // Ideal points on the true circle
    idealPoints: [
      [idealPoint1.x, idealPoint1.y],
      [idealPoint2.x, idealPoint2.y],
    ],

    // Actual deepest point (post-rotation/mirroring) for debugging
    actualDeepestPoint: [rotatedDeepest.x, rotatedDeepest.y],

    // Additional metadata
    isRotated: yawDeg !== 0,
    isMirrored: mirror,
    yawDeg,
    pivotX,
    apexShiftMultiplier,
  }
}

/**
 * Creates a Bezier curve representation of a curved screen
 * @param {Object} geometry - The geometry of the curved screen
 * @returns {Object} - Object containing the Bezier curve representation
 */
export function createBezierArc(geometry) {
  const {
    startPoint: p0,
    controlPoint: p1,
    endPoint: p2,
    idealPoints,
    actualDeepestPoint,
  } = geometry

  return {
    type: 'bezier',
    startX: p0.x,
    startY: p0.y,
    controlX: p1.x,
    controlY: p1.y,
    endX: p2.x,
    endY: p2.y,
    path: `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`,
    idealPoints,
    actualDeepestPoint,
    // Extract the y-coordinate for compatibility with calculateSvgLayout
    actualDeepestY: actualDeepestPoint ? actualDeepestPoint[1] : undefined,
  }
}

/**
 * Generates SVG arcs for curved screens
 * @param {number} screenW - Width of the screen
 * @param {number} centerY - Y-coordinate of the center of the screen
 * @param {number} depth - Depth of the curve
 * @param {number} sideAngleDeg - Angle of the side screens in degrees
 * @param {string} setupType - Type of setup ('single' or 'triple')
 * @param {number} pivotDistance - Distance between the pivot points
 * @param {number} apexShiftMultiplier - Multiplier to adjust the curve apex position (1.0 = true circle)
 * @returns {Array} - Array of SVG arcs
 */
export function generateCurvedScreenArcs(
  screenW,
  centerY,
  depth,
  sideAngleDeg,
  setupType,
  pivotDistance,
  apexShiftMultiplier = 1.0
) {
  const svgArcs = []

  if (setupType === 'single') {
    // Calculate geometry for a single screen
    const geometry = calculateCurvedScreenGeometry(
      screenW,
      centerY,
      depth,
      0,
      false,
      0,
      apexShiftMultiplier
    )
    svgArcs.push(createBezierArc(geometry))
  } else {
    // Calculate geometry for center screen
    const centerGeometry = calculateCurvedScreenGeometry(
      screenW,
      centerY,
      depth,
      0,
      false,
      0,
      apexShiftMultiplier
    )
    svgArcs.push(createBezierArc(centerGeometry))

    // Calculate geometry for right screen
    const rightGeometry = calculateCurvedScreenGeometry(
      screenW,
      centerY,
      depth,
      sideAngleDeg,
      true,
      pivotDistance,
      apexShiftMultiplier
    )
    svgArcs.push(createBezierArc(rightGeometry))

    // Calculate geometry for left screen
    const leftGeometry = calculateCurvedScreenGeometry(
      screenW,
      centerY,
      depth,
      -sideAngleDeg,
      true,
      -pivotDistance,
      apexShiftMultiplier
    )
    svgArcs.push(createBezierArc(leftGeometry))
  }

  return svgArcs
}
