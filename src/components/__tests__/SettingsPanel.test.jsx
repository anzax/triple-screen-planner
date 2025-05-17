import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPanel from '../SettingsPanel'
import { setLegacyTestState, getLegacyTestState } from '../../store/testAdapter'
import { useConfigStore } from '../../store/configStore'

// Mock the useAnimation hook
vi.mock('../../store/uiContext.jsx', () => ({
  useAnimation: () => ({ isAnimating: false }),
}))

// Mock the NumberInputWithSlider component to simplify testing
vi.mock('../NumberInputWithSlider', () => ({
  default: ({ label, value, onChange }) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`slider-${label}`}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  ),
}))

describe('SettingsPanel', () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    setLegacyTestState({
      diagIn: 32,
      ratio: '16:9',
      distCm: 60,
      bezelMm: 0,
      inputMode: 'diagonal',
      setupType: 'triple',
      angleMode: 'auto',
      manualAngle: 60,
      screenWidth: 700,
      screenHeight: 400,
      isCurved: false,
      curveRadius: 1000,
    })
  })

  it('should render with values from the store', () => {
    render(<SettingsPanel />)

    // Check that the aspect ratio select has the correct value
    const ratioSelect = screen.getByText('16:9')
    expect(ratioSelect).toBeInTheDocument()

    // Check that the setup type buttons show the correct selection
    const tripleButton = screen.getByText('Triple')
    expect(tripleButton).toHaveClass('bg-white')

    // Check that the input mode buttons show the correct selection
    const diagonalButton = screen.getByText('Diagonal')
    expect(diagonalButton).toHaveClass('bg-white')
  })

  it('should update store when input mode is changed', () => {
    render(<SettingsPanel />)

    // Get initial state
    const configStore = useConfigStore.getState()
    const initialMode = configStore.configs.main.ui.inputMode
    expect(initialMode).toBe('diagonal')

    // Click to change to manual mode
    // Use a more reliable way to find the button
    const buttons = screen.getAllByRole('button')
    const manualButton = buttons.find(button => button.textContent.includes('Width'))
    fireEvent.click(manualButton)

    // Check that store was updated
    expect(useConfigStore.getState().configs.main.ui.inputMode).toBe('manual')
  })

  it('should update store when setup type is changed', () => {
    render(<SettingsPanel />)

    // Initially in triple mode
    expect(getLegacyTestState().setupType).toBe('triple')

    // Click to change to single mode
    fireEvent.click(screen.getByText('Single'))

    // Check that store was updated
    expect(getLegacyTestState().setupType).toBe('single')
  })

  it('should toggle curved screen options correctly', () => {
    render(<SettingsPanel />)

    // Initially flat (not curved)
    expect(getLegacyTestState().isCurved).toBe(false)

    // Click to change to curved
    fireEvent.click(screen.getByText('Curved'))

    // Check that store was updated
    expect(getLegacyTestState().isCurved).toBe(true)
  })
})
