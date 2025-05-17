import React, { createContext, useContext, useState, useEffect } from 'react'
import { useConfigStore } from './configStore'
import { UI_CONSTANTS } from '../utils/constants'

// Create context for UI state
const UIContext = createContext()

// Provider component for UI state
export function UIProvider({ children }) {
  // UI state for animation
  const [isAnimating, setIsAnimating] = useState(false)

  // Get minimal state needed for animation
  const activeConfigId = useConfigStore(state => state.activeConfigId)
  const hasComparisonConfig = useConfigStore(state => state.hasComparisonConfig())

  // Handle animation when active config changes
  useEffect(() => {
    if (hasComparisonConfig) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), UI_CONSTANTS.ANIMATION_DURATION_MS)
      return () => clearTimeout(timer)
    }
  }, [activeConfigId, hasComparisonConfig])

  // Value to be provided by the context
  const value = {
    isAnimating,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// Custom hook to use the UI context
export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}

// Custom hook specifically for animation logic
export function useAnimation() {
  return useUI()
}
