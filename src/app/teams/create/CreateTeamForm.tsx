"use client";

import { createTeam } from "@/app/actions/teams";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useState } from "react";
import type { Tables } from "@/types/database";
import { toast } from "react-hot-toast";

interface CreateTeamFormProps {
  departments: Tables<"departments">[];
}

export default function CreateTeamForm({ departments }: CreateTeamFormProps) {
  const [logoError, setLogoError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("La imagen del logo es demasiado pesada (máx 2MB). Seleccioná una imagen más liviana.");
      e.target.value = ""; // Limpiar selección
      setLogoError(true);
    } else {
      setLogoError(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 2 * 1024 * 1024) {
      toast.error("Por favor, selecciona una imagen de logo de menos de 2MB.");
      return;
    }

    const result = await createTeam(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Equipo creado con éxito!");
    }
  }

  return (
    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Nombre del equipo *
        </label>
        <input name="name" className="glass-input" placeholder="Los Cracks del Barrio" required minLength={2} />
      </div>

      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Departamento
        </label>
        <select name="department_id" className="glass-input">
          <option value="">Sin departamento</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
          Logo (opcional)
        </label>
        <input
          name="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="glass-input"
          style={{ padding: "10px" }}
        />
        <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
          JPG, PNG o WebP. Máx 2MB.
        </p>
      </div>

      <SubmitButton variant="primary" size="lg" style={{ marginTop: "8px" }}>
        Crear equipo
      </SubmitButton>
    </form>
  );
}
