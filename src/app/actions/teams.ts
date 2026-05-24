"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTeam(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const name = formData.get("name") as string;
  const departmentId = formData.get("department_id") as string;

  if (!name || name.trim().length < 2) {
    return { error: "El nombre del equipo debe tener al menos 2 caracteres" };
  }

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: name.trim(),
      founder_id: user.id,
      department_id: departmentId ? Number(departmentId) : null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add founder as captain
  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "capitan",
  });

  // Handle logo upload
  const logo = formData.get("logo") as File | null;
  if (logo && logo.size > 0) {
    const ext = logo.name.split(".").pop();
    const filePath = `${team.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("team_logos")
      .upload(filePath, logo, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("team_logos").getPublicUrl(filePath);
      await supabase.from("teams").update({ logo_url: urlData.publicUrl }).eq("id", team.id);
    }
  }

  return { success: true, teamId: team.id };
}

export async function updateTeam(teamId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verify founder
  const { data: team } = await supabase.from("teams").select("founder_id").eq("id", teamId).single();
  if (!team || team.founder_id !== user.id) return { error: "No tenés permisos" };

  const name = formData.get("name") as string;
  const departmentId = formData.get("department_id") as string;

  await supabase.from("teams").update({
    name: name.trim(),
    department_id: departmentId ? Number(departmentId) : null,
  }).eq("id", teamId);

  // Handle logo upload
  const logo = formData.get("logo") as File | null;
  if (logo && logo.size > 0) {
    const ext = logo.name.split(".").pop();
    const filePath = `${teamId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("team_logos")
      .upload(filePath, logo, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("team_logos").getPublicUrl(filePath);
      await supabase.from("teams").update({ logo_url: urlData.publicUrl }).eq("id", teamId);
    }
  }

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function addMember(teamId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Check permission (founder or captain)
  const { data: team } = await supabase.from("teams").select("founder_id").eq("id", teamId).single();
  const isFounder = team?.founder_id === user.id;

  if (!isFounder) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "capitan") {
      return { error: "No tenés permisos para agregar miembros" };
    }
  }

  // Check if already member
  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return { error: "Ya es miembro del equipo" };

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: userId,
    role: "jugador",
  });

  if (error) return { error: error.message };

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function removeMember(teamId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function searchUsers(query: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("id, first_name, last_name, avatar_url")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(10);

  return data ?? [];
}

export async function getTeams(query?: string) {
  const supabase = await createClient();
  let q = supabase.from("teams").select("*, department:departments(name), team_members(user_id)");

  if (query && query.trim() !== "") {
    q = q.ilike("name", `%${query.trim()}%`);
  }

  const { data, error } = await q.limit(50);
  if (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
  return data ?? [];
}

export async function getMyTeams() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get teams where user is a member or founder
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      department:departments(name),
      team_members!inner(user_id, role)
    `)
    .eq("team_members.user_id", user.id);

  if (error) {
    console.error("Error fetching my teams:", error);
    return [];
  }
  return data ?? [];
}

export async function challengeTeam(challengerTeamId: string, challengedTeamId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  if (challengerTeamId === challengedTeamId) {
    return { error: "No te podés desafiar a tu propio equipo" };
  }

  // Verify the user is indeed a member of the challenger team
  const { data: membership } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", challengerTeamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "No sos miembro del equipo desafiante" };
  }

  // Check if a pending challenge already exists between these teams
  const { data: existingChallenge } = await supabase
    .from("team_challenges")
    .select("id")
    .eq("challenger_id", challengerTeamId)
    .eq("challenged_id", challengedTeamId)
    .eq("status", "pendiente")
    .maybeSingle();

  if (existingChallenge) {
    return { error: "Ya existe un desafío pendiente con este equipo" };
  }

  const { error } = await supabase
    .from("team_challenges")
    .insert({
      challenger_id: challengerTeamId,
      challenged_id: challengedTeamId,
      message: message.trim() || null,
      status: "pendiente"
    });

  if (error) {
    console.error("Error sending team challenge:", error);
    return { error: error.message };
  }

  revalidatePath(`/teams/${challengedTeamId}`);
  revalidatePath(`/teams/${challengerTeamId}`);
  return { success: true };
}

export async function updateChallengeStatus(challengeId: string, status: "aceptado" | "rechazado") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: challenge, error: fetchError } = await supabase
    .from("team_challenges")
    .select("*, challenger:teams!team_challenges_challenger_id_fkey(name)")
    .eq("id", challengeId)
    .single();

  if (fetchError || !challenge) {
    return { error: "Desafío no encontrado" };
  }

  // Verify the user is a member of the challenged team
  const { data: membership } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", challenge.challenged_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "No sos miembro del equipo desafiado" };
  }

  const { error: updateError } = await supabase
    .from("team_challenges")
    .update({ status })
    .eq("id", challengeId);

  if (updateError) {
    console.error("Error updating challenge status:", updateError);
    return { error: updateError.message };
  }

  revalidatePath(`/teams/${challenge.challenged_id}`);
  revalidatePath(`/teams/${challenge.challenger_id}`);
  return { success: true };
}

