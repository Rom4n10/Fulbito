import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AuthErrorPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <GlassCard variant="elevated" padding="lg">
        <div style={{ textAlign: "center", maxWidth: "320px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😕</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>
            Error de autenticación
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              marginBottom: "24px",
              lineHeight: 1.5,
            }}
          >
            Hubo un problema al iniciar sesión. Por favor, intentá de nuevo.
          </p>
          <Link
            href="/login"
            className="btn btn-primary"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            Volver al login
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
