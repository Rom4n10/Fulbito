"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createMatch(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar si el perfil está completo
  const { data: profile } = await supabase
    .from("users")
    .select("phone_number, birth_date, department_id")
    .eq("id", user.id)
    .single();

  if (!profile?.phone_number || !profile?.birth_date || !profile?.department_id) {
    return { error: "Debes completar tu perfil (teléfono, fecha de nacimiento y departamento) para crear partidos." };
  }

  const type = formData.get("type") as string;
  const sport = formData.get("sport") as string;
  const venueId = formData.get("venue_id") as string;
  const locationName = formData.get("location_name") as string;
  const scheduledAt = formData.get("scheduled_at") as string;
  const footballType = formData.get("football_type") as string;
  const minAge = formData.get("min_age") as string;
  const maxAge = formData.get("max_age") as string;
  const teamId = formData.get("team_id") as string;
  const pricePerPerson = formData.get("price_per_person") as string;
  const isPaid = formData.get("is_paid") === "true";
  const skillLevel = (formData.get("skill_level") as string) || "cualquiera";
  const slotsNeededRaw = formData.get("slots_needed") as string;
  const slotsNeeded = slotsNeededRaw ? parseInt(slotsNeededRaw) : 1;

  if (!type || !sport || !scheduledAt) {
    return { error: "Completá todos los campos obligatorios" };
  }

  if (new Date(scheduledAt) <= new Date()) {
    return { error: "La fecha y hora del partido deben ser en el futuro" };
  }

  // Resolve location name from venue if selected
  let resolvedLocation = locationName;
  if (venueId && !locationName) {
    const { data: venue } = await supabase
      .from("venues")
      .select("name")
      .eq("id", venueId)
      .single();
    resolvedLocation = venue?.name ?? "Cancha";
  }

  if (!resolvedLocation && !venueId) {
    return { error: "Seleccioná una cancha o escribí el nombre" };
  }

  const { error } = await supabase.from("matches").insert({
    creator_id: user.id,
    type: type as "busco_rival" | "busco_jugador",
    sport: sport as "padel" | "futbol",
    location_name: resolvedLocation || "Cancha",
    venue_id: venueId || null,
    football_type: (sport === "futbol" && footballType) ? footballType as "5"|"7"|"8"|"9"|"11" : null,
    scheduled_at: new Date(scheduledAt).toISOString(),
    min_age: minAge ? parseInt(minAge) : null,
    max_age: maxAge ? parseInt(maxAge) : null,
    team_id: teamId || null,
    price_per_person: pricePerPerson ? parseInt(pricePerPerson) : null,
    is_paid: isPaid,
    skill_level: skillLevel,
    slots_needed: slotsNeeded,
  });

  if (error) return { error: error.message };
  return { success: true };
}
