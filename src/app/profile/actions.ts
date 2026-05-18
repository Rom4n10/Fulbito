"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const phoneNumber = formData.get("phone_number") as string;
  const birthDate = formData.get("birth_date") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const departmentId = formData.get("department_id") as string;
  const isFreeAgent = formData.get("is_free_agent") === "true";
  const preferredSport = formData.get("preferred_sport") as string;
  const preferredFootballPosition = formData.get("preferred_football_position") as string;
  const preferredPadelPosition = formData.get("preferred_padel_position") as string;

  const { error } = await supabase
    .from("users")
    .update({
      phone_number: phoneNumber || null,
      birth_date: birthDate || null,
      first_name: firstName || undefined,
      last_name: lastName || null,
      department_id: departmentId ? parseInt(departmentId) : null,
      province_id: departmentId ? 1 : null, // Mendoza is province 1
      is_free_agent: isFreeAgent,
      preferred_sport: (preferredSport as "futbol" | "padel") || null,
      preferred_football_position: (preferredFootballPosition as "arquero" | "defensa" | "mediocampista" | "delantero") || null,
      preferred_padel_position: (preferredPadelPosition as "drive" | "reves") || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const file = formData.get("avatar") as File;
  if (!file) return { error: "No se seleccionó archivo" };

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Add cache-busting param
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  // Update user record
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/profile");
  return { success: true, url: avatarUrl };
}
