// src/geometry/__tests__/math.test.js
import { describe, it, expect } from 'vitest'
import {
  deg2rad,
  rad2deg,
  sindeg,
  cosdeg,
  tandeg,
  asindeg,
  acosdeg,
  atandeg,
  atan2deg,
  clamp,
  calculateFOV,
  calculateSagitta,
  calculateChord,
  vectorAngle,
  rotatePoint,
  normalizeAngle,
  shortestAngularDistance,
} from '../math'

describe('Angle conversion utilities', () => {
  it('converts degrees to radians', () => {
    expect(deg2rad(0)).toBe(0)
    expect(deg2rad(180)).toBeCloseTo(Math.PI, 10)
    expect(deg2rad(360)).toBeCloseTo(2 * Math.PI, 10)
    expect(deg2rad(90)).toBeCloseTo(Math.PI / 2, 10)
  })

  it('converts radians to degrees', () => {
    expect(rad2deg(0)).toBe(0)
    expect(rad2deg(Math.PI)).toBeCloseTo(180, 10)
    expect(rad2deg(2 * Math.PI)).toBeCloseTo(360, 10)
    expect(rad2deg(Math.PI / 2)).toBeCloseTo(90, 10)
  })
})

describe('Trigonometric utilities', () => {
  it('calculates sine in degrees', () => {
    expect(sindeg(0)).toBeCloseTo(0, 10)
    expect(sindeg(90)).toBeCloseTo(1, 10)
    expect(sindeg(180)).toBeCloseTo(0, 10)
    expect(sindeg(270)).toBeCloseTo(-1, 10)
  })

  it('calculates cosine in degrees', () => {
    expect(cosdeg(0)).toBeCloseTo(1, 10)
    expect(cosdeg(90)).toBeCloseTo(0, 10)
    expect(cosdeg(180)).toBeCloseTo(-1, 10)
    expect(cosdeg(270)).toBeCloseTo(0, 10)
  })

  it('calculates tangent in degrees', () => {
    expect(tandeg(0)).toBeCloseTo(0, 10)
    expect(tandeg(45)).toBeCloseTo(1, 10)
    expect(tandeg(180)).toBeCloseTo(0, 10)
  })

  it('calculates arcsine in degrees', () => {
    expect(asindeg(0)).toBeCloseTo(0, 10)
    expect(asindeg(1)).toBeCloseTo(90, 10)
    expect(asindeg(-1)).toBeCloseTo(-90, 10)
  })

  it('calculates arccosine in degrees', () => {
    expect(acosdeg(1)).toBeCloseTo(0, 10)
    expect(acosdeg(0)).toBeCloseTo(90, 10)
    expect(acosdeg(-1)).toBeCloseTo(180, 10)
  })

  it('calculates arctangent in degrees', () => {
    expect(atandeg(0)).toBeCloseTo(0, 10)
    expect(atandeg(1)).toBeCloseTo(45, 10)
    expect(atandeg(Infinity)).toBeCloseTo(90, 10)
  })

  it('calculates atan2 in degrees', () => {
    expect(atan2deg(0, 1)).toBeCloseTo(0, 10)
    expect(atan2deg(1, 0)).toBeCloseTo(90, 10)
    expect(atan2deg(0, -1)).toBeCloseTo(180, 10)
    expect(atan2deg(-1, 0)).toBeCloseTo(-90, 10)
  })
})

describe('Utility functions', () => {
  it('clamps values between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('calculates field of view', () => {
    expect(calculateFOV(10, 10)).toBeCloseTo(53.13, 1)
    expect(calculateFOV(20, 10)).toBeCloseTo(90, 0)
    expect(calculateFOV(10, 20)).toBeCloseTo(28.07, 1)
  })

  it('calculates sagitta of a circular arc', () => {
    expect(calculateSagitta(10, 20)).toBeCloseTo(0.64, 2)
    expect(calculateSagitta(20, 20)).toBeCloseTo(2.68, 2)
  })

  it('calculates chord length of a circular arc', () => {
    expect(calculateChord(10, 20)).toBeCloseTo(9.9, 2)
    expect(calculateChord(20, 20)).toBeCloseTo(19.18, 2)
  })

  it('calculates angle between vectors', () => {
    const v1 = { x: 1, y: 0 }
    const v2 = { x: 0, y: 1 }
    const v3 = { x: -1, y: 0 }

    expect(vectorAngle(v1, v2)).toBeCloseTo(90, 1)
    expect(vectorAngle(v1, v3)).toBeCloseTo(180, 1)
    expect(vectorAngle(v1, v1)).toBeCloseTo(0, 1)
  })

  it('rotates a point around an origin', () => {
    const point = { x: 1, y: 0 }
    const origin = { x: 0, y: 0 }

    const rotated90 = rotatePoint(point, origin, 90)
    expect(rotated90.x).toBeCloseTo(0, 2)
    expect(rotated90.y).toBeCloseTo(1, 2)

    const rotated180 = rotatePoint(point, origin, 180)
    expect(rotated180.x).toBeCloseTo(-1, 2)
    expect(rotated180.y).toBeCloseTo(0, 2)

    // Test with non-zero origin
    const nonZeroOrigin = { x: 1, y: 1 }
    const pointToRotate = { x: 2, y: 1 }

    const rotated = rotatePoint(pointToRotate, nonZeroOrigin, 90)
    expect(rotated.x).toBeCloseTo(1, 2)
    expect(rotated.y).toBeCloseTo(2, 2)
  })

  it('normalizes angles to 0-360 range', () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(360)).toBe(0)
    expect(normalizeAngle(361)).toBe(1)
    expect(normalizeAngle(-1)).toBe(359)
    expect(normalizeAngle(-360)).toBe(0)
  })

  it('calculates shortest angular distance', () => {
    expect(shortestAngularDistance(0, 90)).toBe(90)
    expect(shortestAngularDistance(0, 180)).toBe(180)
    expect(shortestAngularDistance(0, 181)).toBe(-179)
    expect(shortestAngularDistance(0, 270)).toBe(-90)
    expect(shortestAngularDistance(0, 359)).toBe(-1)
  })
})
