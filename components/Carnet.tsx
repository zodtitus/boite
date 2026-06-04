"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import NarrationView from "./NarrationView"
import { narrations } from "@/data/narrations"

type Tab = "carnet" | "cartographie"

export default function Carnet() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "cartographie" ? "cartographie" : "carnet"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [currentId, setCurrentId] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const current = narrations.find((n) => n.id === currentId)!
  const currentIdx = narrations.findIndex((n) => n.id === currentId)

  function resetPuzzle() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("tengetsu-unlocked")
    }
    router.push("/")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(15,18,24,0.8)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        {/* Main header row */}
        <div
          style={{
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Sidebar toggle — only visible in Le Carnet tab */}
          {tab === "carnet" ? (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                background: "none",
                border: "1px solid rgba(200,169,110,0.2)",
                color: "var(--gold-dark)",
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-cinzel-var), serif",
                fontSize: "10px",
                letterSpacing: "2px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)"
                e.currentTarget.style.color = "var(--gold)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"
                e.currentTarget.style.color = "var(--gold-dark)"
              }}
            >
              {sidebarOpen ? "◂ Masquer" : "▸ Narrations"}
            </button>
          ) : (
            <div style={{ width: "108px" }} />
          )}

          {/* Title */}
          <div className="text-center flex-1">
            <div
              className="font-cinzel"
              style={{ color: "var(--gold)", fontSize: "clamp(12px, 2vw, 15px)", letterSpacing: "3px" }}
            >
              天月 · Le Carnet
            </div>
            {tab === "carnet" && (
              <div
                className="font-cormorant"
                style={{ color: "var(--muted)", fontSize: "12px", fontStyle: "italic" }}
              >
                Narration {current.roman} — {current.title}
              </div>
            )}
          </div>

          {/* Back to box */}
          <button
            onClick={resetPuzzle}
            style={{
              background: "none",
              border: "1px solid rgba(200,169,110,0.15)",
              color: "var(--muted)",
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "var(--font-cinzel-var), serif",
              fontSize: "9px",
              letterSpacing: "2px",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"
              e.currentTarget.style.color = "var(--gold-dark)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)"
              e.currentTarget.style.color = "var(--muted)"
            }}
          >
            ↩ La Boîte
          </button>
        </div>

        {/* Tab row */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(200,169,110,0.08)" }}>
          {(["carnet", "cartographie"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-cinzel"
              style={{
                background: "none",
                border: "none",
                padding: "10px 28px",
                cursor: "pointer",
                fontSize: "9px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: tab === t ? "var(--gold)" : "var(--muted)",
                borderBottom: tab === t ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (tab !== t) e.currentTarget.style.color = "rgba(200,169,110,0.6)"
              }}
              onMouseLeave={(e) => {
                if (tab !== t) e.currentTarget.style.color = "var(--muted)"
              }}
            >
              {t === "carnet" ? "Le Carnet" : "Cartographie"}
            </button>
          ))}
        </div>
      </header>

      {/* Cartographie tab — Relations map iframe */}
      {tab === "cartographie" && (
        <div style={{ flex: 1 }}>
          <iframe
            src="/relations.html"
            title="Cartographie des Relations"
            style={{
              width: "100%",
              height: "calc(100vh - 110px)",
              border: "none",
              display: "block",
            }}
          />
        </div>
      )}

      {/* Le Carnet tab — sidebar + narration view */}
      {tab === "carnet" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                  borderRight: "1px solid var(--border)",
                  background: "var(--bg2)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  flexShrink: 0,
                }}
              >
                <div style={{ padding: "24px 0", minWidth: "240px" }}>
                  <div
                    className="font-cinzel"
                    style={{
                      padding: "0 20px 12px",
                      fontSize: "8px",
                      letterSpacing: "4px",
                      color: "var(--muted)",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    Narrations · I–XL
                  </div>
                  {narrations.map((n) => {
                    const isActive = n.id === currentId
                    return (
                      <button
                        key={n.id}
                        onClick={() => setCurrentId(n.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "10px 20px",
                          width: "100%",
                          background: isActive ? "rgba(200,169,110,0.06)" : "transparent",
                          border: "none",
                          borderLeft: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "rgba(200,169,110,0.03)"
                            e.currentTarget.style.borderLeftColor = "rgba(200,169,110,0.3)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent"
                            e.currentTarget.style.borderLeftColor = "transparent"
                          }
                        }}
                      >
                        <span
                          className="font-cinzel"
                          style={{
                            fontSize: "9px",
                            color: isActive ? "var(--gold)" : "var(--muted)",
                            letterSpacing: "1px",
                            flexShrink: 0,
                            marginTop: "2px",
                            minWidth: "32px",
                            transition: "color 0.2s",
                          }}
                        >
                          {n.roman}
                        </span>
                        <div>
                          <div
                            className="font-cormorant"
                            style={{
                              fontSize: "14px",
                              color: isActive ? "var(--text)" : "rgba(232,224,208,0.55)",
                              lineHeight: 1.3,
                              transition: "color 0.2s",
                            }}
                          >
                            {n.title}
                          </div>
                          <div
                            className="font-cormorant"
                            style={{
                              fontSize: "11px",
                              color: "var(--muted)",
                              fontStyle: "italic",
                              marginTop: "2px",
                            }}
                          >
                            {n.period.split("·")[0].trim()}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "clamp(24px, 5vw, 60px) clamp(20px, 5vw, 80px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <NarrationView narration={current} total={narrations.length} />

            {/* Navigation prev/next */}
            <div
              className="flex items-center justify-between mt-16"
              style={{ maxWidth: "660px", width: "100%", gap: "16px" }}
            >
              <button
                onClick={() => currentIdx > 0 && setCurrentId(narrations[currentIdx - 1].id)}
                disabled={currentIdx === 0}
                style={{
                  background: "none",
                  border: "1px solid rgba(200,169,110,0.2)",
                  color: currentIdx === 0 ? "rgba(106,96,80,0.3)" : "var(--gold-dark)",
                  padding: "10px 20px",
                  cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-cinzel-var), serif",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  transition: "all 0.2s",
                  borderColor: currentIdx === 0 ? "rgba(200,169,110,0.08)" : "rgba(200,169,110,0.2)",
                }}
              >
                ← Précédente
              </button>

              {/* Progress */}
              <div className="text-center">
                <div
                  className="font-cinzel"
                  style={{ color: "var(--muted)", fontSize: "9px", letterSpacing: "3px" }}
                >
                  {currentIdx + 1} / {narrations.length}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    height: "1px",
                    width: "80px",
                    background: "var(--bg3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${((currentIdx + 1) / narrations.length) * 100}%`,
                      background: "var(--gold-dark)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => currentIdx < narrations.length - 1 && setCurrentId(narrations[currentIdx + 1].id)}
                disabled={currentIdx === narrations.length - 1}
                style={{
                  background: "none",
                  border: "1px solid rgba(200,169,110,0.2)",
                  color: currentIdx === narrations.length - 1 ? "rgba(106,96,80,0.3)" : "var(--gold-dark)",
                  padding: "10px 20px",
                  cursor: currentIdx === narrations.length - 1 ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-cinzel-var), serif",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  transition: "all 0.2s",
                  borderColor: currentIdx === narrations.length - 1 ? "rgba(200,169,110,0.08)" : "rgba(200,169,110,0.2)",
                }}
              >
                Suivante →
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  )
}
