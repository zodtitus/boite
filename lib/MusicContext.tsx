"use client"
import { createContext, useContext } from "react"

export interface MusicCtx {
  getBassPulse: () => number   // returns 0-1 instantaneous bass energy
}

export const MusicContext = createContext<MusicCtx>({ getBassPulse: () => 0 })
export const useMusicContext = () => useContext(MusicContext)
