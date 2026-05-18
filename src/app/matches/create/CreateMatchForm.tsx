"use client";

import { createMatch } from "./actions";
import { GlassCard } from "@/components/ui/GlassCard";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useState, useEffect } from "react";
import type { Tables } from "@/types/database";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { toast } from "react-hot-toast";

interface CreateMatchFormProps {
  departments: Tables<"departments">[];
  venues: Tables<"venues">[];
  teams: Tables<"teams">[];
}

export default function CreateMatchPage({ departments, venues, teams }: CreateMatchFormProps) {
  const [sport, setSport] = useState<"futbol" | "padel">("futbol");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [useCustomVenue, setUseCustomVenue] = useState(false);

  const filteredVenues = venues.filter(
    (v) => (v.sport === sport || v.sport === null) && (departmentId === "" || v.department_id === Number(departmentId))
  );

  async function handleSubmit(formData: FormData) {
    const result = await createMatch(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Partido publicado con éxito!");
    }
  }

  return (
    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Type */}
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          ¿Qué buscás?
        </label>
        <select name="type" className="glass-input" required>
          <option value="busco_rival">Busco rival</option>
          <option value="busco_jugador">Busco jugador</option>
        </select>
      </div>

      {/* Sport */}
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Deporte
        </label>
        <select name="sport" className="glass-input" required
          value={sport} onChange={(e) => setSport(e.target.value as "futbol" | "padel")}>
          <option value="futbol">⚽ Fútbol</option>
          <option value="padel">🎾 Pádel</option>
        </select>
      </div>

      {/* Football Type (conditional) */}
      {sport === "futbol" && (
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Tipo de fútbol
          </label>
          <select name="football_type" className="glass-input">
            <option value="">Sin especificar</option>
            <option value="5">Fútbol 5</option>
            <option value="7">Fútbol 7</option>
            <option value="8">Fútbol 8</option>
            <option value="9">Fútbol 9</option>
            <option value="11">Fútbol 11</option>
          </select>
        </div>
      )}

      {/* Team Selection */}
      {teams.length > 0 && (
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            ¿Jugás con tu equipo? (opcional)
          </label>
          <select name="team_id" className="glass-input">
            <option value="">Sin equipo (mix / amigos)</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Department */}
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Departamento
        </label>
        <select className="glass-input" value={departmentId}
          onChange={(e) => { setDepartmentId(e.target.value); setUseCustomVenue(false); }}>
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Venue */}
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Cancha
        </label>
        {!useCustomVenue ? (
          <>
            <select name="venue_id" className="glass-input">
              <option value="">Seleccionar cancha</option>
              {filteredVenues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}{v.address ? ` — ${v.address}` : ""}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setUseCustomVenue(true)}
              style={{ background: "none", border: "none", color: "var(--color-primary-light)", fontSize: "0.8rem", cursor: "pointer", marginTop: "6px", padding: 0 }}>
              + Otra cancha
            </button>
          </>
        ) : (
          <>
            <input name="location_name" className="glass-input" placeholder="Nombre de la cancha" required />
            <button type="button" onClick={() => setUseCustomVenue(false)}
              style={{ background: "none", border: "none", color: "var(--color-primary-light)", fontSize: "0.8rem", cursor: "pointer", marginTop: "6px", padding: 0 }}>
              ← Elegir de la lista
            </button>
          </>
        )}
      </div>

      {/* Date */}
      <div>
        <DateTimePicker name="scheduled_at" required />
      </div>

      {/* Age Range */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Edad mín. (opcional)
          </label>
          <input name="min_age" type="number" min="14" max="70" className="glass-input" placeholder="18" />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Edad máx. (opcional)
          </label>
          <input name="max_age" type="number" min="14" max="70" className="glass-input" placeholder="40" />
        </div>
      </div>

      {/* Price & Paid Status */}
      <div style={{
        padding: "16px", borderRadius: "var(--border-radius-sm)",
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
      }}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Precio por persona ($)
          </label>
          <input name="price_per_person" type="number" min="0" step="100" className="glass-input" placeholder="Ej: 3500" />
        </div>

        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>Cancha señada</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
              Indicá si ya pagaste la seña
            </p>
          </div>
          <input
            name="is_paid"
            type="checkbox"
            value="true"
            style={{ width: "20px", height: "20px", accentColor: "var(--color-accent-green)" }}
          />
        </label>
      </div>

      <SubmitButton variant="primary" size="lg" style={{ marginTop: "8px" }}>
        Publicar partido
      </SubmitButton>
    </form>
  );
}
