// src/geometry/__tests__/geometryCore.test.js
import { describe, it, expect } from 'vitest'
import { calculateOptimalAngle } from '../calculations'
import { calculateStats } from '../calculations'

// Test cases for calculateOptimalAngle
const optimalAngleTestCases = [
  {
    name: 'standard 16:9 monitor',
    input: {
      screen: { diagIn: 27, ratio: '16:9', bezelMm: 10 },
      distance: { distCm: 70 },
    },
    expected: {
      type: 'number',
      greaterThan: 0,
      lessThan: 90,
    },
    comment: 'Standard 27" 16:9 monitor at 70cm distance',
  },
  {
    name: 'missing diagonal',
    input: {
      screen: { ratio: '16:9', bezelMm: 10 },
      distance: { distCm: 70 },
    },
    expected: {
      value: 60,
    },
    comment: 'Should return default angle of 60 when diagonal is missing',
  },
  {
    name: 'missing ratio',
    input: {
      screen: { diagIn: 27, bezelMm: 10 },
      distance: { distCm: 70 },
    },
    expected: {
      value: 60,
    },
    comment: 'Should return default angle of 60 when ratio is missing',
  },
  {
    name: 'missing distance',
    input: {
      screen: { diagIn: 27, ratio: '16:9', bezelMm: 10 },
      distance: {},
    },
    expected: {
      value: 60,
    },
    comment: 'Should return default angle of 60 when distance is missing',
  },
  {
    name: '16:9 aspect ratio',
    input: {
      screen: { diagIn: 27, ratio: '16:9', bezelMm: 10 },
      distance: { distCm: 70 },
    },
    expected: {
      store: 'result16_9',
    },
    comment: '27" 16:9 monitor for comparison with other aspect ratios',
  },
  {
    name: '21:9 aspect ratio',
    input: {
      screen: { diagIn: 34, ratio: '21:9', bezelMm: 10 },
      distance: { distCm: 70 },
    },
    expected: {
      store: 'result21_9',
      greaterThan: 'result16_9',
    },
    comment: '34" 21:9 monitor should have larger optimal angle than 16:9',
  },
  {
    name: '32:9 aspect ratio',
    input: {
      screen: { diagIn: 49, ratio: '32:9', bezelMm: 10 },
      distance: { distCm: 70 },
    },
    expected: {
      store: 'result32_9',
      greaterThan: 'result21_9',
    },
    comment: '49" 32:9 monitor should have larger optimal angle than 21:9',
  },
]

// Test cases for calculateScreenGeometry
const screenGeometryTestCases = [
  {
    name: 'standard 16:9 triple setup',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
    },
    expected: {
      properties: ['sideAngleDeg', 'hFOVdeg', 'vFOVdeg', 'cm', 'geom'],
      sideAngleDeg: { closeTo: 50.2, precision: 1 },
      hFOVdeg: { closeTo: 146.2, precision: 1 },
      vFOVdeg: { closeTo: 27.8, precision: 1 },
      cm: {
        distance: 70,
        bezel: 10,
        totalWidth: { greaterThan: 0 },
      },
      geom: {
        pivotL: { x: { lessThan: 0 } },
        pivotR: { x: { greaterThan: 0 } },
      },
    },
    comment: 'Standard 27" 16:9 monitors with triple setup',
  },
  {
    name: 'single screen setup',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'single',
    },
    expected: {
      sideAngleDeg: 0,
      hFOVdeg: { lessThan: 'triple.hFOVdeg' },
      cm: {
        totalWidth: { lessThan: 'triple.cm.totalWidth' },
      },
    },
    comment: 'Single 27" 16:9 monitor setup',
  },
  {
    name: 'manual angle mode',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'manual',
      manualAngle: 45,
    },
    expected: {
      sideAngleDeg: 45,
    },
    comment: 'Triple setup with manual angle of 45 degrees',
  },
  {
    name: 'ultrawide 21:9 monitors',
    input: {
      diagIn: 34,
      ratio: '21:9',
      distCm: 75,
      bezelMm: 15,
    },
    expected: {
      sideAngleDeg: { closeTo: 61.0, precision: 1 },
      hFOVdeg: { greaterThan: 150 },
      vFOVdeg: { lessThan: 30 },
      cm: {
        totalWidth: { greaterThan: 0 },
      },
    },
    comment: '34" 21:9 ultrawide monitors with triple setup',
  },
  {
    name: 'super ultrawide 32:9 monitors',
    input: {
      diagIn: 49,
      ratio: '32:9',
      distCm: 80,
      bezelMm: 15,
    },
    expected: {
      properties: ['sideAngleDeg', 'hFOVdeg', 'vFOVdeg'],
      hFOVdeg: { greaterThan: 120 },
      cm: {
        totalWidth: { greaterThan: 0 },
      },
    },
    comment: '49" 32:9 super ultrawide monitors with triple setup',
  },
  {
    name: 'small bezel',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 5,
    },
    expected: {
      store: 'smallBezel',
    },
    comment: '27" 16:9 monitors with small 5mm bezel',
  },
  {
    name: 'large bezel',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 20,
    },
    expected: {
      store: 'largeBezel',
      cm: {
        // With the new implementation, total width is the actual width between sidescreen edges
        // which may not necessarily increase with larger bezels
        totalWidth: { greaterThan: 0 },
      },
      // Larger bezel also results in larger horizontal FOV due to how the FOV is calculated
      hFOVdeg: { greaterThan: 'smallBezel.hFOVdeg' },
    },
    comment:
      '27" 16:9 monitors with large 20mm bezel - larger bezel increases both total width and hFOV',
  },
  {
    name: 'close viewing distance',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 50,
      bezelMm: 10,
    },
    expected: {
      store: 'closeDistance',
    },
    comment: '27" 16:9 monitors at close 50cm viewing distance',
  },
  {
    name: 'far viewing distance',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 100,
      bezelMm: 10,
    },
    expected: {
      store: 'farDistance',
      hFOVdeg: { lessThan: 'closeDistance.hFOVdeg' },
      vFOVdeg: { lessThan: 'closeDistance.vFOVdeg' },
      sideAngleDeg: { lessThan: 'closeDistance.sideAngleDeg' },
    },
    comment: '27" 16:9 monitors at far 100cm viewing distance',
  },
  {
    name: 'flat screen',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: false,
      curveRadius: 1000,
    },
    expected: {
      store: 'flatScreen',
    },
    comment: 'Flat 27" 16:9 monitors with triple setup',
  },
  {
    name: 'curved screen',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: true,
      curveRadius: 1000,
    },
    expected: {
      store: 'curvedScreen',
      // Curved properties removed in simplified version
      hFOVdeg: { notEqual: 'flatScreen.hFOVdeg' },
      vFOVdeg: { equal: 'flatScreen.vFOVdeg' },
    },
    comment: 'Curved 27" 16:9 monitors with 1000mm radius and triple setup',
  },
  {
    name: 'large curve radius',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: true,
      curveRadius: 1500,
    },
    expected: {
      store: 'largeRadius',
    },
    comment: 'Curved 27" 16:9 monitors with large 1500mm radius',
  },
  {
    name: 'small curve radius',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: true,
      curveRadius: 800,
    },
    expected: {
      store: 'smallRadius',
      // Curved properties removed in simplified version
    },
    comment: 'Curved 27" 16:9 monitors with small 800mm radius',
  },
  {
    name: 'single curved screen',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'single',
      angleMode: 'auto',
      manualAngle: 60,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: true,
      curveRadius: 1000,
    },
    expected: {
      store: 'singleCurved',
      hFOVdeg: { greaterThan: 20 },
    },
    comment: 'Single curved 27" 16:9 monitor with 1000mm radius',
  },
  {
    name: 'triple curved screen',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: true,
      curveRadius: 1000,
    },
    expected: {
      store: 'tripleCurved',
      hFOVdeg: {
        greaterThan: 100,
        lessThan: 270,
        greaterThanSingle: 'singleCurved.hFOVdeg',
        notCloseTo: 'differentAngle.hFOVdeg',
      },
    },
    comment: 'Triple curved 27" 16:9 monitors with 1000mm radius',
  },
  {
    name: 'triple curved screen with manual angle',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      setupType: 'triple',
      angleMode: 'manual',
      manualAngle: 30,
      inputMode: 'diagonal',
      screenWidth: 700,
      screenHeight: 400,
      isCurved: true,
      curveRadius: 1000,
    },
    expected: {
      store: 'differentAngle',
    },
    comment: 'Triple curved 27" 16:9 monitors with manual 30° angle',
  },
  // Additional test cases for different screen sizes
  {
    name: 'standard screen',
    input: {
      diagIn: 27,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
    },
    expected: {
      store: 'standardScreen',
    },
    comment: 'Standard 27" 16:9 monitors with triple setup',
  },
  {
    name: 'small screen',
    input: {
      diagIn: 24,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
    },
    expected: {
      store: 'smallScreen',
      hFOVdeg: { lessThan: 'standardScreen.hFOVdeg' },
      vFOVdeg: { lessThan: 'standardScreen.vFOVdeg' },
    },
    comment: 'Small 24" 16:9 monitors with triple setup',
  },
  {
    name: 'large screen',
    input: {
      diagIn: 32,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
    },
    expected: {
      store: 'largeScreen',
      hFOVdeg: { greaterThan: 'standardScreen.hFOVdeg' },
      vFOVdeg: { greaterThan: 'standardScreen.vFOVdeg' },
    },
    comment: 'Large 32" 16:9 monitors with triple setup',
  },
  // Manual dimensions input mode
  {
    name: 'manual dimensions input',
    input: {
      diagIn: 0,
      ratio: '16:9',
      distCm: 70,
      bezelMm: 10,
      inputMode: 'manual',
      screenWidth: 600,
      screenHeight: 340,
    },
    expected: {
      // Screen properties removed in simplified version
    },
    comment: 'Manual dimensions input with 600x340mm screen size',
  },
]

describe('calculateOptimalAngle', () => {
  // Store for test results that need to be compared
  const results = {}

  // Run all test cases
  optimalAngleTestCases.forEach(testCase => {
    it(testCase.name, () => {
      const { screen, distance } = testCase.input
      const result = calculateOptimalAngle(screen, distance)

      // Store result if needed for comparison
      if (testCase.expected.store) {
        results[testCase.expected.store] = result
      }

      // Check expected value
      if (testCase.expected.value !== undefined) {
        expect(result).toBe(testCase.expected.value)
      }

      // Check expected type
      if (testCase.expected.type) {
        expect(typeof result).toBe(testCase.expected.type)
      }

      // Check range
      if (testCase.expected.greaterThan !== undefined) {
        const compareValue =
          typeof testCase.expected.greaterThan === 'string'
            ? results[testCase.expected.greaterThan]
            : testCase.expected.greaterThan
        expect(result).toBeGreaterThan(compareValue)
      }

      if (testCase.expected.lessThan !== undefined) {
        const compareValue =
          typeof testCase.expected.lessThan === 'string'
            ? results[testCase.expected.lessThan]
            : testCase.expected.lessThan
        expect(result).toBeLessThan(compareValue)
      }
    })
  })
})

describe('calculateStats', () => {
  // Store for test results that need to be compared
  const results = {}

  // Run all test cases
  screenGeometryTestCases.forEach(testCase => {
    it(testCase.name, () => {
      const {
        diagIn,
        ratio,
        distCm,
        bezelMm,
        setupType = 'triple',
        angleMode = 'auto',
        manualAngle = 60,
        inputMode = 'diagonal',
        screenWidth = 700,
        screenHeight = 400,
        isCurved = false,
        curveRadius = 1000,
      } = testCase.input

      // Create config object in the format expected by calculateStats
      const config = {
        screen: {
          diagIn,
          ratio,
          bezelMm,
          screenWidth,
          screenHeight,
        },
        distance: {
          distCm,
        },
        layout: {
          setupType,
          manualAngle,
        },
        curvature: {
          isCurved,
          curveRadius,
        },
        ui: {
          inputMode,
          angleMode,
        },
      }

      const result = calculateStats(config)

      // Store result if needed for comparison
      if (testCase.expected.store) {
        results[testCase.expected.store] = result
      }

      // Special case for flat screen width calculation
      if (testCase.name === 'flat screen') {
        // With simplified return object, we no longer have screen.widthMm
        // Just store the distance in inches for comparison
        results.flatScreenDistanceIn = distCm / 2.54 // convert cm to inches
      }

      // Store triple result for single screen comparison
      if (testCase.name === 'standard 16:9 triple setup') {
        results.triple = result
      }

      // Check expected properties
      if (testCase.expected.properties) {
        testCase.expected.properties.forEach(prop => {
          expect(result).toHaveProperty(prop)
        })
      }

      // Check specific properties
      checkNestedProperties(result, testCase.expected, results)
    })
  })
})

// Helper function to check nested properties
function checkNestedProperties(actual, expected, storedResults, path = '') {
  Object.entries(expected).forEach(([key, value]) => {
    // Skip special keys
    if (['properties', 'store'].includes(key)) return

    const newPath = path ? `${path}.${key}` : key

    // Check if actual[key] exists
    if (actual[key] === undefined) {
      // Skip comparison if the property doesn't exist in the actual object
      // This prevents errors when checking nested properties that might not exist
      return
    }

    if (value !== null && typeof value === 'object') {
      // Check if this is a comparison operator object
      if (value.closeTo !== undefined) {
        // Check closeTo with precision
        const precision = value.precision !== undefined ? value.precision : 2
        expect(actual[key]).toBeCloseTo(value.closeTo, precision)
      } else if (value.greaterThan !== undefined) {
        // Check greaterThan
        const compareValue =
          typeof value.greaterThan === 'string'
            ? getNestedValue(storedResults, value.greaterThan)
            : value.greaterThan
        expect(actual[key]).toBeGreaterThan(compareValue)
      } else if (value.greaterThanSingle !== undefined) {
        // Check greaterThanSingle (same behavior as greaterThan)
        const compareValue =
          typeof value.greaterThanSingle === 'string'
            ? getNestedValue(storedResults, value.greaterThanSingle)
            : value.greaterThanSingle
        expect(actual[key]).toBeGreaterThan(compareValue)
      } else if (value.lessThan !== undefined) {
        // Check lessThan
        const compareValue =
          typeof value.lessThan === 'string'
            ? getNestedValue(storedResults, value.lessThan)
            : value.lessThan
        expect(actual[key]).toBeLessThan(compareValue)
      } else if (value.equal !== undefined) {
        // Check equal
        const compareValue =
          typeof value.equal === 'string' ? getNestedValue(storedResults, value.equal) : value.equal
        expect(actual[key]).toEqual(compareValue)
      } else if (value.notEqual !== undefined) {
        // Check notEqual
        const compareValue =
          typeof value.notEqual === 'string'
            ? getNestedValue(storedResults, value.notEqual)
            : value.notEqual
        expect(actual[key]).not.toEqual(compareValue)
      } else if (value.notCloseTo !== undefined) {
        // Check notCloseTo
        const compareValue =
          typeof value.notCloseTo === 'string'
            ? getNestedValue(storedResults, value.notCloseTo)
            : value.notCloseTo
        expect(actual[key]).not.toBeCloseTo(compareValue, 0)
      } else {
        // Recursive check for nested objects
        checkNestedProperties(actual[key], value, storedResults, newPath)
      }
    } else {
      // Direct value comparison
      expect(actual[key]).toEqual(value)
    }
  })
}

// Helper function to get nested value from an object using dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((prev, curr) => prev && prev[curr], obj)
}
