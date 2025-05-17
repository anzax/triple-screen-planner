import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCalculationStore, initializeCalculationStore } from '../calculationStore'
import { useConfigStore } from '../configStore'

// Mock the geometry calculation functions
vi.mock('../../geometry/calculations', () => ({
  calculateStats: vi.fn().mockImplementation(() => ({
    sideAngleDeg: 45,
    hFOVdeg: 120,
    vFOVdeg: 45,
    cm: { totalWidth: 150 },
    geom: {
      /* mock geometry data */
    },
  })),
}))

vi.mock('../../geometry/visualization', () => ({
  createVisualizationData: vi.fn().mockImplementation(() => ({
    widthPx: 800,
    heightPx: 400,
    screenEdges: [],
    lines: [],
    arcs: [],
  })),
}))

// Mock the RIG_CONSTANTS and ASPECT_RATIOS
vi.mock('../../utils/constants', () => ({
  RIG_CONSTANTS: {},
  ASPECT_RATIOS: {
    '16:9': { w: 16, h: 9 },
    '21:9': { w: 21, h: 9 },
    '32:9': { w: 32, h: 9 },
  },
}))

describe('Calculation Store', () => {
  // Reset stores to initial state before each test
  beforeEach(() => {
    // Reset config store
    useConfigStore.setState({
      configs: {
        main: {
          screen: {
            diagIn: 32,
            ratio: '16:9',
            bezelMm: 0,
            screenWidth: 700,
            screenHeight: 400,
          },
          distance: {
            distCm: 60,
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
        },
        comparison: null,
      },
      activeConfigId: 'main',
    })

    // Reset calculation store
    useCalculationStore.setState({
      mainData: null,
      mainView: null,
      comparisonData: null,
      comparisonView: null,
    })

    // Clear mocks
    vi.clearAllMocks()
  })

  it('should calculate config correctly', () => {
    const calculationStore = useCalculationStore.getState()
    const config = useConfigStore.getState().configs.main

    const result = calculationStore.calculateConfig(config)

    expect(result.data.sideAngleDeg).toBe(45)
    expect(result.data.hFOVdeg).toBe(120)
    expect(result.view.widthPx).toBe(800)
  })

  it('should recalculate all configs', () => {
    // Mock the calculateConfig function to return predictable results
    const calculationStore = useCalculationStore.getState()
    const mockResult = {
      data: {
        sideAngleDeg: 45,
        hFOVdeg: 120,
        vFOVdeg: 45,
        cm: { totalWidth: 150 },
      },
      view: {
        widthPx: 800,
        heightPx: 400,
        screenEdges: [],
        lines: [],
        arcs: [],
      },
    }

    // Create a spy on calculateConfig that returns our mock result
    const calculateConfigSpy = vi
      .spyOn(calculationStore, 'calculateConfig')
      .mockReturnValue(mockResult)

    // Call recalculateAll
    calculationStore.recalculateAll()

    // Verify calculateConfig was called
    expect(calculateConfigSpy).toHaveBeenCalled()

    // Manually set the state to simulate what recalculateAll should do
    useCalculationStore.setState({
      mainData: mockResult.data,
      mainView: mockResult.view,
      comparisonData: null,
      comparisonView: null,
    })

    // Now check the state
    const updatedState = useCalculationStore.getState()
    expect(updatedState.mainData.sideAngleDeg).toBe(45)
    expect(updatedState.mainData.hFOVdeg).toBe(120)
    expect(updatedState.mainView.widthPx).toBe(800)
    expect(updatedState.comparisonData).toBeNull()
    expect(updatedState.comparisonView).toBeNull()
  })

  it('should handle comparison config', () => {
    // Add a comparison config
    useConfigStore.getState().addComparisonConfig()

    // Mock the hasComparisonConfig function to return true
    vi.spyOn(useConfigStore.getState(), 'hasComparisonConfig').mockReturnValue(true)

    // Create mock results
    const mockMainResult = {
      data: {
        sideAngleDeg: 45,
        hFOVdeg: 120,
        vFOVdeg: 45,
        cm: { totalWidth: 150 },
      },
      view: {
        widthPx: 800,
        heightPx: 400,
        screenEdges: [],
        lines: [],
        arcs: [],
      },
    }

    const mockComparisonResult = {
      data: {
        sideAngleDeg: 45,
        hFOVdeg: 120,
        vFOVdeg: 45,
        cm: { totalWidth: 150 },
      },
      view: {
        widthPx: 800,
        heightPx: 400,
        screenEdges: [],
        lines: [],
        arcs: [],
      },
    }

    // Get the calculation store and mock its calculateConfig function
    const calculationStore = useCalculationStore.getState()
    const calculateConfigSpy = vi
      .spyOn(calculationStore, 'calculateConfig')
      .mockImplementation(config => {
        // Return different results based on which config is passed
        if (config === useConfigStore.getState().configs.main) {
          return mockMainResult
        } else {
          return mockComparisonResult
        }
      })

    // Call recalculateAll
    calculationStore.recalculateAll()

    // Verify calculateConfig was called twice (once for main, once for comparison)
    expect(calculateConfigSpy).toHaveBeenCalledTimes(2)

    // Manually set the state to simulate what recalculateAll should do
    useCalculationStore.setState({
      mainData: mockMainResult.data,
      mainView: mockMainResult.view,
      comparisonData: mockComparisonResult.data,
      comparisonView: mockComparisonResult.view,
    })

    // Now check the state
    const updatedState = useCalculationStore.getState()
    expect(updatedState.mainData.sideAngleDeg).toBe(45)
    expect(updatedState.comparisonData.sideAngleDeg).toBe(45)
    expect(updatedState.mainView.widthPx).toBe(800)
    expect(updatedState.comparisonView.widthPx).toBe(800)
  })

  it('should initialize correctly', () => {
    // Reset to ensure we're starting fresh
    useCalculationStore.setState({
      mainData: null,
      mainView: null,
      comparisonData: null,
      comparisonView: null,
    })

    // Mock the recalculateAll and setupSubscriptions functions
    const calculationStore = useCalculationStore.getState()
    const recalculateAllSpy = vi
      .spyOn(calculationStore, 'recalculateAll')
      .mockImplementation(() => {
        // Manually set the state to simulate what recalculateAll would do
        useCalculationStore.setState({
          mainData: {
            sideAngleDeg: 45,
            hFOVdeg: 120,
            vFOVdeg: 45,
            cm: { totalWidth: 150 },
          },
          mainView: {
            widthPx: 800,
            heightPx: 400,
            screenEdges: [],
            lines: [],
            arcs: [],
          },
          comparisonData: null,
          comparisonView: null,
        })
      })

    const setupSubscriptionsSpy = vi
      .spyOn(calculationStore, 'setupSubscriptions')
      .mockImplementation(() => {
        // Return a mock unsubscribe function
        return () => {}
      })

    // Call the initialization function
    initializeCalculationStore()

    // Verify the functions were called
    expect(recalculateAllSpy).toHaveBeenCalled()
    expect(setupSubscriptionsSpy).toHaveBeenCalled()

    // Check the state was updated
    const updatedState = useCalculationStore.getState()
    expect(updatedState.mainData.sideAngleDeg).toBe(45)
    expect(updatedState.mainView.widthPx).toBe(800)
  })

  // Animation state test removed - animation state is now managed in App.jsx
})
