"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

const navItems = [
  {
    href: "/",
    label: "Feed",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/my-matches",
    label: "Partidos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/matches/create",
    label: "Crear",
    isAction: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: "/teams",
    label: "Equipos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  { href: "__bell__", label: "Alertas", isBell: true },
  {
    href: "/profile",
    label: "Perfil",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function Navbar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav
      className="glass-navbar"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        height: "var(--navbar-height)", display: "flex", alignItems: "center",
        justifyContent: "space-around", padding: "0 4px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      id="navbar-main"
    >
      {navItems.map((item) => {
        if (item.isBell) {
          return (
            <div key="bell" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <NotificationBell />
              <span style={{ fontSize: "0.6rem", fontWeight: 500, color: "var(--text-tertiary)" }}>
                {item.label}
              </span>
            </div>
          );
        }

        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        if (item.isAction) {
          return (
            <Link key={item.href} href={item.href} id={`nav-${item.label.toLowerCase()}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textDecoration: "none", position: "relative", bottom: "8px" }}>
              <span style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                boxShadow: "0 4px 20px var(--color-primary-glow)", transition: "all var(--transition-base)",
              }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "2px" }}>
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link key={item.href} href={item.href} id={`nav-${item.label.toLowerCase()}`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              textDecoration: "none", padding: "6px 8px", borderRadius: "var(--border-radius-sm)",
              color: isActive ? "var(--color-primary-light)" : "var(--text-tertiary)",
              transition: "all var(--transition-base)", position: "relative",
            }}>
            {isActive && (
              <span style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "20px", height: "3px", borderRadius: "2px", background: "var(--color-primary)",
              }} />
            )}
            {item.icon}
            <span style={{ fontSize: "0.6rem", fontWeight: isActive ? 700 : 500 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
