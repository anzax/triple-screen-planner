import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfigStore, defaultConfigState } from '../configStore'
import { useCalculationStore } from '../calculationStore'

// Mock the calculation store
vi.mock('../calculationStore', () => ({
  useCalculationStore: {
    getState: vi.fn().mockReturnValue({
      calculateConfig: vi.fn().mockReturnValue({
        data: {
          sideAngleDeg: 45,
          hFOVdeg: 120,
          vFOVdeg: 45,
          cm: { totalWidth: 150 },
        },
        view: {
          /* mock view data */
        },
      }),
    }),
  },
}))

describe('Config Store Integration', () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    // Not using this store reference directly
    // const configStore = useConfigStore.getState()
    useConfigStore.setState({
      configs: {
        main: { ...defaultConfigState },
        comparison: null,
      },
      activeConfigId: 'main',
      version: '1.0',
    })

    // UI settings are now in the configStore.configs.main.ui

    // Clear mocks
    vi.clearAllMocks()
  })

  it('should integrate with calculationStore for main config', () => {
    // Get the main config
    const mainConfig = useConfigStore.getState().configs.main

    // Get the calculation store and its calculateConfig function
    const calculationStore = useCalculationStore.getState()
    const { calculateConfig } = calculationStore

    // Calculate using main config
    const { data } = calculateConfig(mainConfig)

    // Verify calculation was called correctly
    expect(calculateConfig).toHaveBeenCalledWith(mainConfig)

    // Verify we got the expected results
    expect(data.sideAngleDeg).toBe(45)
    expect(data.hFOVdeg).toBe(120)
  })

  it('should support multiple configurations for comparison', () => {
    // Add a comparison config
    useConfigStore.getState().addComparisonConfig()

    // Get both configs
    const { configs, activeConfigId } = useConfigStore.getState()

    // Verify we have both configs and comparison is active
    expect(configs.main).toBeDefined()
    expect(configs.comparison).toBeDefined()
    expect(activeConfigId).toBe('comparison')

    // Modify the comparison config FIRST
    useConfigStore.getState().setDiagIn(40)
    useConfigStore.getState().setIsCurved(true)

    // Reset the mock to ensure we capture only the calls after our changes
    vi.clearAllMocks()

    // Calculate using comparison config - AFTER modifying it
    const comparisonConfig = useConfigStore.getState().configs.comparison // Get fresh config

    // Get the calculation store and its calculateConfig function
    const calculationStore = useCalculationStore.getState()
    const { calculateConfig } = calculationStore

    // Calculate using comparison config
    calculateConfig(comparisonConfig)

    // Verify calculation was called with the updated comparison config
    expect(calculateConfig).toHaveBeenCalledWith(comparisonConfig)

    // Verify the specific updated properties
    expect(comparisonConfig.screen.diagIn).toBe(40) // diagIn (updated)
    expect(comparisonConfig.curvature.isCurved).toBe(true) // isCurved (updated)

    // Switch back to main config
    useConfigStore.getState().setActiveConfigId('main')
    expect(useConfigStore.getState().activeConfigId).toBe('main')

    // Make changes to main config while comparison exists
    useConfigStore.getState().setDistCm(80)

    // Verify only main was updated
    expect(useConfigStore.getState().configs.main.distance.distCm).toBe(80)
    expect(useConfigStore.getState().configs.comparison.distance.distCm).not.toBe(80)

    // Remove comparison config
    useConfigStore.getState().removeComparisonConfig()
    expect(useConfigStore.getState().configs.comparison).toBeNull()
    expect(useConfigStore.getState().activeConfigId).toBe('main')
  })
})
