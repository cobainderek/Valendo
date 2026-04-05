import type { Metadata, Viewport } from "next";
import { Nunito, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Valendo! — Aprenda Duelando",
    template: "%s | Valendo!",
  },
  description: "Plataforma de duelos de conhecimento em tempo real. Desafie amigos, responda perguntas geradas por IA e suba no ranking!",
  keywords: ["quiz", "duelo", "conhecimento", "tempo real", "multiplayer", "perguntas"],
  authors: [{ name: "Valendo!" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Valendo!",
    title: "Valendo! — Aprenda Duelando",
    description: "Desafie amigos em duelos de conhecimento em tempo real!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valendo! — Aprenda Duelando",
    description: "Desafie amigos em duelos de conhecimento em tempo real!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1B3A5C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} ${spaceMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-card !border-border/50 !text-card-foreground",
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
