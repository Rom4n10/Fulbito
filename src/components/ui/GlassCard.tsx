import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated";
  padding?: "sm" | "md" | "lg";
  animate?: boolean;
  stagger?: number;
  style?: CSSProperties;
}

export function GlassCard({
  children,
  className = "",
  variant = "default",
  padding = "md",
  animate = false,
  stagger,
  style,
}: GlassCardProps) {
  const baseClass = variant === "elevated" ? "glass-card-elevated" : "glass-card";
  const paddingMap = { sm: "12px", md: "20px", lg: "28px" };
  const animClass = animate ? `animate-fade-in-up${stagger ? ` stagger-${stagger}` : ""}` : "";

  return (
    <div
      className={`${baseClass} ${animClass} ${className}`}
      style={{ padding: paddingMap[padding], ...style }}
    >
      {children}
    </div>
  );
}

