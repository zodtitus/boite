"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Narration } from "@/data/narrations"

interface NarrationViewProps {
  narration: Narration
}

export default function NarrationView({ narration }: NarrationViewProps) {
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
                  className="narration-quote"
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
                  {block.text}
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
                {block.text}
              </p>
            )
          })}
        </div>

        {/* Footer line */}
        <div className="mt-10 flex items-center gap-3">
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, var(--gold-dark), transparent)", opacity: 0.3 }} />
          <span className="font-cinzel" style={{ color: "var(--muted)", fontSize: "9px", letterSpacing: "2px" }}>
            {narration.roman} / XV
          </span>
        </div>
      </motion.article>
    </AnimatePresence>
  )
}
