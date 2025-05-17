import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import FOVLines from '../FOVLines'
import { VisualizerContext } from '../../ScreenVisualizer'

describe('FOVLines', () => {
  it('renders FOV lines when showFOV is true', () => {
    // Mock context with screenEdges
    const mockContext = {
      viewport: { pixelsPerInch: 10 },
      view: {
        screenEdges: [
          { x: 10, y: 10 },
          { x: -10, y: 10 },
          { x: 10, y: -10 },
          { x: -10, y: -10 },
        ],
      },
      showFOV: true,
    }

    const { container } = render(
      <svg>
        <VisualizerContext.Provider value={mockContext}>
          <FOVLines />
        </VisualizerContext.Provider>
      </svg>
    )

    // Should render 4 lines (one for each edge)
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(4)
  })

  it('does not render FOV lines when showFOV is false', () => {
    // Mock context with showFOV set to false
    const mockContext = {
      viewport: { pixelsPerInch: 10 },
      view: {
        screenEdges: [
          { x: 10, y: 10 },
          { x: -10, y: 10 },
        ],
      },
      showFOV: false,
    }

    const { container } = render(
      <svg>
        <VisualizerContext.Provider value={mockContext}>
          <FOVLines />
        </VisualizerContext.Provider>
      </svg>
    )

    // Should not render any lines
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(0)
  })

  it('renders comparison FOV lines with different color', () => {
    // Mock context with comparison view
    const mockContext = {
      viewport: { pixelsPerInch: 10 },
      comparisonView: {
        screenEdges: [
          { x: 10, y: 10 },
          { x: -10, y: 10 },
        ],
      },
      showFOV: true,
    }

    const { container } = render(
      <svg>
        <VisualizerContext.Provider value={mockContext}>
          <FOVLines isComparison={true} />
        </VisualizerContext.Provider>
      </svg>
    )

    // Should render 2 lines with the comparison color
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(2)
    expect(lines[0].getAttribute('stroke')).toBe('#1E40AF') // Comparison color
  })

  it('does not render when screenEdges is empty', () => {
    // Mock context with empty screenEdges
    const mockContext = {
      viewport: { pixelsPerInch: 10 },
      view: {
        screenEdges: [],
      },
      showFOV: true,
    }

    const { container } = render(
      <svg>
        <VisualizerContext.Provider value={mockContext}>
          <FOVLines />
        </VisualizerContext.Provider>
      </svg>
    )

    // Should not render any lines
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(0)
  })
})
