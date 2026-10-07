import { useEffect, useRef } from 'react'
import { drawIcon } from '../game/renderer.js'

// Renders a unit or enemy sprite with the same drawing code the battlefield uses.
export default function SpriteIcon({ kind, type, size = 56, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawIcon(ctx, kind, type, size)
  }, [kind, type, size])
  return <canvas ref={ref} className={`sprite-icon ${className}`} style={{ width: size, height: size }} aria-hidden="true" />
}
