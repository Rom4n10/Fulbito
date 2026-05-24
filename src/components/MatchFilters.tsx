"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Tables } from "@/types/database";

interface MatchFiltersProps {
  departments: { id: number; name: string }[];
}

export function MatchFilters({ departments }: MatchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSport = searchParams.get("sport") ?? "";
  const currentDepto = searchParams.get("depto") ?? "";

  function handleSportChange(sport: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "partidos");
    if (sport) {
      params.set("sport", sport);
    } else {
      params.delete("sport");
    }
    router.push(`/?${params.toString()}`);
  }

  function handleDeptoChange(deptoId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "partidos");
    if (deptoId) {
      params.set("depto", deptoId);
    } else {
      params.delete("depto");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
      {/* Sport Selector buttons */}
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          type="button"
          onClick={() => handleSportChange("")}
          className={`badge ${!currentSport ? "badge-futbol" : ""}`}
          style={{ border: "none", cursor: "pointer", fontSize: "0.8rem", padding: "6px 12px" }}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => handleSportChange("futbol")}
          className={`badge ${currentSport === "futbol" ? "badge-futbol" : ""}`}
          style={{ border: "none", cursor: "pointer", fontSize: "0.8rem", padding: "6px 12px" }}
        >
          ⚽ Fútbol
        </button>
        <button
          type="button"
          onClick={() => handleSportChange("padel")}
          className={`badge ${currentSport === "padel" ? "badge-futbol" : ""}`}
          style={{ border: "none", cursor: "pointer", fontSize: "0.8rem", padding: "6px 12px" }}
        >
          🎾 Pádel
        </button>
      </div>

      {/* Mendoza Department Dropdown filter */}
      <div style={{ flex: 1, minWidth: "160px" }}>
        <select
          className="glass-input"
          style={{
            padding: "6px 12px",
            fontSize: "0.8rem",
            height: "auto",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            width: "100%",
            color: "var(--text-primary)"
          }}
          value={currentDepto}
          onChange={(e) => handleDeptoChange(e.target.value)}
        >
          <option value="">📍 Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
