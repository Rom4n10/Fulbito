import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import CreateMatchForm from "./CreateMatchForm";
import type { Tables } from "@/types/database";

export default async function CreateMatchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar si el perfil está completo
  const { data: profile } = await supabase
    .from("users")
    .select("phone_number, birth_date, department_id")
    .eq("id", user.id)
    .single();

  const isProfileIncomplete = !profile?.phone_number || !profile?.birth_date || !profile?.department_id;

  if (isProfileIncomplete) {
    return (
      <div style={{ paddingTop: "16px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
          Crear <span className="text-gradient">partido</span>
        </h1>
        <GlassCard
          variant="elevated"
          padding="lg"
          className="animate-fade-in-up"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.05))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-accent-amber)", marginBottom: "12px" }}>
            ¡Completá tu perfil primero!
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "24px" }}>
            Para poder crear un partido, es necesario que configures tu <strong>teléfono</strong>, <strong>fecha de nacimiento</strong> y <strong>departamento</strong> en tu perfil. Esto es importante para que otros jugadores puedan contactarte por WhatsApp.
          </p>
          <Link
            href="/profile"
            className="btn btn-primary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            Completar perfil
          </Link>
        </GlassCard>
      </div>
    );
  }

  const [{ data: departments }, { data: venues }, { data: memberships }] = await Promise.all([
    supabase.from("departments").select("*").order("name"),
    supabase.from("venues").select("*").order("name"),
    supabase.from("team_members").select("team:teams(*)").eq("user_id", user.id).eq("role", "capitan"),
  ]);

  const teams = memberships?.map(m => m.team).filter(Boolean) as Tables<"teams">[] ?? [];

  return (
    <div style={{ paddingTop: "16px" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
        Crear <span className="text-gradient">partido</span>
      </h1>
      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
        <CreateMatchForm departments={departments ?? []} venues={venues ?? []} teams={teams} />
      </GlassCard>
    </div>
  );
}
