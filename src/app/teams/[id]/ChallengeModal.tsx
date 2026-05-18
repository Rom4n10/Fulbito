"use client";

import { useState } from "react";
import { challengeTeam } from "@/app/actions/teams";
import toast from "react-hot-toast";

interface TeamSummary {
  id: string;
  name: string;
  logo_url: string | null;
}

interface ChallengeModalProps {
  challengedTeamId: string;
  challengedTeamName: string;
  myTeams: TeamSummary[];
}

export function ChallengeModal({ challengedTeamId, challengedTeamName, myTeams }: ChallengeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(myTeams[0]?.id || "");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      toast.error("Por favor seleccioná uno de tus equipos");
      return;
    }

    setIsLoading(true);
    const result = await challengeTeam(selectedTeamId, challengedTeamId, message);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Desafío enviado con éxito!");
      setIsOpen(false);
      setMessage("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{
          width: "100%",
          marginTop: "12px",
          background: "linear-gradient(135deg, var(--color-accent-amber), var(--color-futbol))",
          borderColor: "transparent",
          fontWeight: 700,
        }}
      >
        ⚔️ Desafiar Equipo
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius-md)",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(12px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
              Desafiar a <span style={{ color: "var(--color-accent-amber)" }}>{challengedTeamName}</span>
            </h3>

            {myTeams.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--border-radius-sm)",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    color: "var(--color-accent-amber)",
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: "8px" }}>⚠️ ¡Crea o Capitanea un Equipo!</p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Para poder enviar un desafío amistoso a <strong>{challengedTeamName}</strong>, necesitas ser capitán, fundador o administrador de al menos un equipo.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn"
                    style={{ flex: 1, background: "var(--glass-bg)", color: "var(--text-primary)" }}
                  >
                    Cerrar
                  </button>
                  <a
                    href="/teams"
                    className="btn btn-primary"
                    style={{
                      flex: 1.5,
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Ir a Equipos 🏆
                  </a>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  Envia una invitación para coordinar un partido amistoso.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      ¿Con qué equipo desafiás?
                    </label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="glass-input"
                      style={{ width: "100%" }}
                      required
                    >
                      {myTeams.map((t) => (
                        <option key={t.id} value={t.id} style={{ backgroundColor: "#1e293b", color: "#f8fafc" }}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Mensaje personalizado
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder='Ej: "Hola, ¿les copa un partidazo este fin de semana? ¡Aguante el buen fútbol!"'
                      className="glass-input"
                      rows={4}
                      style={{ width: "100%", resize: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn"
                      style={{ flex: 1, background: "var(--glass-bg)", color: "var(--text-primary)" }}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, var(--color-accent-amber), var(--color-futbol))",
                        borderColor: "transparent",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Enviando..." : "⚔️ Desafiar"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
