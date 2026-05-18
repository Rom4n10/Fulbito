import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import CreateTeamForm from "./CreateTeamForm";

export default async function CreateTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  return (
    <div style={{ paddingTop: "16px" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
        Crear <span className="text-gradient">equipo</span>
      </h1>

      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
        <CreateTeamForm departments={departments ?? []} />
      </GlassCard>
    </div>
  );
}
