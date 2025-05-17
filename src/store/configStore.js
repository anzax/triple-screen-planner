import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

// Current store version - increment when breaking changes occur
const STORE_VERSION = '1.1'

// Default domain state structure - keeping this directly in configStore for simplicity
export const defaultConfigState = {
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
  version: STORE_VERSION,
}

// Default configs state with main configuration
const defaultConfigsState = {
  configs: {
    main: { ...defaultConfigState },
    comparison: null,
  },
  activeConfigId: 'main',
  version: STORE_VERSION,
}

/**
 * Store for managing multiple screen configurations
 */
export const useConfigStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Configs state
        ...defaultConfigsState,

        // Getters
        getActiveConfig: () => {
          const { configs, activeConfigId } = get()
          return configs[activeConfigId] || configs.main
        },

        hasComparisonConfig: () => {
          const { configs } = get()
          return configs.comparison !== null
        },

        // Actions
        setActiveConfigId: configId => {
          const { configs } = get()
          if (configs[configId]) {
            set({ activeConfigId: configId })
          }
        },

        addComparisonConfig: () => {
          try {
            // Always use a standard triple 32" flat setup for comparison
            const standardConfig = { ...defaultConfigState }

            // Get current configurations
            const { configs } = get()

            set({
              configs: { ...configs, comparison: standardConfig },
              activeConfigId: 'comparison',
            })
          } catch (error) {
            console.error('Error adding comparison:', error)
          }
        },

        removeComparisonConfig: () => {
          try {
            set(state => {
              // Ensure we're returning a clean state with comparison set to null
              // This helps zustand-persist properly update localStorage
              return {
                ...state,
                configs: { ...state.configs, comparison: null },
                activeConfigId: 'main',
              }
            })
          } catch (error) {
            console.error('Error removing comparison:', error)
          }
        },

        // Group setters for active config
        setScreen: updates => {
          const { configs, activeConfigId } = get()
          set({
            configs: {
              ...configs,
              [activeConfigId]: {
                ...configs[activeConfigId],
                screen: {
                  ...configs[activeConfigId].screen,
                  ...updates,
                },
              },
            },
          })
        },

        setDistance: updates => {
          const { configs, activeConfigId } = get()
          set({
            configs: {
              ...configs,
              [activeConfigId]: {
                ...configs[activeConfigId],
                distance: {
                  ...configs[activeConfigId].distance,
                  ...updates,
                },
              },
            },
          })
        },

        setLayout: updates => {
          const { configs, activeConfigId } = get()
          set({
            configs: {
              ...configs,
              [activeConfigId]: {
                ...configs[activeConfigId],
                layout: {
                  ...configs[activeConfigId].layout,
                  ...updates,
                },
              },
            },
          })
        },

        setCurvature: updates => {
          const { configs, activeConfigId } = get()
          set({
            configs: {
              ...configs,
              [activeConfigId]: {
                ...configs[activeConfigId],
                curvature: {
                  ...configs[activeConfigId].curvature,
                  ...updates,
                },
              },
            },
          })
        },

        setUI: updates => {
          const { configs, activeConfigId } = get()
          set({
            configs: {
              ...configs,
              [activeConfigId]: {
                ...configs[activeConfigId],
                ui: {
                  ...configs[activeConfigId].ui,
                  ...updates,
                },
              },
            },
          })
        },

        // Individual property setters for backward compatibility
        // These will be deprecated in favor of group setters
        setScreenProperty: (property, value) => {
          const updates = { [property]: value }
          get().setScreen(updates)
        },

        setDistanceProperty: (property, value) => {
          const updates = { [property]: value }
          get().setDistance(updates)
        },

        setLayoutProperty: (property, value) => {
          const updates = { [property]: value }
          get().setLayout(updates)
        },

        setCurvatureProperty: (property, value) => {
          const updates = { [property]: value }
          get().setCurvature(updates)
        },

        setUIProperty: (property, value) => {
          const updates = { [property]: value }
          get().setUI(updates)
        },

        // Specific setter functions for common properties
        // These are kept for backward compatibility
        setDiagIn: value => get().setScreen({ diagIn: value }),
        setRatio: value => get().setScreen({ ratio: value }),
        setBezelMm: value => get().setScreen({ bezelMm: value }),
        setScreenWidth: value => get().setScreen({ screenWidth: value }),
        setScreenHeight: value => get().setScreen({ screenHeight: value }),
        setDistCm: value => get().setDistance({ distCm: value }),
        setSetupType: value => get().setLayout({ setupType: value }),
        setManualAngle: value => get().setLayout({ manualAngle: value }),
        setIsCurved: value => get().setCurvature({ isCurved: value }),
        setCurveRadius: value => get().setCurvature({ curveRadius: value }),
        setInputMode: value => get().setUI({ inputMode: value }),
        setAngleMode: value => get().setUI({ angleMode: value }),
      }),
      {
        name: 'simrig-screen-configs',
        onRehydrateStorage: () => {
          // Just use defaults if there's any issue with stored state
          return defaultConfigsState
        },
      }
    )
  )
)
