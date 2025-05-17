import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import RigAndHead from '../RigAndHead'
import { VisualizerContext } from '../../ScreenVisualizer'

// Mock the VisualizerContext
const mockViewport = {
  pixelsPerInch: 10,
  width: 800,
  height: 600,
  centerX: 400,
  centerY: 300,
}

describe('RigAndHead', () => {
  it('renders without crashing', () => {
    // Wrap the component with the mocked context
    const { container } = render(
      <VisualizerContext.Provider value={{ viewport: mockViewport }}>
        <svg>
          <RigAndHead />
        </svg>
      </VisualizerContext.Provider>
    )

    // Check that the component rendered something
    expect(container.querySelector('rect')).not.toBeNull()
    expect(container.querySelector('circle')).not.toBeNull()
  })
})
