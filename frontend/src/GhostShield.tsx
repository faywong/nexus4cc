import { useState, useEffect } from 'react'

/**
 * Transparent fixed overlay that blocks all pointer/click events for `ms`
 * milliseconds after mount, then self-destructs.
 *
 * Purpose: mobile browsers fire "compatibility mouse events" (mousedown /
 * mouseup / click) ~0-300ms after touchend, at the same screen coordinates.
 * When a touch on element A opens overlay B, those ghost events land on B.
 * Placing <GhostShield /> inside B intercepts them at z-index 9999 before
 * they reach any interactive element.
 */
export default function GhostShield({ ms = 350 }: { ms?: number }) {
  const [active, setActive] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setActive(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  if (!active) return null
  return (
    <div
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
    />
  )
}
