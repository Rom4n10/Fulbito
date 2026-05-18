"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "@/app/actions/notifications";
import type { Tables } from "@/types/database";
import Link from "next/link";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Tables<"notifications">[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    getUnreadCount().then(setCount);
  }, []);

  // Realtime subscription
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          setCount((c) => c + 1);
          // If panel is open, refresh list
          if (open) {
            getNotifications().then(setNotifications);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleOpen() {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setCount((c) => Math.max(0, c - 1));
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  const typeIcon: Record<string, string> = {
    postulacion_nueva: "📩",
    postulacion_aceptada: "✅",
    postulacion_rechazada: "❌",
    partido_cancelado: "🚫",
    partido_confirmado: "🎉",
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        style={{
          background: "none", border: "none", cursor: "pointer", position: "relative",
          padding: "8px", color: open ? "var(--color-primary-light)" : "var(--text-tertiary)",
          transition: "color var(--transition-base)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span style={{
            position: "absolute", top: "2px", right: "2px",
            background: "var(--color-accent-red)", color: "white",
            fontSize: "0.65rem", fontWeight: 700, borderRadius: "50%",
            width: "18px", height: "18px", display: "flex",
            alignItems: "center", justifyContent: "center",
            animation: "pulse-glow 2s infinite",
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="glass-card-elevated animate-fade-in"
          style={{
            position: "absolute", bottom: "calc(100% + 12px)", right: "-40px",
            width: "320px", maxHeight: "400px", overflowY: "auto",
            padding: "12px", zIndex: 100,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Notificaciones</h3>
            {count > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                Marcar leídas
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)" }}>Cargando...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
              Sin notificaciones
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.match_id ? `/matches/${n.match_id}` : "#"}
                  onClick={() => { if (!n.is_read) handleMarkRead(n.id); setOpen(false); }}
                  style={{
                    textDecoration: "none", color: "inherit", padding: "10px",
                    borderRadius: "var(--border-radius-sm)", display: "flex", gap: "10px",
                    alignItems: "flex-start", transition: "background var(--transition-fast)",
                    background: n.is_read ? "transparent" : "rgba(99, 102, 241, 0.1)",
                    borderLeft: n.is_read ? "3px solid transparent" : "3px solid var(--color-primary)",
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{typeIcon[n.type] ?? "🔔"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: n.is_read ? 400 : 600, marginBottom: "2px" }}>
                      {n.title}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.message}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
