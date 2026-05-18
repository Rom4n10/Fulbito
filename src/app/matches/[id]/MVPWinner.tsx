"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Share2 } from "lucide-react";
import { ShareCard } from "@/components/ShareCard";
import { getInitials } from "@/lib/utils";

interface MVPWinnerProps {
  mvpId: string;
  mvpName: string;
  mvpAvatar?: string | null;
  voteCount: number;
  totalVotes: number;
  sport: string;
}

export function MVPWinner({ mvpId, mvpName, mvpAvatar, voteCount, totalVotes, sport }: MVPWinnerProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <GlassCard padding="lg" className="animate-fade-in-up text-center" style={{ border: "2px solid var(--color-accent-amber)" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-accent-amber)", marginBottom: "16px" }}>
          🏆 ¡JUGADOR DESTACADO! 🏆
        </h2>
        
        <div className="avatar avatar-lg mx-auto" style={{ width: "80px", height: "80px", marginBottom: "12px", border: "2px solid var(--color-accent-amber)" }}>
          {mvpAvatar ? (
            <img src={mvpAvatar} alt={mvpName} />
          ) : (
            getInitials(mvpName.split(" ")[0], mvpName.split(" ")[1])
          )}
        </div>
        
        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "4px" }}>
          {mvpName}
        </h3>
        
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
          Con {voteCount} voto{voteCount !== 1 ? "s" : ""} de {totalVotes}
        </p>

        <button
          onClick={() => setShowShare(true)}
          className="glass-button flex items-center justify-center gap-2 mx-auto"
          style={{ background: "linear-gradient(45deg, var(--color-accent-amber), #f59e0b)", color: "#000", border: "none" }}
        >
          <Share2 size={16} />
          Compartir MVP
        </button>
      </GlassCard>

      {showShare && (
        <ShareCard
          title="¡Jugador Destacado!"
          subtitle={`MVP del partido de ${sport}`}
          userName={mvpName}
          userAvatar={mvpAvatar}
          stats={[
            { label: "Votos", value: voteCount },
            { label: "Total", value: totalVotes }
          ]}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
