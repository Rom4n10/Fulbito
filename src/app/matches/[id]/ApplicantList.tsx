"use client";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { calculateAge, getInitials } from "@/lib/utils";
import { updateRequestStatus } from "./actions";
import { useState } from "react";
import type { Tables } from "@/types/database";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Link from "next/link";
import { toast } from "react-hot-toast";

type RequestWithUser = Tables<"match_requests"> & {
  user: Tables<"users"> | null;
};

interface ApplicantListProps {
  requests: RequestWithUser[];
  matchId: string;
  matchSport: string;
  matchLocation: string;
  scheduledAt: string;
  isCreator: boolean;
}

export function ApplicantList({ requests, matchId, matchSport, matchLocation, scheduledAt, isCreator }: ApplicantListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(requestId: string, status: "aceptado" | "rechazado") {
    setLoadingId(requestId);
    const res = await updateRequestStatus(requestId, matchId, status);
    setLoadingId(null);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(
        status === "aceptado"
          ? "Postulación aceptada con éxito"
          : "Postulación rechazada con éxito"
      );
    }
  }

  if (requests.length === 0) {
    return (
      <GlassCard padding="md" style={{ textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "2rem" }}>📣</div>
        <p style={{ fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>Aún no hay postulantes para este partido</p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", margin: 0, maxWidth: "320px", lineHeight: "1.4" }}>
          ¡Compartí el enlace de este partido por WhatsApp para que tus amigos se postulen al instante!
        </p>
      </GlassCard>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {requests.map((req) => (
        <GlassCard key={req.id} padding="sm">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href={`/players/${req.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="avatar">
                {req.user?.avatar_url ? (
                  <img src={req.user.avatar_url} alt={req.user.first_name} />
                ) : (
                  getInitials(req.user?.first_name ?? "?", req.user?.last_name)
                )}
              </div>
            </Link>
            <div style={{ flex: 1 }}>
              <Link href={`/players/${req.user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {req.user?.first_name} {req.user?.last_name}
                </p>
              </Link>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                {req.user?.birth_date && <span>{calculateAge(req.user.birth_date)} años</span>}
                <span>⚽ {req.user?.matches_played ?? 0} partidos</span>
              </div>
            </div>

            {/* Status / Actions */}
            {req.status === "pendiente" && isCreator ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="primary"
                  size="sm"
                  loading={loadingId === req.id}
                  onClick={() => handleAction(req.id, "aceptado")}
                >
                  ✓
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={loadingId === req.id}
                  onClick={() => handleAction(req.id, "rechazado")}
                >
                  ✗
                </Button>
              </div>
            ) : (
              <span
                className={
                  req.status === "aceptado"
                    ? "badge badge-status-abierto"
                    : req.status === "rechazado"
                    ? "badge badge-status-cancelado"
                    : "badge"
                }
              >
                {req.status}
              </span>
            )}
          </div>

          {/* WhatsApp for accepted */}
          {req.status === "aceptado" && req.user?.phone_number && (
            <div style={{ marginTop: "8px" }}>
              <WhatsAppButton
                phoneNumber={req.user.phone_number}
                sport={matchSport}
                locationName={matchLocation}
                scheduledAt={scheduledAt}
                context={isCreator ? "creator_to_accepted" : "generic"}
              />
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
