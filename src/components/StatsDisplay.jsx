import React from 'react'
import { useConfigStore } from '../store/configStore'
import { useCalculationStore } from '../store/calculationStore'
import { useAnimation } from '../store/uiContext.jsx'

export default function StatsDisplay() {
  // Get animation state from context
  const { isAnimating } = useAnimation()
  // Get data directly from stores - using individual selectors to avoid infinite loop
  const activeConfigId = useConfigStore(state => state.activeConfigId)
  const setActiveConfigId = useConfigStore(state => state.setActiveConfigId)
  const addComparisonConfig = useConfigStore(state => state.addComparisonConfig)
  const removeComparisonConfig = useConfigStore(state => state.removeComparisonConfig)
  const hasComparison = useConfigStore(state => state.hasComparisonConfig())
  const configs = useConfigStore(state => state.configs)

  const { mainData, comparisonData } = useCalculationStore()

  // Get configs from the store
  const mainConfig = configs.main
  const comparisonConfig = configs.comparison

  // Check if we have a comparison configuration
  const hasComparisonConfig = hasComparison

  // Function to render the configuration card
  const renderConfigCard = (config, data, type = 'main') => {
    // For new comparison configs that don't have calculations yet, show informative data instead
    if (!data) {
      // Create info data based on the config itself, useful for the first render
      const infoData = {
        sideAngleDeg:
          config?.layout?.setupType === 'triple' ? config?.layout?.manualAngle || 60 : 0,
        hFOVdeg: 0,
        vFOVdeg: 0,
        cm: { totalWidth: 0 },
      }

      // Use the info data instead
      data = infoData
    }

    // Extract configuration details
    const { screen = {}, layout = {}, curvature = {}, distance = {}, ui = {} } = config
    const { inputMode = 'diagonal' } = ui

    const { diagIn = 0, ratio = '16:9', screenWidth = 0, screenHeight = 0 } = screen

    const { setupType = 'single' } = layout
    const { isCurved = false, curveRadius = 0 } = curvature
    const { distCm = 0 } = distance

    // Format screen size - conditional based on input mode
    const sizeDisplay =
      inputMode === 'diagonal' ? `${diagIn}″ ${ratio}` : `${screenWidth}×${screenHeight}mm`

    return (
      <div className="flex flex-col h-full">
        {/* Configuration Section */}
        <div className="text-center mb-2">
          <div
            className={`inline-block text-sm font-medium px-3 py-1 rounded-full mb-4 ${type === 'main' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}
          >
            {type === 'main' ? 'Main Setup' : 'Comparison'}
            {type === 'comparison' && (
              <button
                className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                onClick={e => {
                  e.stopPropagation() // Prevent triggering card click
                  removeComparisonConfig()
                }}
                aria-label="Remove comparison configuration"
              >
                ×
              </button>
            )}
          </div>

          <div className="text-xs flex justify-center items-center">
            <span>
              <span className="text-gray-600 text-sm">
                {setupType === 'triple' ? 'Triple' : 'Single'}
              </span>
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span>
              <span className="text-gray-600 text-sm">{sizeDisplay}</span>
            </span>
            <span className="mx-2 text-gray-300">|</span>

            <span>
              <span className="text-gray-600 text-sm">
                {isCurved ? `Curved (${curveRadius}R)` : 'Flat'}
              </span>
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span>
              <span className="text-gray-400">Distance:</span>{' '}
              <span className="text-gray-600 text-sm">{distCm}cm</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-2"></div>

        {/* Results Section */}
        <div className="text-center mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {/* H-FOV */}
            <div>
              <div className="text-lg font-semibold">{data.hFOVdeg.toFixed(1)}°</div>
              <div className="text-xs text-gray-500 ">H-FOV</div>
            </div>

            {/* V-FOV */}
            <div>
              <div className="text-lg font-semibold">{data.vFOVdeg.toFixed(1)}°</div>
              <div className="text-xs text-gray-500 ">V-FOV</div>
            </div>

            {/* Angle */}
            <div>
              <div className="text-lg font-semibold">{data.sideAngleDeg.toFixed(1)}°</div>
              <div className="text-xs text-gray-500 ">Side Angle</div>
            </div>

            {/* Width */}
            <div>
              <div className="text-lg font-semibold">{data.cm.totalWidth.toFixed(1)}cm</div>
              <div className="text-xs text-gray-500 ">Total Width</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Function to render the "Add Config" card
  const renderAddConfigCard = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-xl font-semibold text-blue-600 py-4">Add a Comparison</div>
      <div className="text-sm text-blue-500 mb-2 text-center">
        Compare with standard triple 32" flat setup
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Main Configuration Card */}
      <div
        className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 h-full
          ${
            activeConfigId === 'main'
              ? 'border-gray-600 shadow-md ' +
                (isAnimating && activeConfigId === 'main' ? 'animate-highlight' : '')
              : 'border-gray-200 hover:border-gray-600 transition-colors cursor-pointer'
          }`}
        onClick={() => hasComparisonConfig && setActiveConfigId('main')}
      >
        {renderConfigCard(mainConfig, mainData, 'main')}
      </div>

      {/* Comparison Configuration Card */}
      <div
        className={`rounded-lg shadow-sm border p-4 transition-all duration-300 h-full
          ${
            !hasComparisonConfig
              ? 'bg-white border-blue-200 hover:border-blue-500 transition-colors cursor-pointer'
              : 'bg-blue-50 ' +
                (activeConfigId === 'comparison'
                  ? 'border-blue-600 shadow-md ' +
                    (isAnimating && activeConfigId === 'comparison' ? 'animate-highlight' : '')
                  : 'border-gray-200 hover:border-blue-500 transition-colors cursor-pointer')
          }`}
        onClick={!hasComparisonConfig ? addComparisonConfig : () => setActiveConfigId('comparison')}
      >
        {hasComparisonConfig
          ? renderConfigCard(comparisonConfig, comparisonData, 'comparison')
          : renderAddConfigCard()}
      </div>
    </div>
  )
}
