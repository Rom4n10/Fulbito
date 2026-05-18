"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { submitReview } from "@/app/actions/reviews";

interface ReviewModalProps {
  matchId: string;
  revieweeId: string;
  revieweeName: string;
  onClose: () => void;
}

export function ReviewModal({ matchId, revieweeId, revieweeName, onClose }: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("match_id", matchId);
    formData.set("reviewee_id", revieweeId);

    const result = await submitReview(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <GlassCard variant="elevated" padding="lg">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>
            Evaluar a {revieweeName}
          </h3>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginBottom: "20px" }}>
            Tu opinión ayuda a la comunidad
          </p>

          <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Toggles */}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontSize: "0.9rem" }}>⚠️ ¿Fue conflictivo?</span>
              <input name="is_conflictive" type="checkbox" value="true"
                style={{ width: "20px", height: "20px", accentColor: "var(--color-accent-red)" }} />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontSize: "0.9rem" }}>👻 ¿No se presentó?</span>
              <input name="is_flake" type="checkbox" value="true"
                style={{ width: "20px", height: "20px", accentColor: "var(--color-accent-amber)" }} />
            </label>

            {/* Comment */}
            <textarea
              name="comment"
              className="glass-input"
              placeholder="Comentario opcional..."
              rows={3}
              style={{ resize: "none" }}
            />

            {error && (
              <p style={{ color: "var(--color-accent-red)", fontSize: "0.8rem" }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={loading} style={{ flex: 1 }}>
                Enviar
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
