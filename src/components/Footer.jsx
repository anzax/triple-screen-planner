import React from 'react'

export default function Footer() {
  return (
    <>
      <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 space-y-2">
        <p>
          Configure your exact setup parameters to calculate optimal triple-screen positioning. The
          planner determines angles for equidistant viewing across all screens, maximizing immersion
          while maintaining proper perspective.
        </p>
        <p>
          <strong>Side Screen Angle</strong> provides the physical mounting angle for your side
          monitors.
          <strong> Horizontal FOV</strong> and <strong>Vertical FOV</strong> values can be used for
          in-game camera settings, critical for proper depth perception and spatial awareness.
        </p>
        <p>
          <strong>Total Width</strong> shows the straight-line distance between outer edges of your
          side screens. Remember to allow extra space for monitor depth, arms and stand placement.
          The visualization represents a standard sim rig (60×150cm) with head position ~10cm from
          rear edge.
        </p>
        <p>
          <strong>Note:</strong> All calculations are mathematical estimates and may require
          fine-tuning based on your specific hardware, mounting solutions, and personal preference.
        </p>
      </div>

      <div className="text-center text-sm text-gray-500 pt-4">
        <a
          href="https://github.com/anzax/simrig-screen-planner"
          className="underline hover:text-blue-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
        . Found a bug or have feedback?{' '}
        <a
          href="https://github.com/anzax/simrig-screen-planner/issues"
          className="underline hover:text-blue-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open an issue
        </a>
        .
        <p className="mt-2 mb-2   text-gray-600 font-semibold">
          🏁 Crafted by a fellow sim racer for{' '}
          <a
            href="https://www.reddit.com/r/simracing/"
            className="underline decoration-solid hover:text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            r/simracing
          </a>{' '}
          community 🔥
        </p>
      </div>
    </>
  )
}
