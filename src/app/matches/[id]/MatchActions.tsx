"use client";

import { Button } from "@/components/ui/Button";
import { confirmMatch, cancelMatch, completeMatch } from "./actions";
import { useState } from "react";
import type { Tables } from "@/types/database";

interface MatchActionsProps {
  matchId: string;
  matchStatus: string;
  matchType: string;
  acceptedPlayers: Tables<"users">[];
}

export function MatchActions({ matchId, matchStatus, matchType, acceptedPlayers }: MatchActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);

  async function handleConfirm() {
    setLoading("confirm");
    await confirmMatch(matchId);
    setLoading(null);
  }

  async function handleComplete() {
    setLoading("complete");
    await completeMatch(matchId);
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("cancel");
    await cancelMatch(matchId);
    setLoading(null);
  }

  const hasAccepted = acceptedPlayers.length > 0;
  const isRivalType = matchType === "busco_rival";

  // Determinar texto del botón de confirmación
  let confirmLabel = "✅ Confirmar partido";
  if (isRivalType && hasAccepted) {
    const rivalName = `${acceptedPlayers[0].first_name} ${acceptedPlayers[0].last_name ?? ""}`.trim();
    confirmLabel = `✅ Confirmar contra ${rivalName}`;
  } else if (!isRivalType && hasAccepted) {
    confirmLabel = `✅ Confirmar con ${acceptedPlayers.length} jugador${acceptedPlayers.length > 1 ? "es" : ""}`;
  }

  if (matchStatus === "abierto") {
    return (
      <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {!hasAccepted && (
          <p style={{
            fontSize: "0.75rem",
            color: "var(--color-accent-amber)",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            padding: "8px 12px",
            borderRadius: "var(--border-radius-sm)",
            margin: "0 0 4px 0",
            lineHeight: "1.4"
          }}>
            {isRivalType 
              ? "⚠️ Debes aceptar la postulación de un rival antes de poder confirmar el partido."
              : "⚠️ Debes aceptar al menos la postulación de un jugador antes de poder confirmar el partido."
            }
          </p>
        )}
        
        <Button 
          variant="primary" 
          loading={loading === "confirm"} 
          onClick={handleConfirm}
          disabled={!hasAccepted}
        >
          {confirmLabel}
        </Button>
        
        {!showCancel ? (
          <button
            onClick={() => setShowCancel(true)}
            style={{
              background: "none", border: "none", color: "var(--text-tertiary)",
              fontSize: "0.8rem", cursor: "pointer", padding: "8px",
            }}
          >
            Cancelar partido
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-accent-red)" }}>¿Seguro?</span>
            <Button variant="danger" size="sm" loading={loading === "cancel"} onClick={handleCancel}>
              Sí, cancelar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCancel(false)}>
              No
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (matchStatus === "confirmado") {
    return (
      <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <p style={{
          fontSize: "0.8rem",
          color: "var(--color-accent-green)",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          padding: "8px 12px",
          borderRadius: "var(--border-radius-sm)",
          margin: "0 0 4px 0",
          textAlign: "center",
          fontWeight: 600
        }}>
          🟢 Partido Confirmado
        </p>

        <Button variant="primary" loading={loading === "complete"} onClick={handleComplete}>
          ⚽ Finalizar partido (Se jugó)
        </Button>

        {!showCancel ? (
          <button
            onClick={() => setShowCancel(true)}
            style={{
              background: "none", border: "none", color: "var(--text-tertiary)",
              fontSize: "0.8rem", cursor: "pointer", padding: "8px",
            }}
          >
            Dar de baja partido
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-accent-red)" }}>¿Seguro?</span>
            <Button variant="danger" size="sm" loading={loading === "cancel"} onClick={handleCancel}>
              Sí, dar de baja
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCancel(false)}>
              No
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
