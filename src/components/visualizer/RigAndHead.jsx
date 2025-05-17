import React, { useContext } from 'react'
import { VisualizerContext } from '../ScreenVisualizer'
import { RIG_CONSTANTS } from '../../geometry/constants'
import { cm2in } from '../../geometry/conversion'

export default function RigAndHead() {
  const { viewport } = useContext(VisualizerContext)
  const pixelsPerInch = viewport?.pixelsPerInch || 10
  const strokeWidth = 0.2 * pixelsPerInch // Convert inches to pixels

  // Define rig and head dimensions as constants inside the component
  // These were previously in utils/constants.js
  const RIG_DIMENSIONS = {
    // Convert from cm to inches since we're working with inches in the component
    WIDTH_IN: cm2in(RIG_CONSTANTS.RIG_W_CM), // 60cm → ~23.62in
    LENGTH_IN: cm2in(RIG_CONSTANTS.RIG_L_CM), // 150cm → ~59.06in
    HEAD_RADIUS_IN: 3,
  }

  // Convert dimensions from inches to pixels
  const rigWidth = RIG_DIMENSIONS.WIDTH_IN * pixelsPerInch
  const rigHeight = RIG_DIMENSIONS.LENGTH_IN * pixelsPerInch
  const headRadius = RIG_DIMENSIONS.HEAD_RADIUS_IN * pixelsPerInch

  // Calculate head position (offset from center)
  const headOffsetY = 0 // Keep head at center for now

  return (
    <>
      <rect
        x={-rigWidth / 2}
        y={-rigHeight * 0.93}
        width={rigWidth}
        height={rigHeight}
        fill="#6574A3FF"
        fillOpacity={0.1}
      />
      <circle
        cx={0}
        cy={headOffsetY}
        r={headRadius}
        fill="none"
        stroke="#888"
        strokeWidth={strokeWidth}
      />
    </>
  )
}
