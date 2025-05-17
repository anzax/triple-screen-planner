import { describe, it, expect, beforeEach } from 'vitest'
// Removed settingsStore import as it's no longer needed
import { useConfigStore } from '../configStore'
import { setLegacyTestState, getLegacyTestState } from '../testAdapter'

describe('Config Store Legacy API', () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    setLegacyTestState({
      diagIn: 32,
      ratio: '16:9',
      distCm: 60,
      bezelMm: 0,
      inputMode: 'diagonal',
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      screenWidth: 700,
      screenHeight: 400,
      isCurved: false,
      curveRadius: 1000,
    })
  })

  it('should initialize with correct default values', () => {
    const state = getLegacyTestState()

    // Test basic inputs
    expect(state.diagIn).toBe(32)
    expect(state.ratio).toBe('16:9')
    expect(state.distCm).toBe(60)
    expect(state.bezelMm).toBe(0)

    // Test enhanced inputs
    expect(state.inputMode).toBe('diagonal')
    expect(state.setupType).toBe('triple')
    expect(state.angleMode).toBe('auto')

    // Test curved screen options
    expect(state.isCurved).toBe(false)
  })

  it('should update state when actions are called', () => {
    // Get configStore directly from the module
    const { setDiagIn, setRatio, setSetupType, setIsCurved } = useConfigStore.getState()

    // Test updating diagonal size through configStore instead
    setDiagIn(27)
    expect(getLegacyTestState().diagIn).toBe(27)

    // Test updating aspect ratio
    setRatio('21:9')
    expect(getLegacyTestState().ratio).toBe('21:9')

    // Test updating setup type
    setSetupType('single')
    expect(getLegacyTestState().setupType).toBe('single')

    // Test toggling curved screen
    setIsCurved(true)
    expect(getLegacyTestState().isCurved).toBe(true)
  })

  it('should handle related state changes correctly', () => {
    // Set UI state directly in the configStore
    useConfigStore.setState(state => ({
      ...state,
      configs: {
        ...state.configs,
        main: {
          ...state.configs.main,
          ui: {
            ...state.configs.main.ui,
            inputMode: 'manual',
            angleMode: 'manual',
          },
        },
      },
    }))

    // Verify it was updated
    const configState = useConfigStore.getState()
    expect(configState.configs.main.ui.inputMode).toBe('manual')
    expect(configState.configs.main.ui.angleMode).toBe('manual')
  })

  it('should update multiple properties with group setters', () => {
    // Get group setters from the store
    const { setScreen, setLayout, setUI } = useConfigStore.getState()

    // Test updating multiple screen properties at once
    setScreen({
      diagIn: 27,
      ratio: '21:9',
      bezelMm: 10,
    })

    // Verify screen properties were updated
    const state = getLegacyTestState()
    expect(state.diagIn).toBe(27)
    expect(state.ratio).toBe('21:9')
    expect(state.bezelMm).toBe(10)

    // Test updating layout properties
    setLayout({
      setupType: 'single',
      manualAngle: 45,
    })

    // Verify layout properties were updated
    const updatedState = getLegacyTestState()
    expect(updatedState.setupType).toBe('single')
    expect(updatedState.manualAngle).toBe(45)

    // Test updating UI properties
    setUI({
      inputMode: 'manual',
      angleMode: 'manual',
    })

    // Verify UI properties were updated
    const configState = useConfigStore.getState()
    expect(configState.configs.main.ui.inputMode).toBe('manual')
    expect(configState.configs.main.ui.angleMode).toBe('manual')
  })
})
