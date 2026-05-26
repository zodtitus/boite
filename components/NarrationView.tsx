"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Narration } from "@/data/narrations"

interface NarrationViewProps {
  narration: Narration
  total: number
}

function renderText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    const token = match[0]
    if (token.startsWith("**")) {
      parts.push(<strong key={match.index} style={{ color: "var(--gold)", fontWeight: 600 }}>{token.slice(2, -2)}</strong>)
    } else {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>)
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts
}

export default function NarrationView({ narration, total }: NarrationViewProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={narration.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ maxWidth: "660px", width: "100%" }}
      >
        {/* Narration header */}
        <header className="mb-8">
          <div
            className="font-cinzel mb-1"
            style={{
              fontSize: "10px",
              letterSpacing: "4px",
              color: "var(--gold-dark)",
              textTransform: "uppercase",
            }}
          >
            Narration {narration.roman}
          </div>

          <h2
            className="font-cinzel"
            style={{
              fontSize: "clamp(18px, 3vw, 26px)",
              color: "var(--gold)",
              letterSpacing: "1px",
              marginBottom: "6px",
              lineHeight: 1.2,
            }}
          >
            {narration.title}
          </h2>

          <div
            className="font-cormorant"
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              fontStyle: "italic",
            }}
          >
            {narration.period}
          </div>

          {/* Decorative separator */}
          <div className="flex items-center gap-3 mt-5">
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, var(--gold-dark))" }} />
            <span className="font-cinzel" style={{ color: "var(--gold-dark)", fontSize: "10px" }}>天月</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, var(--gold-dark))" }} />
          </div>
        </header>

        {/* Narration content */}
        <div className="font-cormorant flex flex-col gap-5">
          {narration.blocks.map((block, i) => {
            if (block.type === "separator") {
              return (
                <div
                  key={i}
                  style={{
                    width: "60px",
                    height: "1px",
                    background: "var(--gold-dark)",
                    opacity: 0.4,
                    margin: "4px 0",
                  }}
                />
              )
            }

            if (block.type === "quote") {
              return (
                <blockquote
                  key={i}
                  style={{
                    borderLeftColor: "var(--gold-dark)",
                    paddingLeft: "18px",
                    borderLeftWidth: "2px",
                    borderLeftStyle: "solid",
                    margin: "4px 0",
                    fontStyle: "italic",
                    color: "var(--muted)",
                    fontSize: "17px",
                    lineHeight: 1.75,
                  }}
                >
                  {renderText(block.text)}
                </blockquote>
              )
            }

            return (
              <p
                key={i}
                style={{
                  fontSize: "17px",
                  lineHeight: 1.9,
                  color: "var(--text)",
                }}
              >
                {renderText(block.text)}
              </p>
            )
          })}
        </div>

        {/* Footer line */}
        <div className="mt-10 flex items-center gap-3">
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, var(--gold-dark), transparent)", opacity: 0.3 }} />
          <span className="font-cinzel" style={{ color: "var(--muted)", fontSize: "9px", letterSpacing: "2px" }}>
            {narration.roman} / {total}
          </span>
        </div>
      </motion.article>
    </AnimatePresence>
  )
}
