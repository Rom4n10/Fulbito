"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createMatch(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

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

  if (!type || !sport || !scheduledAt) {
    return { error: "Completá todos los campos obligatorios" };
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
  });

  if (error) return { error: error.message };
  redirect("/");
}
