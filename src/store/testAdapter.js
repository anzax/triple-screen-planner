// testAdapter.js - FOR TESTS ONLY
// Removed settingsStore import as it's no longer needed
import { useConfigStore } from './configStore'

/**
 * TEST ONLY: Set legacy flat state format for tests
 * This keeps tests working without changing main code
 */
export function setLegacyTestState(flatState) {
  // Only update the configStore - settingsStore is deprecated
  const configState = {
    screen: {
      diagIn: flatState.diagIn ?? 32,
      ratio: flatState.ratio ?? '16:9',
      bezelMm: flatState.bezelMm ?? 0,
      screenWidth: flatState.screenWidth ?? 700,
      screenHeight: flatState.screenHeight ?? 400,
    },
    distance: {
      distCm: flatState.distCm ?? 60,
    },
    layout: {
      setupType: flatState.setupType ?? 'triple',
      manualAngle: flatState.manualAngle ?? 60,
    },
    curvature: {
      isCurved: flatState.isCurved ?? false,
      curveRadius: flatState.curveRadius ?? 1000,
    },
    ui: {
      inputMode: flatState.inputMode ?? 'diagonal',
      angleMode: flatState.angleMode ?? 'auto',
    },
    version: '1.1', // Updated to match the new store version
  }

  useConfigStore.setState({
    configs: {
      main: configState,
      comparison: null,
    },
    activeConfigId: 'main',
    version: '1.1', // Updated to match the new store version
  })
}

/**
 * TEST ONLY: Get legacy flat state format for assertions
 */
export function getLegacyTestState() {
  // Get state from configStore only
  const configState = useConfigStore.getState()

  // Return the state from the configStore for tests
  const mainConfig = configState.configs.main
  const { screen, distance, layout, curvature } = mainConfig
  return {
    diagIn: screen.diagIn,
    ratio: screen.ratio,
    bezelMm: screen.bezelMm,
    screenWidth: screen.screenWidth,
    screenHeight: screen.screenHeight,
    distCm: distance.distCm,
    setupType: layout.setupType,
    manualAngle: layout.manualAngle,
    isCurved: curvature.isCurved,
    curveRadius: curvature.curveRadius,
    inputMode: mainConfig.ui?.inputMode || 'diagonal',
    angleMode: mainConfig.ui?.angleMode || 'auto',
  }
}
