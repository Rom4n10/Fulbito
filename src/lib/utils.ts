/**
 * Calcula la edad de un usuario a partir de su fecha de nacimiento.
 * OBLIGATORIO: Usar esta función en toda la UI que muestre edad.
 * No recalcular la lógica localmente.
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Limpia un número de teléfono para usar en el link de WhatsApp.
 * Elimina espacios, guiones, paréntesis y el prefijo +.
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "");
}

/**
 * Genera la URL de WhatsApp con el formato definido en Contexto.txt
 */
export function getWhatsAppUrl(
  phoneNumber: string,
  sport: string,
  locationName: string
): string {
  const cleanNumber = cleanPhoneNumber(phoneNumber);
  const message = `¡Hola! Acordamos a través de la app jugar el partido de ${sport} hoy en ${locationName}.`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Formatea una fecha ISO a formato legible en español.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Obtiene las iniciales de un nombre para avatares fallback.
 */
export function getInitials(firstName: string, lastName?: string | null): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${first}${last}`;
}
