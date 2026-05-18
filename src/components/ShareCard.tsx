"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ShareCardProps {
  title: string;
  subtitle: string;
  stats?: { label: string; value: string | number }[];
  userName?: string;
  userAvatar?: string | null;
  matchInfo?: string;
  onClose?: () => void;
}

export function ShareCard({
  title,
  subtitle,
  stats,
  userName,
  userAvatar,
  matchInfo,
  onClose,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (action: "download" | "share") => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      if (action === "download") {
        const link = document.createElement("a");
        link.download = `fulbito-share-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else if (action === "share" && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "fulbito.png", { type: "image/png" });
        await navigator.share({
          title: "Fulbito App",
          text: title + " - " + subtitle,
          files: [file],
        });
      }
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Hubo un problema al generar la imagen.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* The Card to be captured */}
        <div
          ref={cardRef}
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            position: "relative",
            overflow: "hidden",
            color: "white",
            textAlign: "center"
          }}
        >
          {/* Decorative background blur */}
          <div style={{
            position: "absolute", top: "-50px", left: "-50px", width: "150px", height: "150px",
            background: "var(--color-accent-green)", filter: "blur(80px)", opacity: 0.2, borderRadius: "50%"
          }} />
          <div style={{
            position: "absolute", bottom: "-50px", right: "-50px", width: "150px", height: "150px",
            background: "var(--color-accent-blue)", filter: "blur(80px)", opacity: 0.2, borderRadius: "50%"
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 10 }}>
            {userAvatar && (
              <img
                src={userAvatar}
                alt="Avatar"
                style={{
                  width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover",
                  margin: "0 auto 16px", border: "2px solid var(--color-accent-green)"
                }}
                crossOrigin="anonymous"
              />
            )}
            {userName && (
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 4px" }}>{userName}</h3>
            )}
            
            <h2 style={{
              fontSize: "1.8rem", fontWeight: 900,
              background: "linear-gradient(to right, var(--color-accent-green), var(--color-accent-blue))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              margin: "16px 0 8px", lineHeight: 1.1
            }}>
              {title}
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", marginBottom: "24px" }}>
              {subtitle}
            </p>

            {matchInfo && (
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", marginBottom: "24px" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>{matchInfo}</p>
              </div>
            )}

            {stats && stats.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "12px" }}>
                {stats.map((stat, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px" }}>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 4px" }}>{stat.value}</p>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Logo/Branding */}
            <div style={{ marginTop: "32px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", background: "var(--color-accent-green)", borderRadius: "4px" }} />
              <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.05em" }}>FULBITO</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => generateImage("download")}
            disabled={isGenerating}
            className="flex-1 glass-button py-3 font-semibold flex items-center justify-center gap-2"
          >
            {isGenerating ? "Generando..." : (
              <>
                <Download size={18} />
                Guardar
              </>
            )}
          </button>
          
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={() => generateImage("share")}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-accent-green to-accent-blue text-dark font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Share2 size={18} />
              Compartir
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-2 text-white/50 text-sm font-medium hover:text-white transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
