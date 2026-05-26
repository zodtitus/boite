"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import WaterParticles from "@/components/WaterParticles"
import Box from "@/components/Box"
import Mechanism1 from "@/components/Mechanism1"
import Mechanism2 from "@/components/Mechanism2"
import Mechanism3 from "@/components/Mechanism3"
import OpeningSequence from "@/components/OpeningSequence"

export default function Home() {
  const router = useRouter()
  const [solved, setSolved] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [isOpening, setIsOpening] = useState(false)
  const [showOpening, setShowOpening] = useState(false)

  function solve(idx: number) {
    setSolved((prev) => {
      const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
      next[idx] = true
      if (next.every(Boolean)) {
        setTimeout(() => {
          setIsOpening(true)
          setTimeout(() => setShowOpening(true), 700)
        }, 400)
      }
      return next
    })
  }

  const handleOpeningComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tengetsu-unlocked", "1")
    }
    router.push("/carnet")
  }, [router])

  const allSolved = solved.every(Boolean)

  return (
    <>
      <AnimatePresence>
        {showOpening && (
          <OpeningSequence onComplete={handleOpeningComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showOpening && (
          <motion.div
            className="relative min-h-screen flex flex-col items-center"
            style={{ background: "var(--bg)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WaterParticles />

            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                pointerEvents: "none",
                zIndex: 0,
                opacity: 0.4,
              }}
            />

            <div
              className="relative flex flex-col items-center w-full"
              style={{ zIndex: 1, paddingBottom: "60px" }}
            >
              {/* Header */}
              <header className="text-center pt-12 pb-6 px-6">
                <div
                  className="font-cinzel mb-3"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "7px",
                    color: "var(--gold-dark)",
                    textTransform: "uppercase",
                  }}
                >
                  Clan Hōzuki · Kiri no Kuni
                </div>
                <h1
                  className="font-cinzel"
                  style={{
                    fontSize: "clamp(28px, 5vw, 42px)",
                    color: "var(--gold)",
                    letterSpacing: "4px",
                    marginBottom: "8px",
                    textShadow: "0 0 40px rgba(200,169,110,0.25)",
                  }}
                >
                  天月
                </h1>
                <p
                  className="font-cormorant"
                  style={{
                    fontStyle: "italic",
                    color: "var(--muted)",
                    fontSize: "16px",
                  }}
                >
                  Prouve que tu en es digne
                </p>
                <div
                  style={{
                    width: "100px",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, var(--gold-dark), transparent)",
                    margin: "18px auto 0",
                  }}
                />
              </header>

              {/* Central box */}
              <div className="my-8">
                <Box solved={solved} isOpening={isOpening} isOpen={allSolved && isOpening} />
              </div>

              {/* Status message */}
              <div
                className="font-cormorant text-center mb-8 px-4"
                style={{
                  color: allSolved ? "var(--gold)" : "var(--muted)",
                  fontSize: "14px",
                  fontStyle: "italic",
                  minHeight: "20px",
                  transition: "color 0.6s",
                }}
              >
                {allSolved
                  ? "La boîte s'éveille…"
                  : solved[0] && solved[1]
                  ? "Deux mécanismes résolus. Continuez."
                  : solved[0]
                  ? "Premier mécanisme résolu. Continuez."
                  : "Trois mécanismes verrouillent la boîte."}
              </div>

              {/* Mechanisms — vertical scroll, one per card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "32px",
                  width: "100%",
                  maxWidth: "520px",
                  padding: "0 20px",
                }}
              >
                {/* Mechanism 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "36px 24px",
                    border: `1px solid ${solved[0] ? "rgba(200,169,110,0.4)" : "rgba(255,255,255,0.07)"}`,
                    background: solved[0] ? "rgba(200,169,110,0.03)" : "rgba(15,18,24,0.6)",
                    transition: "border-color 0.5s, background 0.5s",
                  }}
                >
                  <Mechanism1 onSolved={() => solve(0)} disabled={false} />
                </motion.div>

                {/* Mechanism 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: solved[0] ? 1 : 0.35, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "36px 24px",
                    border: `1px solid ${solved[1] ? "rgba(200,169,110,0.4)" : solved[0] ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)"}`,
                    background: solved[1] ? "rgba(200,169,110,0.03)" : "rgba(15,18,24,0.6)",
                    transition: "border-color 0.5s, background 0.5s, opacity 0.4s",
                    pointerEvents: solved[0] ? "auto" : "none",
                    position: "relative",
                  }}
                >
                  {!solved[0] && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(5,7,9,0.55)", zIndex: 2,
                    }}>
                      <span className="font-cinzel" style={{ color: "var(--muted)", fontSize: "9px", letterSpacing: "3px" }}>
                        VERROUILLÉ
                      </span>
                    </div>
                  )}
                  <Mechanism2 onSolved={() => solve(1)} disabled={!solved[0]} />
                </motion.div>

                {/* Mechanism 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: solved[1] ? 1 : 0.35, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "36px 24px",
                    border: `1px solid ${solved[2] ? "rgba(200,169,110,0.4)" : solved[1] ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)"}`,
                    background: solved[2] ? "rgba(200,169,110,0.03)" : "rgba(15,18,24,0.6)",
                    transition: "border-color 0.5s, background 0.5s, opacity 0.4s",
                    pointerEvents: solved[1] ? "auto" : "none",
                    position: "relative",
                  }}
                >
                  {!solved[1] && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(5,7,9,0.55)", zIndex: 2,
                    }}>
                      <span className="font-cinzel" style={{ color: "var(--muted)", fontSize: "9px", letterSpacing: "3px" }}>
                        VERROUILLÉ
                      </span>
                    </div>
                  )}
                  <Mechanism3 onSolved={() => solve(2)} disabled={!solved[1]} />
                </motion.div>
              </div>

              {/* Footer */}
              <footer className="mt-16 text-center px-4">
                <p
                  className="font-cormorant"
                  style={{
                    color: "var(--muted)",
                    fontSize: "12px",
                    fontStyle: "italic",
                    opacity: 0.5,
                  }}
                >
                  Tengetsu Hōzuki · 天月 · Héritier
                </p>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
