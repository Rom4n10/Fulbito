"use client";

import { signInWithGoogle } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { GlassCard } from "@/components/ui/GlassCard";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      {/* Logo & Branding */}
      <div className="animate-fade-in-up" style={{ marginBottom: "40px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-green))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "2.5rem",
            boxShadow: "0 8px 32px var(--color-primary-glow)",
          }}
        >
          ⚽
        </div>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          <span className="text-gradient">Fulbito</span>
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            maxWidth: "280px",
            lineHeight: 1.5,
          }}
        >
          Encontrá rivales y jugadores para tus partidos de fútbol y pádel
        </p>
      </div>

      {/* Login Card */}
      <GlassCard
        variant="elevated"
        padding="lg"
        className="animate-fade-in-up stagger-2"
      >
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Empezá a jugar
          </h2>
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.85rem",
              marginBottom: "24px",
            }}
          >
            Ingresá con tu cuenta de Google para continuar
          </p>

          <form action={signInWithGoogle}>
            <SubmitButton
              variant="primary"
              size="lg"
              className=""
              style={{ width: "100%" }}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            >
              Continuar con Google
            </SubmitButton>
          </form>

          <p
            style={{
              marginTop: "20px",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              lineHeight: 1.5,
            }}
          >
            Al continuar, aceptás nuestros términos de servicio y política de
            privacidad.
          </p>
        </div>
      </GlassCard>

      {/* Features Preview */}
      <div
        className="animate-fade-in-up stagger-4"
        style={{
          display: "flex",
          gap: "24px",
          marginTop: "48px",
          color: "var(--text-tertiary)",
          fontSize: "0.8rem",
        }}
      >
        {[
          { emoji: "🏟️", text: "Organizá" },
          { emoji: "🤝", text: "Competí" },
          { emoji: "⭐", text: "Reputación" },
        ].map((feature) => (
          <div
            key={feature.text}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{feature.emoji}</span>
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
