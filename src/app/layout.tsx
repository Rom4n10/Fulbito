import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a1a",
};

export const metadata: Metadata = {
  title: "Fulbito — Matchmaking Deportivo",
  description:
    "Encontrá rivales y jugadores para tus partidos de fútbol y pádel. Organizá, postulate y jugá.",
  keywords: ["fútbol", "pádel", "matchmaking", "deportes", "amateur"],
  authors: [{ name: "Fulbito App" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={inter.className}>
        <div className="app-background" aria-hidden="true" />
        <main className="container-app">{children}</main>
        <Navbar />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
              borderRadius: "16px",
              fontSize: "0.95rem",
              maxWidth: "90%",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
