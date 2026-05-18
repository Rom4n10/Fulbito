import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProfileForm } from "./ProfileForm";
import { calculateAge, getInitials } from "@/lib/utils";
import { getUserReputation } from "@/lib/reputation";
import { ProfileShareButton } from "./ProfileShareButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*, department:departments(name)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  const reputation = await getUserReputation(user.id);

  return (
    <div style={{ paddingTop: "16px" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
        Tu <span className="text-gradient">perfil</span>
      </h1>

      {/* Reputation Stats */}
      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div className="avatar avatar-lg" style={{ width: "64px", height: "64px", fontSize: "1.3rem" }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.first_name} />
            ) : (
              getInitials(profile.first_name, profile.last_name)
            )}
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {profile.first_name} {profile.last_name}
            </h2>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {profile.birth_date && <span>🎂 {calculateAge(profile.birth_date)} años</span>}
              {profile.department && <span> · 📍 {profile.department.name}</span>}
            </div>
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px",
          padding: "14px", background: "var(--glass-bg)", borderRadius: "var(--border-radius-sm)",
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-accent-green)" }}>
              {reputation.matchesPlayed}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>Partidos</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 700, color: reputation.flakeCount > 0 ? "var(--color-accent-amber)" : "var(--text-tertiary)" }}>
              {reputation.flakeCount}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>👻 Faltas</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 700, color: reputation.conflictiveCount > 0 ? "var(--color-accent-red)" : "var(--text-tertiary)" }}>
              {reputation.conflictiveCount}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>⚠️ Conflictos</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 700, color: reputation.mvpCount > 0 ? "var(--color-accent-amber)" : "var(--text-tertiary)" }}>
              {reputation.mvpCount}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>🏆 MVPs</p>
          </div>
        </div>
        <ProfileShareButton
          userName={`${profile.first_name} ${profile.last_name}`}
          userAvatar={profile.avatar_url}
          department={profile.department?.name}
          matchesPlayed={reputation.matchesPlayed}
          mvps={reputation.mvpCount}
        />
      </GlassCard>

      {/* Profile Onboarding/Warning Tips */}
      {!profile.phone_number || !profile.birth_date || !profile.department_id ? (
        <GlassCard
          padding="sm"
          className="animate-fade-in-up stagger-2"
          style={{
            marginBottom: "20px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.05))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-accent-amber)", marginBottom: "2px" }}>
                ¡Completá tu información de contacto!
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.3", margin: 0 }}>
                Para postularte a partidos o desafiar rivales, es fundamental que cargues tu <strong>Teléfono</strong> (con código de país, ej: <code>+549...</code> para WhatsApp) y tu <strong>Fecha de nacimiento</strong>.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard
          padding="sm"
          className="animate-fade-in-up stagger-2"
          style={{
            marginBottom: "20px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.05))",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.2rem" }}>🎉</span>
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-accent-green)", marginBottom: "2px" }}>
                ¡Perfil verificado y completo!
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.3", margin: 0 }}>
                Ya tenés cargado tu teléfono y fecha de nacimiento. ¡Estás listo para coordinar partidos vía WhatsApp sin restricciones!
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Edit Form */}
      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up stagger-3">
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Editar perfil</h3>
        <ProfileForm profile={profile} departments={departments ?? []} />
      </GlassCard>
    </div>
  );
}
