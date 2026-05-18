"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import { ReactNode } from "react";

interface SubmitButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SubmitButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  style,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      loading={pending}
      disabled={pending}
      icon={icon}
      className={className}
      style={style}
    >
      {pending ? "Cargando..." : children}
    </Button>
  );
}
