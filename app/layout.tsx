import type { Metadata } from "next"
import { Cinzel, Cormorant_Garamond } from "next/font/google"
import "./globals.css"

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel-var",
  weight: ["400", "600", "700"],
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-var",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Le Carnet de Tengetsu Hōzuki",
  description: "天月 — Cartographie d'une ascension",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${cormorant.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
