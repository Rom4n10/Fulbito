"use client";

import { removeMember } from "@/app/actions/teams";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface TeamMemberActionsProps {
  teamId: string;
  userId: string;
  memberName: string;
}

export function TeamMemberActions({ teamId, userId, memberName }: TeamMemberActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleRemove() {
    setLoading(true);
    await removeMember(teamId, userId);
    setLoading(false);
    setConfirm(false);
  }

  if (confirm) {
    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--color-accent-red)" }}>¿Sacar?</span>
        <Button variant="danger" size="sm" loading={loading} onClick={handleRemove}>Sí</Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>No</Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      style={{
        background: "none", border: "none", color: "var(--text-tertiary)",
        fontSize: "0.7rem", cursor: "pointer", padding: "4px 8px",
      }}
    >
      ✕
    </button>
  );
}
