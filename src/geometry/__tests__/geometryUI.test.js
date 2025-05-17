// src/geometry/__tests__/geometryUI.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { calculateSvgLayout, createVisualizationData } from '../visualization'
import { calculateStats } from '../calculations'
import { RIG_CONSTANTS } from '../constants'

describe('calculateSvgLayout', () => {
  let geomData

  beforeEach(() => {
    // Create sample geometry data for testing
    const config = {
      screen: {
        diagIn: 27,
        ratio: '16:9',
        bezelMm: 10,
        screenWidth: 700,
        screenHeight: 400,
      },
      distance: {
        distCm: 70,
      },
      layout: {
        setupType: 'triple',
        manualAngle: 60,
      },
      curvature: {
        isCurved: false,
        curveRadius: 1000,
      },
      ui: {
        inputMode: 'diagonal',
        angleMode: 'auto',
      },
    }

    const stats = calculateStats(config)
    // Use createVisualizationData to generate visualization data
    const visualData = createVisualizationData(config, stats)
    geomData = {
      pivotL: stats.geom.pivotL,
      pivotR: stats.geom.pivotR,
      uL: stats.geom.uL,
      uR: stats.geom.uR,
      svgArcs: visualData.arcs,
    }
  })

  it('calculates correct SVG dimensions', () => {
    const result = calculateSvgLayout(geomData, RIG_CONSTANTS)

    // Check that all expected properties are returned
    expect(result).toHaveProperty('lines')
    expect(result).toHaveProperty('totalWidth')

    // Verify totalWidth is a positive number
    expect(result.totalWidth).toBeGreaterThan(0)

    // Check lines array
    expect(result.lines).toHaveLength(3)
    result.lines.forEach(line => {
      expect(line).toHaveProperty('x1')
      expect(line).toHaveProperty('y1')
      expect(line).toHaveProperty('x2')
      expect(line).toHaveProperty('y2')
    })
  })

  it('generates SVG arcs for curved screens', () => {
    // Create geometry data with curved screens
    const curvedConfig = {
      screen: {
        diagIn: 27,
        ratio: '16:9',
        bezelMm: 10,
        screenWidth: 700,
        screenHeight: 400,
      },
      distance: {
        distCm: 70,
      },
      layout: {
        setupType: 'triple',
        manualAngle: 60,
      },
      curvature: {
        isCurved: true,
        curveRadius: 1000,
      },
      ui: {
        inputMode: 'diagonal',
        angleMode: 'auto',
      },
    }

    const curvedStats = calculateStats(curvedConfig)

    // Use createVisualizationData to generate visualization data
    const result = createVisualizationData(curvedConfig, curvedStats)

    // Check that arcs array is returned
    expect(result).toHaveProperty('arcs')
    expect(Array.isArray(result.arcs)).toBe(true)

    // For triple curved screens, we should have 3 arcs (center, left, right)
    expect(result.arcs.length).toBe(3)

    // Each arc should have a path property
    result.arcs.forEach(arc => {
      expect(arc).toHaveProperty('path')
      expect(typeof arc.path).toBe('string')
      // SVG path should start with M
      expect(arc.path.startsWith('M ')).toBe(true)
      // Path should include either A for arc or Q for Bézier curve
      expect(arc.path.includes(' A ') || arc.path.includes(' Q ')).toBe(true)

      // If it's a Bézier curve, it should have the type property
      if (arc.path.includes(' Q ')) {
        expect(arc).toHaveProperty('type', 'bezier')
        expect(arc).toHaveProperty('controlX')
        expect(arc).toHaveProperty('controlY')

        // Check for idealPoints property
        expect(arc).toHaveProperty('idealPoints')
        expect(Array.isArray(arc.idealPoints)).toBe(true)
        expect(arc.idealPoints.length).toBe(2) // Should have 2 points (25% and 75%)

        // Each idealPoint should be an array of two numbers [x, y]
        arc.idealPoints.forEach(point => {
          expect(Array.isArray(point)).toBe(true)
          expect(point.length).toBe(2)
          expect(typeof point[0]).toBe('number')
          expect(typeof point[1]).toBe('number')
        })
      }
    })
  })

  it('handles empty or missing svgArcs', () => {
    // Create a copy of geomData without svgArcs
    const geomDataWithoutArcs = { ...geomData, svgArcs: [] }

    // Should not throw an error
    expect(() => calculateSvgLayout(geomDataWithoutArcs, RIG_CONSTANTS)).not.toThrow()

    // Result should have an empty arcs array
    const result = calculateSvgLayout(geomDataWithoutArcs, RIG_CONSTANTS)
    expect(result.arcs).toEqual([])
  })

  it('correctly transforms coordinates', () => {
    const result = calculateSvgLayout(geomData, RIG_CONSTANTS)

    // All lines should have valid coordinates
    result.lines.forEach(line => {
      expect(typeof line.x1).toBe('number')
      expect(typeof line.y1).toBe('number')
      expect(typeof line.x2).toBe('number')
      expect(typeof line.y2).toBe('number')
    })
  })
})
