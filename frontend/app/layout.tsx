import type { Metadata, Viewport } from "next"
import { Nunito, Caveat } from "next/font/google"
import "./globals.css"
import { GlobalFloatingUI } from "@/components/social/GlobalFloatingUI"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Valendo — Bora duelar, gênio?",
  description: "Plataforma de gamificação para estudos. Crie salas, dispute perguntas e respostas em tempo real.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Permite zoom (acessibilidade) mas evita o auto-zoom do iOS em inputs <16px
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${caveat.variable} antialiased`}
    >
      <body className="min-h-screen bg-[var(--bg-page)]" style={{ fontFamily: 'var(--font-ui)' }}>
        {children}
        <GlobalFloatingUI />
      </body>
    </html>
  )
}
