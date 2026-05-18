import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import CreateMatchForm from "./CreateMatchForm";
import type { Tables } from "@/types/database";

export default async function CreateMatchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
