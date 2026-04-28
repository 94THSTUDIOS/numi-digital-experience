"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

function Bubble({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.6, 0.2, 0.6],
        scale: [1, 1.3, 1],
        x: x + Math.random() * 80 - 40,
        y: y + Math.random() * 80 - 40,
      }}
      transition={{
        duration: 8 + Math.random() * 12,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}

function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([])

  useEffect(() => {
    // Curated Numi palette for bubbles: Pink, Orange, Green, Cream
    const colors = [
      "rgba(246, 99, 111, 0.15)", // Pink
      "rgba(239, 90, 0, 0.15)",   // Orange
      "rgba(63, 111, 41, 0.15)",   // Green
      "rgba(253, 240, 232, 0.3)",  // Cream
    ]

    const newBubbles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 2000, // Large range for wide screens
      y: Math.random() * 2000,
      size: Math.random() * 40 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full opacity-60">
        <title>Floating Bubbles</title>
        {bubbles.map((bubble) => (
          <Bubble key={bubble.id} {...bubble} />
        ))}
      </svg>
    </div>
  )
}

export function FloatingBubblesBackground({
  children,
  className = "",
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-[#FDF0E8] ${className}`}>
      <div className="absolute inset-0 z-0">
        <FloatingBubbles />
      </div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}

