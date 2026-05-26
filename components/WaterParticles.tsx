"use client"

import { useEffect, useState } from "react"

interface Drop {
  id: number
  left: string
  width: string
  height: string
  delay: string
  duration: string
  opacity: string
}

export default function WaterParticles() {
  const [drops, setDrops] = useState<Drop[]>([])

  useEffect(() => {
    const generated: Drop[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 1.5 + 0.5}px`,
      height: `${Math.random() * 12 + 6}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 5 + 5}s`,
      opacity: `${Math.random() * 0.3 + 0.1}`,
    }))
    setDrops(generated)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {drops.map((d) => (
        <span
          key={d.id}
          className="water-drop absolute"
          style={{
            left: d.left,
            top: `-${parseInt(d.height) + 10}px`,
            width: d.width,
            height: d.height,
            opacity: d.opacity,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* Bottom mist */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "220px",
          background: "linear-gradient(to top, rgba(5,7,9,0.85), transparent)",
          animation: "mistFlow 6s ease-in-out infinite",
        }}
      />
    </div>
  )
}
