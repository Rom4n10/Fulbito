"use client";

import { Button } from "@/components/ui/Button";
import { confirmMatch, cancelMatch } from "./actions";
import { useState } from "react";

interface MatchActionsProps {
  matchId: string;
}

export function MatchActions({ matchId }: MatchActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);

  async function handleConfirm() {
    setLoading("confirm");
    await confirmMatch(matchId);
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("cancel");
    await cancelMatch(matchId);
    setLoading(null);
  }

  return (
    <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button variant="primary" loading={loading === "confirm"} onClick={handleConfirm}>
        ✅ Confirmar partido
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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
