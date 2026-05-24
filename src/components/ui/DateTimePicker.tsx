"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronDown } from "lucide-react";

interface DateTimePickerProps {
  name: string;
  required?: boolean;
}

export function DateTimePicker({ name, required = false }: DateTimePickerProps) {
  const [selectedTab, setSelectedTab] = useState<"hoy" | "manana" | "otro">("hoy");
  const [customDate, setCustomDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [customTime, setCustomTime] = useState("");
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [value, setValue] = useState("");
  const [isPastWarning, setIsPastWarning] = useState(false);

  const quickTimes = ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

  useEffect(() => {
    let dateStr = "";
    const today = new Date();

    if (selectedTab === "hoy") {
      dateStr = today.toISOString().split("T")[0];
    } else if (selectedTab === "manana") {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      dateStr = tomorrow.toISOString().split("T")[0];
    } else {
      dateStr = customDate;
    }

    const timeStr = showCustomTime ? customTime : selectedTime;

    if (dateStr && timeStr) {
      // Create local ISO-like string: YYYY-MM-DDTHH:MM
      const combined = `${dateStr}T${timeStr}`;
      setValue(combined);

      // Check if it's in the past
      const selectedDateObj = new Date(combined);
      setIsPastWarning(selectedDateObj <= today);
    } else {
      setValue("");
      setIsPastWarning(false);
    }
  }, [selectedTab, customDate, selectedTime, customTime, showCustomTime]);

  // Set initial default date and time (UX optimization for future dates)
  useEffect(() => {
    const today = new Date();
    const currentHour = today.getHours();
    setCustomDate(today.toISOString().split("T")[0]);

    if (currentHour >= 22) {
      // If late, default to tomorrow at 20:00
      setSelectedTab("manana");
      setSelectedTime("20:00");
      setCustomTime("20:00");
    } else {
      setSelectedTab("hoy");
      // Find first quick time at least 1 hour in the future
      const futureQuickTime = quickTimes.find((t) => {
        const [h] = t.split(":").map(Number);
        return h > currentHour + 1;
      });
      const defaultTime = futureQuickTime || "20:00";
      setSelectedTime(defaultTime);
      setCustomTime(defaultTime);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Date Selection */}
      <div>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={14} className="text-gradient" /> Fecha
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setSelectedTab("hoy")}
            style={{
              padding: "10px",
              borderRadius: "var(--border-radius-sm)",
              border: "1px solid " + (selectedTab === "hoy" ? "var(--color-primary)" : "var(--glass-border)"),
              background: selectedTab === "hoy" ? "rgba(99, 102, 241, 0.15)" : "var(--glass-bg)",
              color: selectedTab === "hoy" ? "var(--color-primary-light)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("manana")}
            style={{
              padding: "10px",
              borderRadius: "var(--border-radius-sm)",
              border: "1px solid " + (selectedTab === "manana" ? "var(--color-primary)" : "var(--glass-border)"),
              background: selectedTab === "manana" ? "rgba(99, 102, 241, 0.15)" : "var(--glass-bg)",
              color: selectedTab === "manana" ? "var(--color-primary-light)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Mañana
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("otro")}
            style={{
              padding: "10px",
              borderRadius: "var(--border-radius-sm)",
              border: "1px solid " + (selectedTab === "otro" ? "var(--color-primary)" : "var(--glass-border)"),
              background: selectedTab === "otro" ? "rgba(99, 102, 241, 0.15)" : "var(--glass-bg)",
              color: selectedTab === "otro" ? "var(--color-primary-light)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Elegir...
          </button>
        </div>

        {selectedTab === "otro" && (
          <div style={{ marginTop: "8px" }} className="animate-fade-in">
            <input
              type="date"
              className="glass-input"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              required={required && selectedTab === "otro"}
              style={{ colorScheme: "dark" }}
            />
          </div>
        )}
      </div>

      {/* Time Selection */}
      <div>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={14} className="text-gradient" /> Hora
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "8px" }}>
          {quickTimes.map((t) => {
            const isSelected = !showCustomTime && selectedTime === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSelectedTime(t);
                  setShowCustomTime(false);
                }}
                style={{
                  padding: "8px",
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid " + (isSelected ? "var(--color-primary)" : "var(--glass-border)"),
                  background: isSelected ? "rgba(99, 102, 241, 0.15)" : "var(--glass-bg)",
                  color: isSelected ? "var(--color-primary-light)" : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {t}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowCustomTime(true)}
            style={{
              padding: "8px",
              borderRadius: "var(--border-radius-sm)",
              border: "1px solid " + (showCustomTime ? "var(--color-primary)" : "var(--glass-border)"),
              background: showCustomTime ? "rgba(99, 102, 241, 0.15)" : "var(--glass-bg)",
              color: showCustomTime ? "var(--color-primary-light)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Personalizado
          </button>
        </div>

        {showCustomTime && (
          <div className="animate-fade-in">
            <input
              type="time"
              className="glass-input"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              required={required && showCustomTime}
              style={{ colorScheme: "dark" }}
            />
          </div>
        )}
      </div>

      {/* Hidden combined value input to submit with FormData */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Visual Feedback Confirmation Badge */}
      {value && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "4px",
            padding: "12px 14px",
            borderRadius: "var(--border-radius-sm)",
            background: isPastWarning ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)",
            border: isPastWarning ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(99, 102, 241, 0.2)",
            color: isPastWarning ? "var(--color-accent-red)" : "var(--color-primary-light)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem",
            fontWeight: 600,
            boxShadow: isPastWarning ? "0 4px 12px rgba(239, 68, 68, 0.05)" : "0 4px 12px rgba(99, 102, 241, 0.05)",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{isPastWarning ? "⚠️" : "📅"}</span>
          <div>
            <span style={{ color: "var(--text-secondary)", fontWeight: 400, display: "block", fontSize: "0.75rem", marginBottom: "2px" }}>
              {isPastWarning ? "ATENCIÓN: FECHA EN EL PASADO" : "CONFIRMACIÓN DE HORARIO"}
            </span>
            <span style={{ color: isPastWarning ? "var(--color-accent-red)" : "var(--text-primary)" }}>
              {(() => {
                try {
                  const [datePart, timePart] = value.split("T");
                  if (!datePart || !timePart) return "";
                  const [year, month, day] = datePart.split("-");
                  const [hours, minutes] = timePart.split(":");
                  const dateObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
                  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                  const monthsOfYear = [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                  ];
                  return `${daysOfWeek[dateObj.getDay()]} ${Number(day)} de ${monthsOfYear[dateObj.getMonth()]} a las ${hours}:${minutes} hs`;
                } catch {
                  return "Fecha seleccionada";
                }
              })()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
