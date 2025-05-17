import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore, defaultConfigState } from '../configStore'

describe('Config Store', () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    // Store reference not used, just resetting state
    // const store = useConfigStore.getState()
    useConfigStore.setState({
      configs: {
        main: { ...defaultConfigState },
        comparison: null,
      },
      activeConfigId: 'main',
      version: '1.1', // Updated to match the new store version
    })
  })

  it('should initialize with correct default values', () => {
    const state = useConfigStore.getState()

    // Test initial structure
    expect(state.configs.main).toEqual(defaultConfigState)
    expect(state.configs.comparison).toBeNull()
    expect(state.activeConfigId).toBe('main')
    expect(state.version).toBe('1.1') // Updated to match the new store version

    // Test initial active config
    expect(state.getActiveConfig()).toEqual(defaultConfigState)
    expect(state.hasComparisonConfig()).toBe(false)
  })

  it('should add a comparison configuration', () => {
    const { addComparisonConfig } = useConfigStore.getState()

    // Update main config first to verify fixed comparison
    useConfigStore.getState().setDiagIn(27)
    useConfigStore.getState().setRatio('21:9')
    useConfigStore.getState().setIsCurved(true)

    // Add comparison config
    addComparisonConfig()

    const state = useConfigStore.getState()

    // Test comparison config was added
    expect(state.configs.comparison).not.toBeNull()
    expect(state.activeConfigId).toBe('comparison')
    expect(state.hasComparisonConfig()).toBe(true)

    // Verify comparison is a standard triple 32" setup
    const main = state.configs.main
    const comparison = state.configs.comparison

    // Properties should match the standard setup (not match main)
    expect(comparison.screen.diagIn).toBe(32) // Always 32
    expect(comparison.screen.ratio).toBe('16:9') // Always 16:9
    expect(comparison.curvature.isCurved).toBe(false) // Always flat
    expect(comparison.layout.setupType).toBe('triple') // Always triple
    expect(comparison.distance.distCm).toBe(60) // Always 60cm

    // Main config should be unchanged
    expect(main.screen.diagIn).toBe(27)
    expect(main.screen.ratio).toBe('21:9')
    expect(main.curvature.isCurved).toBe(true)
  })

  it('should remove a comparison configuration', () => {
    const { addComparisonConfig, removeComparisonConfig } = useConfigStore.getState()

    // Add and then remove comparison config
    addComparisonConfig()
    removeComparisonConfig()

    const state = useConfigStore.getState()

    // Test comparison config was removed
    expect(state.configs.comparison).toBeNull()
    expect(state.activeConfigId).toBe('main')
    expect(state.hasComparisonConfig()).toBe(false)
  })

  it('should switch active configuration', () => {
    const { addComparisonConfig, setActiveConfigId } = useConfigStore.getState()

    // Add comparison config
    addComparisonConfig()

    // Switch back to main
    setActiveConfigId('main')

    const state = useConfigStore.getState()

    // Test active config changed
    expect(state.activeConfigId).toBe('main')
    expect(state.getActiveConfig()).toEqual(state.configs.main)

    // Switch back to comparison
    setActiveConfigId('comparison')
    expect(useConfigStore.getState().activeConfigId).toBe('comparison')
  })

  it('should update active configuration properties', () => {
    const { setDiagIn, setRatio, setDistCm, setIsCurved } = useConfigStore.getState()

    // Update main config properties
    setDiagIn(27)
    setRatio('21:9')
    setDistCm(80)
    setIsCurved(true)

    const mainConfig = useConfigStore.getState().configs.main

    // Verify updates
    expect(mainConfig.screen.diagIn).toBe(27)
    expect(mainConfig.screen.ratio).toBe('21:9')
    expect(mainConfig.distance.distCm).toBe(80)
    expect(mainConfig.curvature.isCurved).toBe(true)

    // Add comparison and update it
    useConfigStore.getState().addComparisonConfig()
    setDiagIn(35)
    setRatio('32:9')

    const comparisonConfig = useConfigStore.getState().configs.comparison

    // Verify only comparison was updated
    expect(comparisonConfig.screen.diagIn).toBe(35)
    expect(comparisonConfig.screen.ratio).toBe('32:9')
    expect(mainConfig.screen.diagIn).toBe(27)
    expect(mainConfig.screen.ratio).toBe('21:9')
  })
})
