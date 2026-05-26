"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: number
  tx: string
  ty: string
  delay: number
  size: number
  color: string
}

interface OpeningSequenceProps {
  onComplete: () => void
}

export default function OpeningSequence({ onComplete }: OpeningSequenceProps) {
  const [phase, setPhase] = useState<"locks" | "tremble" | "open" | "particles" | "fade">("locks")
  const [locksGone, setLocksGone] = useState([false, false, false])
  const [particles, setParticles] = useState<Particle[]>([])
  const calledRef = useRef(false)

  useEffect(() => {
    const particleColors = ["#c8a96e", "#e8c890", "#a07840", "#f0d8a0", "#ffffff"]

    // Phase 1: Locks fall one by one
    const t1 = setTimeout(() => setLocksGone([true, false, false]), 200)
    const t2 = setTimeout(() => setLocksGone([true, true, false]), 600)
    const t3 = setTimeout(() => setLocksGone([true, true, true]), 1000)

    // Phase 2: Tremble
    const t4 = setTimeout(() => setPhase("tremble"), 1400)

    // Phase 3: Open
    const t5 = setTimeout(() => setPhase("open"), 2000)

    // Phase 4: Particles burst
    const t6 = setTimeout(() => {
      setPhase("particles")
      const ps: Particle[] = Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2
        const dist = 80 + Math.random() * 120
        return {
          id: i,
          tx: `${Math.cos(angle) * dist}px`,
          ty: `${Math.sin(angle) * dist - 40}px`,
          delay: Math.random() * 0.3,
          size: Math.random() * 5 + 2,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        }
      })
      setParticles(ps)
    }, 2600)

    // Phase 5: Fade to white → navigate
    const t7 = setTimeout(() => setPhase("fade"), 3400)
    const t8 = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true
        onComplete()
      }
    }, 4400)

    return () => [t1, t2, t3, t4, t5, t6, t7, t8].forEach(clearTimeout)
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 50, background: "var(--bg)" }}
    >
      {/* Fade overlay */}
      <AnimatePresence>
        {phase === "fade" && (
          <motion.div
            className="absolute inset-0"
            style={{ background: "#fff", zIndex: 60 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div
        className="font-cinzel text-center mb-16"
        style={{ color: "var(--gold)", fontSize: "12px", letterSpacing: "6px", opacity: 0.7 }}
        animate={{ opacity: phase === "fade" ? 0 : 0.7 }}
        transition={{ duration: 0.5 }}
      >
        天月
      </motion.div>

      {/* Box representation */}
      <div className="relative flex flex-col items-center">
        {/* Falling locks */}
        <div className="flex gap-8 mb-4" style={{ height: "48px" }}>
          {[0, 1, 2].map((i) => (
            <AnimatePresence key={i}>
              {!locksGone[i] && (
                <motion.div
                  exit={{ y: 60, rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeIn" }}
                  style={{
                    width: "20px",
                    height: "28px",
                    border: "1.5px solid var(--gold)",
                    borderRadius: "3px",
                    background: "rgba(200,169,110,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      border: "1px solid var(--gold-dark)",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Box SVG — simplified for opening animation */}
        <motion.div
          style={{
            position: "relative",
            width: "200px",
            height: "160px",
          }}
          animate={
            phase === "tremble"
              ? { x: [-4, 4, -3, 3, -2, 2, 0] }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          {/* Lid */}
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50px",
              background: "linear-gradient(to bottom, #201a12, #120e08)",
              border: "1.5px solid #a07840",
              borderRadius: "3px",
              transformOrigin: "top center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            animate={
              phase === "open" || phase === "particles" || phase === "fade"
                ? { rotateX: -110 }
                : { rotateX: 0 }
            }
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          >
            <span
              className="font-cinzel"
              style={{ color: "var(--gold)", fontSize: "18px", letterSpacing: "4px", opacity: 0.8 }}
            >
              天月
            </span>
          </motion.div>

          {/* Body */}
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, #1a1510, #0a0806)",
              border: "1.5px solid #a07840",
              borderTop: "none",
              borderRadius: "0 0 3px 3px",
            }}
          />

          {/* Golden light from interior */}
          <AnimatePresence>
            {(phase === "open" || phase === "particles") && (
              <motion.div
                style={{
                  position: "absolute",
                  top: "50px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "6px",
                  background: "linear-gradient(to bottom, #fff8e0, rgba(200,169,110,0))",
                  borderRadius: "3px",
                  transformOrigin: "bottom center",
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 120, opacity: [0, 1, 0.8, 0] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Ambient glow */}
          <AnimatePresence>
            {(phase === "open" || phase === "particles") && (
              <motion.div
                style={{
                  position: "absolute",
                  inset: "-20px",
                  background: "radial-gradient(ellipse at 50% 30%, rgba(200,169,110,0.3), transparent 70%)",
                  pointerEvents: "none",
                  borderRadius: "50%",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Particle burst */}
        <AnimatePresence>
          {phase === "particles" &&
            particles.map((p) => (
              <motion.div
                key={p.id}
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "50%",
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: "50%",
                  background: p.color,
                  pointerEvents: "none",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: p.tx,
                  y: p.ty,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: p.delay,
                  ease: "easeOut",
                }}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <motion.p
        className="font-cormorant mt-12"
        style={{ color: "var(--muted)", fontSize: "14px", fontStyle: "italic" }}
        animate={{ opacity: phase === "fade" ? 0 : 0.7 }}
      >
        {phase === "locks"
          ? "Les cadenas tombent…"
          : phase === "tremble"
          ? "La boîte s'éveille…"
          : phase === "open"
          ? "Le couvercle s'ouvre…"
          : phase === "particles"
          ? "天月 vous attend."
          : ""}
      </motion.p>
    </div>
  )
}
