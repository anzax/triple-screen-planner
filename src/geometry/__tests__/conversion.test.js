// src/geometry/__tests__/conversion.test.js
import { describe, it, expect } from 'vitest'
import { cm2in, in2cm } from '../conversion'

describe('Unit Conversion Functions', () => {
  describe('cm2in', () => {
    it('converts centimeters to inches correctly', () => {
      expect(cm2in(2.54)).toBeCloseTo(1.0, 2)
      expect(cm2in(0)).toBe(0)
      expect(cm2in(25.4)).toBeCloseTo(10.0, 2)
      expect(cm2in(100)).toBeCloseTo(39.37, 2)
    })

    it('handles negative values', () => {
      expect(cm2in(-2.54)).toBeCloseTo(-1.0, 2)
      expect(cm2in(-25.4)).toBeCloseTo(-10.0, 2)
    })

    it('handles decimal values', () => {
      expect(cm2in(1.27)).toBeCloseTo(0.5, 2)
      expect(cm2in(0.254)).toBeCloseTo(0.1, 2)
    })
  })

  describe('in2cm', () => {
    it('converts inches to centimeters correctly', () => {
      expect(in2cm(1)).toBeCloseTo(2.54, 2)
      expect(in2cm(0)).toBe(0)
      expect(in2cm(10)).toBeCloseTo(25.4, 2)
      expect(in2cm(39.37)).toBeCloseTo(100, 2)
    })

    it('handles negative values', () => {
      expect(in2cm(-1)).toBeCloseTo(-2.54, 2)
      expect(in2cm(-10)).toBeCloseTo(-25.4, 2)
    })

    it('handles decimal values', () => {
      expect(in2cm(0.5)).toBeCloseTo(1.27, 2)
      expect(in2cm(0.1)).toBeCloseTo(0.254, 2)
    })
  })

  describe('Conversion Roundtrip', () => {
    it('converts back and forth correctly', () => {
      const originalCm = 42
      const inches = cm2in(originalCm)
      const backToCm = in2cm(inches)
      expect(backToCm).toBeCloseTo(originalCm, 2)
    })

    it('handles zero correctly in roundtrip', () => {
      expect(in2cm(cm2in(0))).toBe(0)
    })
  })
})
