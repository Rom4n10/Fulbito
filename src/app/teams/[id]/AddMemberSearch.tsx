"use client";

import { useState } from "react";
import { searchUsers, addMember } from "@/app/actions/teams";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils";

interface AddMemberSearchProps {
  teamId: string;
}

interface UserResult {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
}

export function AddMemberSearch({ teamId }: AddMemberSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  async function handleSearch() {
    if (query.trim().length < 2) return;
    setLoading(true);
    setMessage(null);
    const users = await searchUsers(query.trim());
    setResults(users);
    setLoading(false);
  }

  async function handleAdd(userId: string) {
    setAddingId(userId);
    setMessage(null);
    const result = await addMember(teamId, userId);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "¡Miembro agregado!" });
      setResults((prev) => prev.filter((u) => u.id !== userId));
    }
    setAddingId(null);
  }

  if (!showSearch) {
    return (
      <button
        onClick={() => setShowSearch(true)}
        className="btn btn-secondary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        ➕ Agregar miembro
      </button>
    );
  }

  return (
    <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>
        Buscar jugador
      </h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          className="glass-input"
          placeholder="Nombre del jugador..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <Button variant="primary" size="sm" loading={loading} onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      {message && (
        <p style={{
          color: message.type === "error" ? "var(--color-accent-red)" : "var(--color-accent-green)",
          fontSize: "0.8rem", marginBottom: "8px",
        }}>
          {message.text}
        </p>
      )}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {results.map((u) => (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px", borderRadius: "var(--border-radius-sm)",
              background: "var(--glass-bg)",
            }}>
              <div className="avatar avatar-sm">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.first_name} />
                ) : (
                  getInitials(u.first_name, u.last_name)
                )}
              </div>
              <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>
                {u.first_name} {u.last_name}
              </span>
              <Button
                variant="primary"
                size="sm"
                loading={addingId === u.id}
                onClick={() => handleAdd(u.id)}
              >
                + Agregar
              </Button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => { setShowSearch(false); setResults([]); setQuery(""); }}
        style={{
          background: "none", border: "none", color: "var(--text-tertiary)",
          fontSize: "0.8rem", cursor: "pointer", marginTop: "8px",
        }}
      >
        ← Cerrar
      </button>
    </GlassCard>
  );
}
