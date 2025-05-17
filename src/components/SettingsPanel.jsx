import React from 'react'
import NumberInputWithSlider from './ui/NumberInputWithSlider.jsx'
import NumberInput from './ui/NumberInput.jsx'
import MultiToggle from './ui/MultiToggle.jsx'
import { useConfigStore } from '../store/configStore'
import { calculateSideAngle } from '../geometry/calculations'
import { useAnimation } from '../store/uiContext.jsx'

export default function SettingsPanel() {
  // Get animation state from context
  const { isAnimating } = useAnimation()
  // Get data directly from the store
  const activeConfigId = useConfigStore(state => state.activeConfigId)

  // Get the active configuration directly
  const activeConfig = useConfigStore(state => {
    const configs = state.configs
    return configs[activeConfigId] || configs.main
  })

  // Destructure active configuration properties
  const { screen, distance, layout, curvature, ui = {} } = activeConfig
  const { diagIn, ratio, bezelMm, screenWidth, screenHeight } = screen
  const { distCm } = distance
  const { setupType, manualAngle } = layout
  const { isCurved, curveRadius } = curvature
  const { inputMode = 'diagonal', angleMode = 'auto' } = ui

  // Get config action functions
  const setInputMode = useConfigStore(state => state.setInputMode)
  const setAngleMode = useConfigStore(state => state.setAngleMode)
  const setDiagIn = useConfigStore(state => state.setDiagIn)
  const setRatio = useConfigStore(state => state.setRatio)
  const setDistCm = useConfigStore(state => state.setDistCm)
  const setBezelMm = useConfigStore(state => state.setBezelMm)
  const setSetupType = useConfigStore(state => state.setSetupType)
  const setManualAngle = useConfigStore(state => state.setManualAngle)
  const setScreenWidth = useConfigStore(state => state.setScreenWidth)
  const setScreenHeight = useConfigStore(state => state.setScreenHeight)
  const setIsCurved = useConfigStore(state => state.setIsCurved)
  const setCurveRadius = useConfigStore(state => state.setCurveRadius)

  // Calculate the angle using the utility function
  const calculatedAngle = calculateSideAngle(
    { ...screen, curvature: { isCurved, curveRadius }, inputMode },
    distance
  )

  // Determine styling based on active config
  const borderColor = activeConfigId === 'comparison' ? 'border-blue-600' : 'border-gray-600'
  const bgColorClass = activeConfigId === 'comparison' ? 'bg-blue-100' : 'bg-white'

  return (
    <div
      className={`${bgColorClass} rounded-lg shadow-sm border ${borderColor} p-4 transition-all duration-300 ${isAnimating ? 'animate-highlight' : ''}`}
    >
      {/* Three-column layout container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Screen Size with toggle and relevant controls */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Screen Size</h3>

          {/* Input Method Toggle */}
          <div className="mb-3">
            <MultiToggle
              value={inputMode}
              onChange={setInputMode}
              options={[
                { value: 'diagonal', label: 'Diagonal' },
                { value: 'manual', label: 'Width\u00A0\u00D7\u00A0Height' },
              ]}
            />
          </div>

          {/* Screen Dimensions - Conditional based on input mode */}
          {inputMode === 'diagonal' ? (
            <div className="space-y-3">
              {/* Screen Size */}
              <NumberInputWithSlider
                label="Diagonal, in"
                min={17}
                max={77}
                value={diagIn}
                onChange={setDiagIn}
              />

              {/* Aspect Ratio */}
              <MultiToggle
                label="Aspect Ratio"
                value={ratio}
                onChange={setRatio}
                options={[
                  { value: '16:9', label: '16:9' },
                  { value: '21:9', label: '21:9' },
                  { value: '32:9', label: '32:9' },
                ]}
              />

              {/* Bezel Thickness */}
              <NumberInputWithSlider
                label="Bezel width, mm"
                min={0}
                max={50}
                value={bezelMm}
                onChange={setBezelMm}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2 text-xs text-blue-700">
                Measure total screen dimensions
              </div>

              {/* Width and Height in a single row */}
              <div className="flex space-x-2">
                <NumberInput
                  label="Width, mm"
                  value={screenWidth}
                  onChange={setScreenWidth}
                  className="flex-1"
                />
                <NumberInput
                  label="Height, mm"
                  value={screenHeight}
                  onChange={setScreenHeight}
                  className="flex-1"
                />
              </div>

              {/* Bezel thickness */}
              <NumberInputWithSlider
                label="Bezel width, mm"
                min={0}
                max={50}
                value={bezelMm}
                onChange={setBezelMm}
              />
            </div>
          )}
        </div>

        {/* Column 2: Triple/Single setup and angle controls */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Screen Layout</h3>

          {/* Setup Type */}
          <div className="mb-3">
            <MultiToggle
              value={setupType}
              onChange={setSetupType}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'triple', label: 'Triple' },
              ]}
            />
          </div>

          {/* Monitor Angle - only for triple */}
          {setupType === 'triple' ? (
            <div className="space-y-3">
              <div className="mb-1">
                <MultiToggle
                  label="Side Screen Angle"
                  value={angleMode}
                  onChange={setAngleMode}
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: 'manual', label: 'Manual' },
                  ]}
                />
              </div>

              {angleMode === 'auto' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg py-1.5 px-2">
                  <div className="text-xs text-green-700">
                    Recommended: <span className="font-medium">{calculatedAngle.toFixed(1)}°</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg py-1.5 px-2 mb-1.5">
                    <div className="text-xs text-yellow-700">
                      Recommended:{' '}
                      <span className="font-medium">{calculatedAngle.toFixed(1)}°</span>
                    </div>
                  </div>
                  <NumberInputWithSlider
                    label="Angle, degrees"
                    min={30}
                    max={90}
                    value={manualAngle}
                    onChange={setManualAngle}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg py-3 px-3 text-xs text-blue-700 h-24 flex items-center justify-center">
              <p className="text-center">
                Single screen setup selected.
                <br />
                No angle adjustments needed.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Screen distance and future curved options */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Viewing Distance</h3>

          {/* Eye Distance */}
          <div className="mb-3">
            <NumberInputWithSlider
              label="Eye Distance, cm"
              min={40}
              max={150}
              value={distCm}
              onChange={setDistCm}
            />
          </div>

          {/* Curved Screen Options */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Screen Curvature</h3>

            {/* Flat/Curved Toggle */}
            <div className="mb-3">
              <MultiToggle
                value={isCurved ? 'curved' : 'flat'}
                onChange={value => setIsCurved(value === 'curved')}
                options={[
                  { value: 'flat', label: 'Flat' },
                  { value: 'curved', label: 'Curved' },
                ]}
              />
            </div>

            {/* Curve Radius - only shown when curved is selected */}
            {isCurved && (
              <NumberInputWithSlider
                label="Curve Radius, mm (eg. 1800R)"
                min={800}
                max={2300}
                step={100}
                value={curveRadius}
                onChange={setCurveRadius}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
