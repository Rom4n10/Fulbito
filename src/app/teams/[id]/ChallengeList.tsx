"use client";

import { useState } from "react";
import { updateChallengeStatus } from "@/app/actions/teams";
import { GlassCard } from "@/components/ui/GlassCard";
import toast from "react-hot-toast";
import { getInitials } from "@/lib/utils";

interface UserFounder {
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
}

interface TeamDetail {
  id: string;
  name: string;
  logo_url: string | null;
  founder: UserFounder | null;
}

interface Challenge {
  id: string;
  created_at: string;
  message: string | null;
  status: "pendiente" | "aceptado" | "rechazado";
  challenger?: TeamDetail;
  challenged?: TeamDetail;
}

interface ChallengeListProps {
  incoming: Challenge[];
  outgoing: Challenge[];
  canManage: boolean;
  teamName: string;
}

export function ChallengeList({ incoming, outgoing, canManage, teamName }: ChallengeListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (challengeId: string, newStatus: "aceptado" | "rechazado") => {
    setLoadingId(challengeId);
    const result = await updateChallengeStatus(challengeId, newStatus);
    setLoadingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(newStatus === "aceptado" ? "¡Desafío aceptado!" : "Desafío rechazado.");
    }
  };

  const cleanPhone = (phone: string | null | undefined): string => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <GlassCard padding="md" style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
        <p style={{ fontSize: "0.85rem" }}>
          Sin desafíos activos en este momento.
        </p>
      </GlassCard>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Incoming Challenges */}
      {incoming.length > 0 && (
        <div>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary-light)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            📥 Desafíos Recibidos ({incoming.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {incoming.map((ch) => {
              const challenger = ch.challenger!;
              const founder = challenger.founder;
              const hasPhone = !!founder?.phone_number;

              return (
                <GlassCard key={ch.id} padding="sm" style={{ borderLeft: "4px solid var(--color-primary)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="avatar avatar-sm" style={{
                          background: challenger.logo_url ? "transparent" : "linear-gradient(135deg, var(--color-futbol), var(--color-padel))",
                          width: "36px", height: "36px"
                        }}>
                          {challenger.logo_url ? (
                            <img src={challenger.logo_url} alt={challenger.name} />
                          ) : (
                            getInitials(challenger.name, null)
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{challenger.name}</p>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                            Fundador: {founder?.first_name} {founder?.last_name || ""}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges / Action buttons */}
                      <div>
                        {ch.status === "pendiente" ? (
                          canManage ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => handleStatusChange(ch.id, "aceptado")}
                                disabled={loadingId === ch.id}
                                className="btn btn-sm"
                                style={{
                                  background: "rgba(16, 185, 129, 0.2)",
                                  color: "var(--color-accent-green)",
                                  border: "1px solid rgba(16, 185, 129, 0.4)",
                                  fontSize: "0.7rem",
                                  padding: "4px 8px"
                                }}
                              >
                                {loadingId === ch.id ? "..." : "Aceptar"}
                              </button>
                              <button
                                onClick={() => handleStatusChange(ch.id, "rechazado")}
                                disabled={loadingId === ch.id}
                                className="btn btn-sm"
                                style={{
                                  background: "rgba(239, 68, 68, 0.2)",
                                  color: "#f87171",
                                  border: "1px solid rgba(239, 68, 68, 0.4)",
                                  fontSize: "0.7rem",
                                  padding: "4px 8px"
                                }}
                              >
                                {loadingId === ch.id ? "..." : "Rechazar"}
                              </button>
                            </div>
                          ) : (
                            <span className="badge badge-status-abierto" style={{ fontSize: "0.65rem" }}>
                              Pendiente
                            </span>
                          )
                        ) : (
                          <span className={`badge badge-status-${ch.status === "aceptado" ? "confirmado" : "cancelado"}`} style={{ fontSize: "0.65rem" }}>
                            {ch.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {ch.message && (
                      <div style={{
                        background: "var(--glass-bg)",
                        padding: "8px 12px",
                        borderRadius: "var(--border-radius-sm)",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--glass-border)"
                      }}>
                        💬 "{ch.message}"
                      </div>
                    )}

                    {ch.status === "aceptado" && (
                      <div style={{ marginTop: "4px" }}>
                        {hasPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone(founder?.phone_number)}?text=${encodeURIComponent(
                              `¡Hola! Soy del equipo ${teamName}. Aceptamos el desafío de ${challenger.name} en Fulbito. ¿Coordinamos el partido? ⚽`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{
                              width: "100%",
                              background: "rgba(37, 211, 102, 0.15)",
                              color: "#4ade80",
                              border: "1px solid rgba(37, 211, 102, 0.4)",
                              textAlign: "center",
                              textDecoration: "none",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px"
                            }}
                          >
                            💬 Contactar Capitán ({founder?.first_name})
                          </a>
                        ) : (
                          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontStyle: "italic", textAlign: "center" }}>
                            El capitán desafiante no registró su teléfono.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Outgoing Challenges */}
      {outgoing.length > 0 && (
        <div>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-accent-amber)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            ⚔️ Desafíos Enviados ({outgoing.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {outgoing.map((ch) => {
              const challenged = ch.challenged!;
              const founder = challenged.founder;
              const hasPhone = !!founder?.phone_number;

              return (
                <GlassCard key={ch.id} padding="sm" style={{ borderLeft: "4px solid var(--color-accent-amber)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="avatar avatar-sm" style={{
                          background: challenged.logo_url ? "transparent" : "linear-gradient(135deg, var(--color-futbol), var(--color-padel))",
                          width: "36px", height: "36px"
                        }}>
                          {challenged.logo_url ? (
                            <img src={challenged.logo_url} alt={challenged.name} />
                          ) : (
                            getInitials(challenged.name, null)
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{challenged.name}</p>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                            Fundador: {founder?.first_name} {founder?.last_name || ""}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className={`badge badge-status-${
                          ch.status === "pendiente" ? "abierto" : ch.status === "aceptado" ? "confirmado" : "cancelado"
                        }`} style={{ fontSize: "0.65rem" }}>
                          {ch.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {ch.message && (
                      <div style={{
                        background: "var(--glass-bg)",
                        padding: "8px 12px",
                        borderRadius: "var(--border-radius-sm)",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--glass-border)"
                      }}>
                        💬 "{ch.message}"
                      </div>
                    )}

                    {ch.status === "aceptado" && (
                      <div style={{ marginTop: "4px" }}>
                        {hasPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone(founder?.phone_number)}?text=${encodeURIComponent(
                              `¡Hola! Soy del equipo ${teamName}. Vi que aceptaron nuestro desafío en Fulbito. ¿Coordinamos el partido? ⚽`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{
                              width: "100%",
                              background: "rgba(37, 211, 102, 0.15)",
                              color: "#4ade80",
                              border: "1px solid rgba(37, 211, 102, 0.4)",
                              textAlign: "center",
                              textDecoration: "none",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px"
                            }}
                          >
                            💬 Contactar Capitán ({founder?.first_name})
                          </a>
                        ) : (
                          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontStyle: "italic", textAlign: "center" }}>
                            El capitán del rival no registró su teléfono.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
