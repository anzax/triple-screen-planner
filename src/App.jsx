import React, { useEffect } from 'react'
import { useCalculationStore, initializeCalculationStore } from './store/calculationStore'
import { UIProvider } from './store/uiContext.jsx'
import SettingsPanel from './components/SettingsPanel'
import StatsDisplay from './components/StatsDisplay'
import ScreenVisualizer from './components/ScreenVisualizer'
import Footer from './components/Footer'

export default function App() {
  // Initialize calculation store on first render and clean up on unmount
  useEffect(() => {
    const unsubscribe = useCalculationStore.getState().setupSubscriptions()
    initializeCalculationStore()

    // Clean up subscription when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return (
    <UIProvider>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center h-10 mb-2">
          <a
            href="https://simrigbuild.com"
            className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            SimRigBuild.com
          </a>
          <span className="mx-2 text-gray-400">/</span>
          <h1 className="text-xl font-medium">Screen Planner</h1>
        </header>

        <SettingsPanel />

        <StatsDisplay />

        <ScreenVisualizer />

        <Footer />
      </div>
    </UIProvider>
  )
}
