// Visualization-related geometry functions
import {
  calculateCurvedScreenGeometry,
  createBezierArc,
  generateCurvedScreenArcs as generateArcs,
} from './curved'

/**
 * Generate visualization data from configuration and statistics
 *
 * This function takes the output of calculateStats() from calculations.js
 * and transforms it into visualization data for rendering in the UI.
 *
 * @param {Object} config - The configuration object with screen, distance, layout, and curvature properties
 * @param {Object} stats - The statistics object returned by calculateStats() function
 * @param {Object} stats.geom - Geometry data needed for visualization
 * @param {Object} stats.geom.pivotL - Left pivot point coordinates {x, y}
 * @param {Object} stats.geom.pivotR - Right pivot point coordinates {x, y}
 * @param {Object} stats.geom.uL - Left direction vector {x, y}
 * @param {Object} stats.geom.uR - Right direction vector {x, y}
 * @param {boolean} stats.geom.isCurved - Whether the screen is curved
 * @param {number} stats.geom.W_eff - Effective width
 * @param {number} stats.geom.d_eff - Effective distance
 * @param {number} stats.geom.s - Sagitta (depth) for curved screens
 * @param {string} stats.geom.setupType - Setup type ('single' or 'triple')
 * @param {number} stats.geom.a - Half width plus bezel
 * @param {number} stats.sideAngleDeg - Side angle in degrees
 * @returns {Object} Visualization data for rendering
 */
export function createVisualizationData(config, stats) {
  const { geom, sideAngleDeg } = stats
  const { isCurved, setupType, W_eff, d_eff, s, a, pivotL, pivotR, uL, uR } = geom

  // Create basic rendering structure
  const visualData = {
    type: isCurved ? 'curved' : 'flat',
    screenEdges: [],
    lines: [],
    arcs: [],
  }

  // Generate screen representation
  if (isCurved) {
    // Generate SVG arcs for curved screens
    const centerY = -d_eff // chord plane
    const screenW = W_eff // effective width

    // Use the UI module to generate SVG arcs
    visualData.arcs = generateCurvedScreenArcs(screenW, centerY, s, sideAngleDeg, setupType, a)
  } else {
    // For flat screens, use the placement vectors
    visualData.lines = [
      { x1: pivotL.x, y1: pivotL.y, x2: pivotL.x + uL.x, y2: pivotL.y + uL.y },
      { x1: pivotR.x, y1: pivotR.y, x2: pivotR.x + uR.x, y2: pivotR.y + uR.y },
      { x1: pivotL.x, y1: pivotL.y, x2: pivotR.x, y2: pivotR.y },
    ]
  }

  // Process the visualization data for SVG rendering
  const svgLayout = calculateSvgLayout({
    pivotL,
    pivotR,
    uL,
    uR,
    svgArcs: visualData.arcs,
  })

  // Return the processed visualization data
  return svgLayout
}

/* ------------------------------------------------------------------
 *  Bézier helper for curved-panel SVG preview
 * -----------------------------------------------------------------*/
export function curvedScreenBezier(
  chordW,
  centerY,
  sagittaIn,
  yawDeg = 0,
  mirror = false,
  pivotX = 0,
  apexShiftMultiplier = 1.0
) {
  // Calculate the geometry
  const geometry = calculateCurvedScreenGeometry(
    chordW,
    centerY,
    sagittaIn,
    yawDeg,
    mirror,
    pivotX,
    apexShiftMultiplier
  )

  // Create and return the Bezier arc
  return createBezierArc(geometry)
}

/**
 * Generates SVG arcs for curved screens
 */
export function generateCurvedScreenArcs(
  screenW,
  centerY,
  depth,
  sideAngleDeg,
  setupType,
  pivotDistance,
  apexShiftMultiplier = 2.75
) {
  // Use the function from curved.js
  return generateArcs(
    screenW,
    centerY,
    depth,
    sideAngleDeg,
    setupType,
    pivotDistance,
    apexShiftMultiplier
  )
}

export function calculateSvgLayout(geomData) {
  // Convert to centered coordinate system
  const centerX = 0
  const centerY = 0

  const { pivotL, pivotR, uL, uR, svgArcs } = geomData

  // Convert all coordinates to be relative to center (0,0)
  const relativePivotL = {
    x: pivotL.x - centerX,
    y: pivotL.y - centerY,
  }

  const relativePivotR = {
    x: pivotR.x - centerX,
    y: pivotR.y - centerY,
  }

  const endL = {
    x: relativePivotL.x + uL.x,
    y: relativePivotL.y + uL.y,
  }

  const endR = {
    x: relativePivotR.x + uR.x,
    y: relativePivotR.y + uR.y,
  }

  // Process SVG arcs for curved screens
  const arcs = svgArcs
    ? svgArcs.map(arc => {
        if (arc.type === 'bezier') {
          // For Bézier curves, convert to relative coordinates
          const result = {
            type: 'bezier',
            path: `M ${arc.startX - centerX} ${arc.startY - centerY} Q ${arc.controlX - centerX} ${arc.controlY - centerY} ${arc.endX - centerX} ${arc.endY - centerY}`,
            startX: arc.startX - centerX,
            startY: arc.startY - centerY,
            endX: arc.endX - centerX,
            endY: arc.endY - centerY,
            controlX: arc.controlX - centerX,
            controlY: arc.controlY - centerY,
            actualDeepestY: arc.actualDeepestY ? arc.actualDeepestY - centerY : undefined,
            actualDeepestPoint: arc.actualDeepestPoint
              ? [arc.actualDeepestPoint[0] - centerX, arc.actualDeepestPoint[1] - centerY]
              : undefined,
          }

          // Preserve idealPoints if they exist, adjusting for the center offset
          if (arc.idealPoints) {
            result.idealPoints = arc.idealPoints.map(point => [
              point[0] - centerX,
              point[1] - centerY,
            ])
          }

          return result
        } else {
          // For standard arcs, convert to relative coordinates
          const startX =
            (arc.startX || arc.centerX + arc.radius * Math.cos(arc.startAngle)) - centerX
          const startY =
            (arc.startY || arc.centerY + arc.radius * Math.sin(arc.startAngle)) - centerY
          const endX = (arc.endX || arc.centerX + arc.radius * Math.cos(arc.endAngle)) - centerX
          const endY = (arc.endY || arc.centerY + arc.radius * Math.sin(arc.endAngle)) - centerY
          const centerX_rel = arc.centerX - centerX
          const centerY_rel = arc.centerY - centerY

          // Determine if the arc is larger than 180 degrees (large-arc-flag)
          const largeArcFlag = Math.abs(arc.endAngle - arc.startAngle) > Math.PI ? 1 : 0

          // Include sweep flag based on angle direction
          const sweepFlag = arc.endAngle > arc.startAngle ? 1 : 0

          // SVG path for arc
          return {
            path: `M ${startX} ${startY} A ${arc.radius} ${arc.radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`,
            centerX: centerX_rel,
            centerY: centerY_rel,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            actualDeepestY: arc.actualDeepestY ? arc.actualDeepestY - centerY : undefined,
            actualDeepestPoint: arc.actualDeepestPoint
              ? [arc.actualDeepestPoint[0] - centerX, arc.actualDeepestPoint[1] - centerY]
              : undefined,
          }
        }
      })
    : []

  // Extract screen edges for FOV lines
  const screenEdges = []

  // For flat screens, use the line endpoints
  if (!svgArcs || svgArcs.length === 0) {
    screenEdges.push(
      { x: endL.x, y: endL.y }, // Left screen outer edge
      { x: relativePivotL.x, y: relativePivotL.y }, // Left screen inner edge
      { x: relativePivotR.x, y: relativePivotR.y }, // Right screen inner edge
      { x: endR.x, y: endR.y } // Right screen outer edge
    )
  }
  // For curved screens, use the arc endpoints
  else {
    arcs.forEach(arc => {
      if (arc.type === 'bezier') {
        screenEdges.push({ x: arc.startX, y: arc.startY }, { x: arc.endX, y: arc.endY })
      } else {
        screenEdges.push({ x: arc.startX, y: arc.startY }, { x: arc.endX, y: arc.endY })
      }
    })
  }

  // Calculate lines for flat screens
  const lines = [
    { x1: relativePivotL.x, y1: relativePivotL.y, x2: endL.x, y2: endL.y },
    { x1: relativePivotR.x, y1: relativePivotR.y, x2: endR.x, y2: endR.y },
    { x1: relativePivotL.x, y1: relativePivotL.y, x2: relativePivotR.x, y2: relativePivotR.y },
  ]

  // Calculate total width for viewport scaling
  const points = [
    { x: 0, y: 0 }, // Center point
    relativePivotL,
    relativePivotR,
    endL,
    endR,
    ...screenEdges,
  ]

  // Add arc points if they exist
  if (arcs.length > 0) {
    arcs.forEach(arc => {
      points.push({ x: arc.startX, y: arc.startY }, { x: arc.endX, y: arc.endY })
      if (arc.type === 'bezier') {
        points.push({ x: arc.controlX, y: arc.controlY })
      }
    })
  }

  // Calculate bounds for total width
  const minX = Math.min(...points.map(p => p.x))
  const maxX = Math.max(...points.map(p => p.x))
  const totalWidth = Math.abs(maxX - minX) * 1.2 // Add 20% margin

  return {
    lines,
    screenEdges,
    arcs,
    totalWidth,
  }
}
