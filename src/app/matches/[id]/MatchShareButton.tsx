"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareCard } from "@/components/ShareCard";

interface MatchShareButtonProps {
  sportEmoji: string;
  sportLabel: string;
  typeLabel: string;
  locationDisplay: string;
  scheduledAt: string;
  pricePerPerson?: number | null;
  creatorName: string;
  creatorAvatar?: string | null;
}

export function MatchShareButton({
  sportEmoji,
  sportLabel,
  typeLabel,
  locationDisplay,
  scheduledAt,
  pricePerPerson,
  creatorName,
  creatorAvatar
}: MatchShareButtonProps) {
  const [showShare, setShowShare] = useState(false);

  // Format date simply for share card
  const dateObj = new Date(scheduledAt);
  const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1} ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}hs`;

  return (
    <>
      <button
        onClick={() => setShowShare(true)}
        className="glass-button flex items-center justify-center gap-2 mt-4"
        style={{ width: "100%", background: "var(--color-accent-blue)", color: "#fff", border: "none" }}
      >
        <Share2 size={16} />
        Invitar amigos
      </button>

      {showShare && (
        <ShareCard
          title={`${sportEmoji} ${sportLabel}`}
          subtitle={`${typeLabel} en ${locationDisplay}`}
          userName={creatorName}
          userAvatar={creatorAvatar}
          matchInfo={`🗓️ ${dateStr}${pricePerPerson ? ` · 💰 $${pricePerPerson}` : ""}`}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
