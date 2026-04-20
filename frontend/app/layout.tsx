import type { Metadata } from "next"
import { Nunito, Caveat } from "next/font/google"
import "./globals.css"

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
      </body>
    </html>
  )
}
