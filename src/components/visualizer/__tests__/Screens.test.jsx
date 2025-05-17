import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Screens from '../Screens'
import { VisualizerContext } from '../../ScreenVisualizer'

// Mock the child components to simplify testing
vi.mock('../FlatScreens', () => ({
  default: ({ lines, color }) => (
    <div data-testid="flat-screens" data-lines={JSON.stringify(lines)} data-color={color} />
  ),
}))

vi.mock('../CurvedScreensD3', () => ({
  default: ({ arcs, color, debug }) => (
    <div
      data-testid="curved-screens"
      data-arcs={JSON.stringify(arcs)}
      data-color={color}
      data-debug={debug.toString()}
    />
  ),
}))

vi.mock('../DebugHelpers', () => ({
  default: ({ isComparison }) => (
    <div data-testid="debug-helpers" data-comparison={isComparison.toString()} />
  ),
}))

describe('Screens', () => {
  it('renders flat screens when no arcs are present', () => {
    // Mock view with lines but no arcs
    const mockView = {
      lines: [{ x1: 0, y1: 0, x2: 100, y2: 100 }],
      arcs: [],
    }

    const { getByTestId, queryByTestId } = render(
      <VisualizerContext.Provider value={{ view: mockView, debug: false }}>
        <Screens />
      </VisualizerContext.Provider>
    )

    // Should render FlatScreens but not CurvedScreensD3
    expect(getByTestId('flat-screens')).toBeInTheDocument()
    expect(queryByTestId('curved-screens')).toBeNull()
  })

  it('renders curved screens when arcs are present', () => {
    // Mock view with arcs
    const mockView = {
      lines: [{ x1: 0, y1: 0, x2: 100, y2: 100 }],
      arcs: [{ path: 'M0,0 Q50,50 100,0' }],
    }

    const { getByTestId, queryByTestId } = render(
      <VisualizerContext.Provider value={{ view: mockView, debug: false }}>
        <Screens />
      </VisualizerContext.Provider>
    )

    // Should render CurvedScreensD3 but not FlatScreens
    expect(getByTestId('curved-screens')).toBeInTheDocument()
    expect(queryByTestId('flat-screens')).toBeNull()
  })

  it('renders debug helpers when debug is true', () => {
    const mockView = {
      lines: [{ x1: 0, y1: 0, x2: 100, y2: 100 }],
      arcs: [],
    }

    const { getByTestId } = render(
      <VisualizerContext.Provider value={{ view: mockView, debug: true }}>
        <Screens />
      </VisualizerContext.Provider>
    )

    // Should render DebugHelpers
    expect(getByTestId('debug-helpers')).toBeInTheDocument()
  })

  it('renders comparison view when isComparison is true', () => {
    const mockComparisonView = {
      lines: [{ x1: 0, y1: 0, x2: 100, y2: 100 }],
      arcs: [],
    }

    const { getByTestId } = render(
      <VisualizerContext.Provider value={{ comparisonView: mockComparisonView, debug: false }}>
        <Screens isComparison={true} />
      </VisualizerContext.Provider>
    )

    // Should render FlatScreens with the comparison color
    const flatScreens = getByTestId('flat-screens')
    expect(flatScreens).toBeInTheDocument()
    expect(flatScreens.dataset.color).toBe('#1E40AF') // Comparison color
  })
})
