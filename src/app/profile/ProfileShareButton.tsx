"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareCard } from "@/components/ShareCard";

interface ProfileShareButtonProps {
  userName: string;
  userAvatar?: string | null;
  department?: string;
  matchesPlayed: number;
  mvps: number;
}

export function ProfileShareButton({
  userName,
  userAvatar,
  department,
  matchesPlayed,
  mvps
}: ProfileShareButtonProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowShare(true)}
        className="glass-button w-full mt-4 flex items-center justify-center gap-2"
      >
        <Share2 size={16} />
        Compartir mi perfil
      </button>

      {showShare && (
        <ShareCard
          title="Fichame para tu equipo"
          subtitle={`Jugador libre en ${department || "Mendoza"}`}
          userName={userName}
          userAvatar={userAvatar}
          stats={[
            { label: "Partidos", value: matchesPlayed },
            { label: "MVPs", value: mvps }
          ]}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
