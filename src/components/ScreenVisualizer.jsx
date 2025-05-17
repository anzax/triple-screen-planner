import React, { useState, createContext } from 'react'
import RigAndHead from './visualizer/RigAndHead'
import Screens from './visualizer/Screens'
import FOVLines from './visualizer/FOVLines'
import ReferenceGrid from './visualizer/ReferenceGrid'
import { calculateViewportConfig } from '../utils/viewportManager'
import { useCalculationStore } from '../store/calculationStore'
import { useConfigStore } from '../store/configStore'

// Create a context to share data with all child components
export const VisualizerContext = createContext({})

export default function ScreenVisualizer() {
  // Get view data directly from the calculation store
  const { mainView, comparisonView } = useCalculationStore()
  const hasComparisonConfig = useConfigStore(state => state.hasComparisonConfig())

  // Create a safe default view for initial rendering or error cases
  const defaultView = {
    widthPx: 800,
    heightPx: 400,
    screenEdges: [],
    lines: [],
    arcs: [],
    totalWidth: 800,
  }

  // Safely use the view or fallback to defaults
  const safeView = mainView || defaultView
  const safeComparisonView = hasComparisonConfig ? comparisonView : null
  const [debug, setDebug] = useState(false)
  const [showFOV, setShowFOV] = useState(true)

  // Calculate viewport configuration
  const viewport = calculateViewportConfig(safeView, safeComparisonView)

  return (
    <VisualizerContext.Provider
      value={{
        viewport,
        view: safeView,
        comparisonView: safeComparisonView,
        debug,
        showFOV,
      }}
    >
      <div
        className="bg-white rounded p-2 overflow-auto flex flex-col justify-center"
        style={{
          height: '50vh',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Create main coordinate system - using translation only, no scaling */}
          <g transform={`translate(${viewport.centerX},${viewport.centerY})`}>
            {/* Base layer - grid or reference lines if needed */}
            <ReferenceGrid />

            {/* Main setup */}
            <g className="main-setup">
              <RigAndHead />
              <FOVLines />
              <Screens />
            </g>

            {/* Comparison setup */}
            {safeComparisonView && (
              <g className="comparison-setup" style={{ opacity: 1.0 }}>
                <FOVLines isComparison={true} />
                <Screens isComparison={true} />
              </g>
            )}
          </g>
        </svg>

        {/* Controls */}
        <div className="flex justify-center gap-2 mt-2">
          {!import.meta.env.PROD && (
            <button
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded debug-toggle"
              style={{ width: '120px' }}
              onClick={() => setDebug(!debug)}
            >
              {debug ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          )}
          <button
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded fov-toggle"
            style={{ width: '120px' }}
            onClick={() => setShowFOV(!showFOV)}
          >
            {showFOV ? 'Hide FOV Lines' : 'Show FOV Lines'}
          </button>
        </div>
      </div>
    </VisualizerContext.Provider>
  )
}
