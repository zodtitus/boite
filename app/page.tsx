"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { MusicContext, type MusicCtx } from "@/lib/MusicContext"
import WaterParticles from "@/components/WaterParticles"
import Box from "@/components/Box"
import Mechanism1 from "@/components/Mechanism1"
import Mechanism2 from "@/components/Mechanism2"
import Mechanism3 from "@/components/Mechanism3"
import OpeningSequence from "@/components/OpeningSequence"

// ── Padlock SVG ───────────────────────────────────────────────────────────────
function PadlockSVG({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width="30" height="38" viewBox="0 0 30 38" fill="none" aria-hidden>
      {/* Shackle */}
      <path
        d={open
          ? "M7 18 V11 Q7 3 15 3 Q23 3 23 11 V11"
          : "M7 18 V11 Q7 3 15 3 Q23 3 23 11 V18"}
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: "all 0.5s ease" }}
      />
      {/* Body */}
      <rect x="3" y="16" width="24" height="19" rx="3.5"
        fill={open ? "rgba(200,169,110,0.10)" : "rgba(10,14,22,0.85)"}
        stroke={color} strokeWidth="1.5"
        style={{ transition: "all 0.5s ease" }}
      />
      {/* Keyhole circle */}
      <circle cx="15" cy="25.5" r="3.5"
        fill={open ? color : "rgba(200,169,110,0.18)"}
        style={{ transition: "all 0.5s ease" }}
      />
      {/* Keyhole stem */}
      {!open && (
        <rect x="13.5" y="27.5" width="3" height="4.5" rx="1.2"
          fill="rgba(200,169,110,0.18)"
          style={{ transition: "all 0.5s ease" }}
        />
      )}
    </svg>
  )
}

// ── Lock card ─────────────────────────────────────────────────────────────────
interface LockCardProps {
  index: 0 | 1 | 2
  label: string
  sub: string
  desc: string
  solved: boolean
  onClick: () => void
}

function LockCard({ index, label, sub, desc, solved, onClick }: LockCardProps) {
  const numerals = ["Ⅰ", "Ⅱ", "Ⅲ"] as const
  const color = solved ? "var(--gold)" : "rgba(200,169,110,0.35)"
  const border = solved
    ? "rgba(200,169,110,0.45)"
    : "rgba(200,169,110,0.10)"

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, borderColor: "rgba(200,169,110,0.35)" }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "10px",
        padding: "22px 18px 18px",
        border: `1px solid ${border}`,
        borderRadius: "6px",
        background: solved
          ? "rgba(200,169,110,0.04)"
          : "rgba(10,14,22,0.60)",
        cursor: "pointer",
        outline: "none",
        backdropFilter: "blur(4px)",
        minWidth: "130px",
        transition: "border-color 0.4s, background 0.4s",
        boxShadow: solved
          ? "0 0 28px rgba(200,169,110,0.12)"
          : "none",
      }}
    >
      <PadlockSVG open={solved} color={color} />

      <span style={{
        fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
        fontSize: "11px", letterSpacing: "3px",
        color: solved ? "rgba(200,169,110,0.55)" : "rgba(200,169,110,0.20)",
        transition: "color 0.4s",
      }}>
        {numerals[index]}
      </span>

      <span style={{
        fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
        fontSize: "8.5px", letterSpacing: "1.5px",
        color: solved ? "var(--gold)" : "rgba(200,169,110,0.55)",
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: 1.5,
        transition: "color 0.4s",
      }}>
        {label}
      </span>

      <span style={{
        fontFamily: "serif",
        fontSize: "18px",
        color: solved ? "var(--gold)" : "rgba(200,169,110,0.30)",
        textShadow: solved ? "0 0 10px rgba(200,169,110,0.5)" : "none",
        transition: "all 0.4s",
      }}>
        {sub}
      </span>

      <span style={{
        fontFamily: "var(--font-cormorant-var), Georgia, serif",
        fontStyle: "italic",
        fontSize: "11px",
        color: "var(--muted)",
        textAlign: "center",
        opacity: 0.65,
        lineHeight: 1.4,
      }}>
        {desc}
      </span>
    </motion.button>
  )
}

// ── Full-screen enigma panel ──────────────────────────────────────────────────
const ENIGMA_LABELS = [
  "La Patience du Sang",
  "L'Illusion des Abysses",
  "Les Cinq Points",
] as const

interface EnigmaPanelProps {
  index: 0 | 1 | 2
  solved: boolean
  onSolved: () => void
  onClose: () => void
}

function EnigmaPanel({ index, solved, onSolved, onClose }: EnigmaPanelProps) {
  const MechComp = index === 0 ? Mechanism1 : index === 1 ? Mechanism2 : Mechanism3

  return (
    <motion.div
      key={`enigma-${index}`}
      style={{
        position: "fixed", inset: 0,
        zIndex: 80,
        background: "var(--bg)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Noise texture */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.35,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }} />

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        background: "rgba(5,7,9,0.90)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(200,169,110,0.08)",
      }}>
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(200,169,110,0.55)",
            fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
            fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase",
            padding: "6px 10px",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(200,169,110,0.55)")}
        >
          <span style={{ fontSize: "13px" }}>←</span>
          Retour
        </button>

        <span style={{
          fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
          fontSize: "9px", letterSpacing: "3px",
          color: solved ? "var(--gold)" : "rgba(200,169,110,0.40)",
          textTransform: "uppercase",
          transition: "color 0.5s",
        }}>
          {ENIGMA_LABELS[index]}
          {solved && " · ✓"}
        </span>

        {/* Invisible spacer for centering */}
        <div style={{ width: "80px" }} />
      </div>

      {/* Mechanism content */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px 60px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", width: "100%",
          maxWidth: index === 1 ? "500px" : "440px",
        }}>
          <MechComp onSolved={onSolved} disabled={false} />
        </div>
      </div>
    </motion.div>
  )
}

// ── Atmospheric intro (before coffre) ────────────────────────────────────────
const INTRO_WORDS = "Trois sceaux protègent ce que je ne pouvais confier qu'à toi.".split(" ")

function AtmosphericIntro({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)

  // Reveal one word every 160ms
  useEffect(() => {
    if (count >= INTRO_WORDS.length) return
    const id = setTimeout(() => setCount(c => c + 1), 160)
    return () => clearTimeout(id)
  }, [count])

  // Accept any click or keypress after 1.2 s (prevents accidental skip)
  useEffect(() => {
    let cleanup: (() => void) | undefined
    const arm = setTimeout(() => {
      const handle = () => onComplete()
      window.addEventListener("pointerdown", handle)
      window.addEventListener("keydown", handle)
      cleanup = () => {
        window.removeEventListener("pointerdown", handle)
        window.removeEventListener("keydown", handle)
      }
    }, 1200)
    return () => { clearTimeout(arm); cleanup?.() }
  }, [onComplete])

  return (
    <motion.div
      key="intro"
      style={{
        position: "fixed", inset: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4 }}
    >
      <WaterParticles />

      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.35,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }} />

      <p
        className="font-cormorant"
        style={{
          position: "relative", zIndex: 1,
          fontSize: "clamp(18px, 3vw, 26px)", fontStyle: "italic",
          color: "var(--muted)", lineHeight: 1.9,
          textAlign: "center", padding: "0 48px", maxWidth: "620px",
        }}
      >
        {INTRO_WORDS.map((word, i) => (
          <span key={i} style={{
            display: "inline-block", marginRight: "0.28em",
            opacity: i < count ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}>
            {word}
          </span>
        ))}
      </p>
    </motion.div>
  )
}

// ── Jagetsu message (between opening and carnet) ──────────────────────────────
const JAGETSU_WORDS =
  "Ce carnet est ma mémoire, et désormais la tienne. Prends-en soin. — Jagetsu Hōzuki"
    .split(" ")

function JagetsuMessage({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const done = count >= JAGETSU_WORDS.length

  // Reveal one word every 280ms
  useEffect(() => {
    if (done) return
    const id = setTimeout(() => setCount(c => c + 1), 280)
    return () => clearTimeout(id)
  }, [count, done])

  // Auto-advance 2.5 s after last word
  useEffect(() => {
    if (!done) return
    const id = setTimeout(() => onComplete(), 2500)
    return () => clearTimeout(id)
  }, [done, onComplete])

  return (
    <motion.div
      key="jagetsu"
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#000",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.6 }}
    >
      <p
        className="font-cormorant"
        style={{
          fontSize: "clamp(16px, 2.5vw, 21px)", fontStyle: "italic",
          color: "rgba(200,169,110,0.82)", lineHeight: 2.1,
          textAlign: "center", padding: "0 52px", maxWidth: "560px",
        }}
      >
        {JAGETSU_WORDS.map((word, i) => (
          <span key={i} style={{
            display: "inline-block", marginRight: "0.28em",
            opacity: i < count ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}>
            {word}
          </span>
        ))}
      </p>
    </motion.div>
  )
}

// ── Mute button ───────────────────────────────────────────────────────────────
function MuteButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={muted ? "Activer le son" : "Couper le son"}
      style={{
        position: "fixed", top: "14px", right: "16px", zIndex: 300,
        width: "34px", height: "34px", borderRadius: "50%",
        background: "rgba(10,14,22,0.80)",
        border: "1px solid rgba(200,169,110,0.20)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", outline: "none",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.55)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.20)")}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {/* Speaker body */}
        <path d="M2 5.5 H5 L9 2 V14 L5 10.5 H2 Z"
          fill="rgba(200,169,110,0.70)" />
        {muted ? (
          /* Muted: cross lines */
          <>
            <line x1="11" y1="5" x2="15" y2="11" stroke="rgba(200,169,110,0.70)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="15" y1="5" x2="11" y2="11" stroke="rgba(200,169,110,0.70)" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          /* Unmuted: two sound arcs */
          <>
            <path d="M11 5.5 Q13 8 11 10.5" stroke="rgba(200,169,110,0.70)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M12.5 3.5 Q15.5 8 12.5 12.5" stroke="rgba(200,169,110,0.45)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </>
        )}
      </svg>
    </button>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────
const LOCK_DATA: { label: string; sub: string; desc: string }[] = [
  {
    label: "La Patience du Sang",
    sub: "同調",
    desc: "Synchronise les courants ancestraux",
  },
  {
    label: "L'Illusion des Abysses",
    sub: "幻惑",
    desc: "Distingue le vrai du faux",
  },
  {
    label: "Les Cinq Points",
    sub: "五点",
    desc: "Active la séquence secrète",
  },
]

export default function Home() {
  const router = useRouter()

  const [solved, setSolved]             = useState<[boolean, boolean, boolean]>([false, false, false])
  const [activeEnigma, setActiveEnigma] = useState<0 | 1 | 2 | null>(null)
  const [isOpening, setIsOpening]       = useState(false)
  const [showOpening, setShowOpening]   = useState(false)
  const [muted, setMuted]               = useState(false)
  const [introSeen, setIntroSeen]       = useState(false)
  const [showJagetsu, setShowJagetsu]   = useState(false)

  // Audio refs
  const audioRef       = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef    = useRef<AudioContext | null>(null)
  const analyserRef    = useRef<AnalyserNode | null>(null)
  const bassDataRef    = useRef<Uint8Array | null>(null)
  const srcConnected   = useRef(false)

  // ── Bass pulse ────────────────────────────────────────────────────────────
  const getBassPulse = useCallback((): number => {
    const analyser = analyserRef.current
    if (!analyser) return 0
    if (!bassDataRef.current || bassDataRef.current.length !== analyser.frequencyBinCount) {
      bassDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
    }
    analyser.getByteFrequencyData(bassDataRef.current as Uint8Array<ArrayBuffer>)
    const d = bassDataRef.current
    // Bins 0–3 ≈ 0–340 Hz (bass range with 256-point FFT at 44.1 kHz)
    return ((d[0] ?? 0) + (d[1] ?? 0) + (d[2] ?? 0) + (d[3] ?? 0)) / 4 / 255
  }, [])

  const musicCtx: MusicCtx = { getBassPulse }

  // ── Music setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio("/puzzle-music.mp3")
    audio.loop   = true
    audio.volume = 0.45
    audioRef.current = audio

    const ac      = new AudioContext()
    audioCtxRef.current = ac

    const analyser    = ac.createAnalyser()
    analyser.fftSize  = 256
    analyserRef.current = analyser

    function connectGraph() {
      if (srcConnected.current) return
      srcConnected.current = true
      ac.resume().catch(() => {})
      const src = ac.createMediaElementSource(audio)
      src.connect(analyser)
      analyser.connect(ac.destination)
    }

    // Attempt autoplay → connect graph on success
    audio.play()
      .then(() => { connectGraph() })
      .catch(() => {
        // Browser blocked autoplay — connect on first gesture
        const onGesture = () => {
          connectGraph()
          audio.play().catch(() => {})
          window.removeEventListener("pointerdown", onGesture)
          window.removeEventListener("keydown", onGesture)
        }
        window.addEventListener("pointerdown", onGesture)
        window.addEventListener("keydown", onGesture)
      })

    return () => {
      audio.pause()
      audio.src = ""
      ac.close().catch(() => {})
    }
  }, [])

  // ── Solve handler ────────────────────────────────────────────────────────
  const solve = useCallback((idx: 0 | 1 | 2) => {
    setSolved(prev => {
      const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
      next[idx] = true

      if (next.every(Boolean)) {
        setTimeout(() => {
          // Fade music
          const audio = audioRef.current
          if (audio) {
            const fade = setInterval(() => {
              if (audio.volume > 0.03) {
                audio.volume = Math.max(0, audio.volume - 0.03)
              } else {
                audio.pause()
                clearInterval(fade)
              }
            }, 60)
          }
          setIsOpening(true)
          setTimeout(() => setShowOpening(true), 700)
        }, 500)
      }

      return next
    })
    // Close the enigma panel briefly after solve, then let opening take over
    setTimeout(() => setActiveEnigma(null), 1400)
  }, [])

  const handleOpeningComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tengetsu-unlocked", "1")
    }
    setShowJagetsu(true)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }, [])

  const allSolved = solved.every(Boolean)

  // Phase drives the entire view stack
  const phase = showJagetsu ? "jagetsu"
    : showOpening ? "opening"
    : !introSeen ? "intro"
    : "coffre"

  return (
    <MusicContext.Provider value={musicCtx}>
      <>
        <MuteButton muted={muted} onToggle={toggleMute} />

        <AnimatePresence mode="wait">

          {/* ── 1. Atmospheric intro ── */}
          {phase === "intro" && (
            <AtmosphericIntro key="intro" onComplete={() => setIntroSeen(true)} />
          )}

          {/* ── 2. Opening animation ── */}
          {phase === "opening" && (
            <motion.div key="opening" style={{ position: "fixed", inset: 0, zIndex: 100 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <OpeningSequence onComplete={handleOpeningComplete} />
            </motion.div>
          )}

          {/* ── 3. Jagetsu phrase ── */}
          {phase === "jagetsu" && (
            <JagetsuMessage key="jagetsu" onComplete={() => router.push("/carnet")} />
          )}

          {/* ── 4. Coffre puzzle ── */}
          {phase === "coffre" && (
            <motion.div
              key="coffre"
              style={{
                position: "relative", minHeight: "100svh",
                display: "flex", flexDirection: "column", alignItems: "center",
                background: "var(--bg)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <WaterParticles />

              {/* Noise grain */}
              <div aria-hidden style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.38,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              }} />

              <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "60px" }}>

                {/* ── Header ── */}
                <header style={{ textAlign: "center", padding: "48px 24px 20px" }}>
                  <p className="font-cinzel" style={{
                    fontSize: "9px", letterSpacing: "7px",
                    color: "var(--gold-dark)", textTransform: "uppercase", marginBottom: "12px",
                  }}>
                    Clan Hōzuki · Kiri no Kuni
                  </p>
                  <h1 className="font-cinzel" style={{
                    fontSize: "clamp(32px, 6vw, 48px)",
                    color: "var(--gold)", letterSpacing: "4px", marginBottom: "6px",
                    textShadow: "0 0 50px rgba(200,169,110,0.28)",
                  }}>
                    天月
                  </h1>
                  <div style={{
                    width: "80px", height: "1px",
                    background: "linear-gradient(90deg, transparent, var(--gold-dark), transparent)",
                    margin: "16px auto",
                  }} />
                </header>

                {/* ── Coffre ── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: "10px" }}
                >
                  <Box solved={solved} isOpening={isOpening} isOpen={allSolved && isOpening} />
                </motion.div>

                {/* ── Tagline ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ textAlign: "center", padding: "0 24px", marginBottom: "36px" }}
                >
                  <p className="font-cormorant" style={{
                    fontStyle: "italic",
                    color: allSolved ? "var(--gold)" : "var(--muted)",
                    fontSize: "15px",
                    transition: "color 0.6s",
                    lineHeight: 1.7,
                  }}>
                    {allSolved
                      ? "La boîte s'éveille…"
                      : "Trois cadenas scellent cette boîte."}
                    <br />
                    {!allSolved && (
                      <span style={{ fontSize: "13px", opacity: 0.7 }}>
                        Choisissez votre épreuve.
                      </span>
                    )}
                  </p>
                </motion.div>

                {/* ── Lock cards ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.55 }}
                  style={{
                    display: "flex", flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "14px",
                    padding: "0 20px",
                    maxWidth: "520px",
                    width: "100%",
                  }}
                >
                  {LOCK_DATA.map((data, i) => (
                    <LockCard
                      key={i}
                      index={i as 0 | 1 | 2}
                      label={data.label}
                      sub={data.sub}
                      desc={data.desc}
                      solved={solved[i]}
                      onClick={() => setActiveEnigma(i as 0 | 1 | 2)}
                    />
                  ))}
                </motion.div>

                {/* ── Footer ── */}
                <footer style={{ marginTop: "56px", textAlign: "center", padding: "0 16px" }}>
                  <p className="font-cormorant" style={{
                    color: "var(--muted)", fontSize: "12px",
                    fontStyle: "italic", opacity: 0.45,
                  }}>
                    Tengetsu Hōzuki · 天月 · Héritier
                  </p>
                </footer>
              </div>

              {/* ── Full-screen enigma panels ── */}
              <AnimatePresence>
                {activeEnigma !== null && (
                  <EnigmaPanel
                    key={activeEnigma}
                    index={activeEnigma}
                    solved={solved[activeEnigma]}
                    onSolved={() => solve(activeEnigma as 0 | 1 | 2)}
                    onClose={() => setActiveEnigma(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </>
    </MusicContext.Provider>
  )
}
