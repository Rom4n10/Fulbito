"use client";

import { useState, useRef } from "react";
import { updateProfile, uploadAvatar } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getInitials } from "@/lib/utils";
import type { Tables } from "@/types/database";
import type { Enums } from "@/types/database";
import { toast } from "react-hot-toast";

interface ProfileFormProps {
  profile: Tables<"users">;
  departments: Tables<"departments">[];
}

export function ProfileForm({ profile, departments }: ProfileFormProps) {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isFreeAgent, setIsFreeAgent] = useState(profile.is_free_agent ?? false);
  const [preferredSport, setPreferredSport] = useState<Enums<"match_sport"> | "">(profile.preferred_sport ?? "");

  async function handleSubmit(formData: FormData) {
    const result = await updateProfile(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil actualizado correctamente");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen del avatar no puede superar los 2MB");
      return;
    }

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);
    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      setAvatarUrl(result.url);
      toast.success("Foto actualizada");
    }
    setAvatarLoading(false);
  }

  return (
    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Avatar Upload */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
          <div className="avatar avatar-lg" style={{
            width: "80px", height: "80px", fontSize: "1.5rem",
            border: avatarLoading ? "3px solid var(--color-primary)" : "3px solid var(--glass-border)",
            transition: "border-color var(--transition-base)",
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Tu avatar" style={{ opacity: avatarLoading ? 0.5 : 1 }} />
            ) : (
              getInitials(profile.first_name, profile.last_name)
            )}
          </div>
          <span style={{
            position: "absolute", bottom: "-4px", right: "-4px",
            width: "28px", height: "28px", borderRadius: "50%",
            background: "var(--color-primary)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            📷
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Nombre
          </label>
          <input name="first_name" defaultValue={profile.first_name} className="glass-input" placeholder="Tu nombre" required />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Apellido
          </label>
          <input name="last_name" defaultValue={profile.last_name ?? ""} className="glass-input" placeholder="Tu apellido" />
        </div>
      </div>

      {/* Department (cascading location) */}
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Departamento (Mendoza)
        </label>
        <select name="department_id" defaultValue={profile.department_id ?? ""} className="glass-input">
          <option value="">Seleccionar departamento</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Teléfono (con código de país, sin espacios ni guiones)
        </label>
        <input name="phone_number" defaultValue={profile.phone_number ?? ""} className="glass-input" placeholder="Ej: +5492615551234" type="tel" />
        <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
          <strong>Importante para Argentina:</strong> Usá <code>+549</code> seguido del código de área sin el 0 y el número sin el 15. Ej: para el celular 261 15-555-1234, escribí <code>+5492615551234</code>.
        </p>
        <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
          Requerido para coordinar por WhatsApp. Solo se comparte con jugadores confirmados en tus partidos.
        </p>
      </div>

      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Fecha de nacimiento
        </label>
        <input name="birth_date" defaultValue={profile.birth_date ?? ""} className="glass-input" type="date" style={{ colorScheme: "dark" }} />
        <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Se usa para calcular tu edad y mostrarla en tu perfil y postulaciones.
        </p>
      </div>

      {/* Free Agent Section */}
      <div style={{
        padding: "16px", borderRadius: "var(--border-radius-sm)",
        background: isFreeAgent ? "rgba(16, 185, 129, 0.1)" : "var(--glass-bg)",
        border: `1px solid ${isFreeAgent ? "rgba(16, 185, 129, 0.3)" : "var(--glass-border)"}`,
        transition: "all var(--transition-base)",
      }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>🟢 Agente Libre</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
              Aparecer en el mercado de pases
            </p>
          </div>
          <input
            type="checkbox"
            checked={isFreeAgent}
            onChange={(e) => setIsFreeAgent(e.target.checked)}
            style={{ width: "20px", height: "20px", accentColor: "var(--color-accent-green)" }}
          />
          <input type="hidden" name="is_free_agent" value={isFreeAgent ? "true" : "false"} />
        </label>

        {isFreeAgent && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Deporte preferido
              </label>
              <select
                name="preferred_sport" className="glass-input"
                value={preferredSport}
                onChange={(e) => setPreferredSport(e.target.value as Enums<"match_sport"> | "")}
              >
                <option value="">Sin preferencia</option>
                <option value="futbol">⚽ Fútbol</option>
                <option value="padel">🎾 Pádel</option>
              </select>
            </div>

            {preferredSport === "futbol" && (
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Posición
                </label>
                <select name="preferred_football_position" className="glass-input" defaultValue={profile.preferred_football_position ?? ""}>
                  <option value="">Sin especificar</option>
                  <option value="arquero">🧤 Arquero</option>
                  <option value="defensa">🛡️ Defensa</option>
                  <option value="mediocampista">🎯 Mediocampista</option>
                  <option value="delantero">⚡ Delantero</option>
                </select>
              </div>
            )}

            {preferredSport === "padel" && (
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Posición
                </label>
                <select name="preferred_padel_position" className="glass-input" defaultValue={profile.preferred_padel_position ?? ""}>
                  <option value="">Sin especificar</option>
                  <option value="drive">💪 Drive (Derecha)</option>
                  <option value="reves">🎾 Revés (Izquierda)</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      <SubmitButton variant="primary" style={{ marginTop: "8px" }}>
        Guardar cambios
      </SubmitButton>
    </form>
  );
}
