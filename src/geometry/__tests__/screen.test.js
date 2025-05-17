// src/geometry/__tests__/screen.test.js
import { describe, it, expect } from 'vitest'
import { calculateCurvedGeometry } from '../curved'
import {
  calculateScreenDimensions,
  calculateEffectiveScreenDimensions,
  calculateScreenDimensionsFromManual,
  calculateNormalizedValues,
  calculateOptimalViewingAngle,
  calculateAutoSideAngle,
  calculateHorizontalFOV,
  calculateVerticalFOV,
  calculatePlacementVectors,
  calculateTotalWidth,
  determineSideAngle,
} from '../screen'

describe('Screen dimension calculations', () => {
  it('calculates screen dimensions from diagonal and aspect ratio', () => {
    // 27" 16:9 monitor
    const dimensions = calculateScreenDimensions(27, '16:9')
    expect(dimensions.W).toBeCloseTo(23.5, 1)
    expect(dimensions.H).toBeCloseTo(13.2, 1)

    // 34" 21:9 monitor
    const ultrawide = calculateScreenDimensions(34, '21:9')
    expect(ultrawide.W).toBeCloseTo(31.25, 1)
    expect(ultrawide.H).toBeCloseTo(13.4, 1)

    // 49" 32:9 monitor
    const superUltrawide = calculateScreenDimensions(49, '32:9')
    expect(superUltrawide.W).toBeCloseTo(47.17, 2)
    expect(superUltrawide.H).toBeCloseTo(13.3, 1)
  })

  it('calculates effective screen dimensions accounting for bezel', () => {
    // 27" 16:9 monitor with 10mm bezel
    const dimensions = calculateEffectiveScreenDimensions(27, '16:9', 10)

    // Effective diagonal should be larger than the actual diagonal
    const effectiveDiag = Math.hypot(dimensions.W, dimensions.H)
    expect(effectiveDiag).toBeGreaterThan(27)

    // Test with different bezel sizes
    const smallBezel = calculateEffectiveScreenDimensions(27, '16:9', 5)
    const largeBezel = calculateEffectiveScreenDimensions(27, '16:9', 20)

    expect(largeBezel.W).toBeGreaterThan(smallBezel.W)
    expect(largeBezel.H).toBeGreaterThan(smallBezel.H)
  })

  it('calculates screen dimensions from manual width and height', () => {
    const dimensions = calculateScreenDimensionsFromManual(600, 340)
    expect(dimensions.W).toBeCloseTo(23.6, 1) // 600mm / 25.4
    expect(dimensions.H).toBeCloseTo(13.4, 1) // 340mm / 25.4
  })
})

describe('Curved screen calculations', () => {
  it('calculates curved screen geometry', () => {
    // 27" 16:9 monitor with 1000mm curve radius
    const { W } = calculateScreenDimensions(27, '16:9')
    const curved = calculateCurvedGeometry(W, 1000)

    // Chord length should be less than arc length (W)
    expect(curved.C).toBeLessThan(W)

    // Sagitta should be positive
    expect(curved.s).toBeGreaterThan(0)

    // Test with different curve radii
    const smallRadius = calculateCurvedGeometry(W, 800)
    const largeRadius = calculateCurvedGeometry(W, 1500)

    // Smaller radius = more curve = smaller chord length
    expect(smallRadius.C).toBeLessThan(curved.C)

    // Smaller radius = more curve = larger sagitta
    expect(smallRadius.s).toBeGreaterThan(curved.s)

    // Larger radius = less curve = larger chord length
    expect(largeRadius.C).toBeGreaterThan(curved.C)

    // Larger radius = less curve = smaller sagitta
    expect(largeRadius.s).toBeLessThan(curved.s)
  })

  it('calculates normalized values for angle calculation', () => {
    // Flat screen
    const flatValues = calculateNormalizedValues(24, 70, false, 0, 0)
    expect(flatValues.W_eff).toBe(24)
    expect(flatValues.d_eff).toBe(70)

    // Curved screen
    const curvedValues = calculateNormalizedValues(24, 70, true, 23, 2)
    expect(curvedValues.W_eff).toBe(23)
    expect(curvedValues.d_eff).toBe(68)
  })
})

describe('Angle calculations', () => {
  it('calculates optimal viewing angle', () => {
    // 27" 16:9 monitor at 70cm distance with 10mm bezel
    const angle = calculateOptimalViewingAngle(27, '16:9', 70, 10)
    expect(angle).toBeGreaterThan(0)
    expect(angle).toBeLessThan(90)

    // Test with different distances
    const closeDistance = calculateOptimalViewingAngle(27, '16:9', 50, 10)
    const farDistance = calculateOptimalViewingAngle(27, '16:9', 100, 10)

    // Closer distance = larger angle
    expect(closeDistance).toBeGreaterThan(angle)

    // Farther distance = smaller angle
    expect(farDistance).toBeLessThan(angle)

    // Test with different aspect ratios
    const ultrawide = calculateOptimalViewingAngle(34, '21:9', 70, 10)
    const superUltrawide = calculateOptimalViewingAngle(49, '32:9', 70, 10)

    // Wider aspect ratio = larger angle
    expect(ultrawide).toBeGreaterThan(angle)
    expect(superUltrawide).toBeGreaterThan(ultrawide)
  })

  it('calculates automatic side angle', () => {
    // Standard triple setup
    const angle = calculateAutoSideAngle(15, 24, 70)
    expect(angle).toBeGreaterThan(0)
    expect(angle).toBeLessThan(90)

    // Test with different parameters
    const widerSetup = calculateAutoSideAngle(20, 24, 70)
    const narrowerSetup = calculateAutoSideAngle(10, 24, 70)

    // Wider setup = larger angle
    expect(widerSetup).toBeGreaterThan(angle)

    // Narrower setup = smaller angle
    expect(narrowerSetup).toBeLessThan(angle)
  })

  it('determines side angle based on setup type and angle mode', () => {
    // Single setup
    const singleSetup = determineSideAngle('single', 'auto', 60, 15, 24, 70)
    expect(singleSetup).toBe(0)

    // Triple setup with auto angle
    const autoAngle = determineSideAngle('triple', 'auto', 60, 15, 24, 70)
    expect(autoAngle).toBeGreaterThan(0)
    expect(autoAngle).toBeLessThan(90)

    // Triple setup with manual angle
    const manualAngle = determineSideAngle('triple', 'manual', 45, 15, 24, 70)
    expect(manualAngle).toBe(45)
  })
})

describe('FOV calculations', () => {
  it('calculates horizontal FOV for single setup', () => {
    const fov = calculateHorizontalFOV('single', 24, 70, 0.5, 0, 0)
    expect(fov).toBeGreaterThan(0)
    expect(fov).toBeLessThan(90)
  })

  it('calculates horizontal FOV for triple setup', () => {
    const fov = calculateHorizontalFOV('triple', 24, 70, 0.5, 45, 15)
    expect(fov).toBeGreaterThan(60) // FOV should be significant for triple setup

    // Test with different angles
    const smallAngle = calculateHorizontalFOV('triple', 24, 70, 0.5, 30, 15)
    const largeAngle = calculateHorizontalFOV('triple', 24, 70, 0.5, 60, 15)

    // Different angles should result in different FOVs
    expect(smallAngle).not.toBeCloseTo(largeAngle, 0)

    // Test with larger screens for wider FOV
    const wideFOV = calculateHorizontalFOV('triple', 32, 70, 0.5, 45, 15)
    expect(wideFOV).toBeGreaterThan(fov) // Wider screens should have larger FOV
  })

  it('calculates vertical FOV', () => {
    const fov = calculateVerticalFOV(13.5, 70)
    expect(fov).toBeGreaterThan(0)
    expect(fov).toBeLessThan(90)

    // Test with different heights
    const smallHeight = calculateVerticalFOV(10, 70)
    const largeHeight = calculateVerticalFOV(20, 70)

    // Larger height = larger FOV
    expect(largeHeight).toBeGreaterThan(smallHeight)
  })
})

describe('UI calculations', () => {
  it('calculates placement vectors for single setup', () => {
    const vectors = calculatePlacementVectors('single', 24, 70, 0, 0)

    // Check pivot points
    expect(vectors.pivotL.x).toBeLessThan(0)
    expect(vectors.pivotL.y).toBeLessThan(0)
    expect(vectors.pivotR.x).toBeGreaterThan(0)
    expect(vectors.pivotR.y).toBeLessThan(0)

    // Check direction vectors (should be zero for single setup)
    expect(vectors.uL.x).toBe(0)
    expect(vectors.uL.y).toBe(0)
    expect(vectors.uR.x).toBe(0)
    expect(vectors.uR.y).toBe(0)
  })

  it('calculates placement vectors for triple setup', () => {
    const vectors = calculatePlacementVectors('triple', 24, 70, 45, 15)

    // Check pivot points
    expect(vectors.pivotL.x).toBeLessThan(0)
    expect(vectors.pivotL.y).toBeLessThan(0)
    expect(vectors.pivotR.x).toBeGreaterThan(0)
    expect(vectors.pivotR.y).toBeLessThan(0)

    // Check direction vectors (should be non-zero for triple setup)
    expect(Math.abs(vectors.uL.x)).toBeGreaterThan(0)
    expect(Math.abs(vectors.uL.y)).toBeGreaterThan(0)
    expect(Math.abs(vectors.uR.x)).toBeGreaterThan(0)
    expect(Math.abs(vectors.uR.y)).toBeGreaterThan(0)
  })

  it('calculates total width for footprint reporting', () => {
    // Single setup
    const singleVectors = calculatePlacementVectors('single', 24, 70, 0, 0)
    const singleWidth = calculateTotalWidth(
      'single',
      24,
      singleVectors.pivotL,
      singleVectors.pivotR,
      singleVectors.uL,
      singleVectors.uR
    )
    expect(singleWidth).toBeGreaterThan(0)

    // Triple setup
    const tripleVectors = calculatePlacementVectors('triple', 24, 70, 45, 15)
    const tripleWidth = calculateTotalWidth(
      'triple',
      24,
      tripleVectors.pivotL,
      tripleVectors.pivotR,
      tripleVectors.uL,
      tripleVectors.uR
    )
    expect(tripleWidth).toBeGreaterThan(0)

    // Triple setup should be wider than single setup
    expect(tripleWidth).toBeGreaterThan(singleWidth)
  })
})
