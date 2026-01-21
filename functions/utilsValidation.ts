// @ts-nocheck
/**
 * UTILS VALIDATION - Basado en Esquema Argentina para Meta
 * Propósito: Normalizar el teléfono sin interrumpir al usuario.
 */

export const normalizeArgentinaPhone = (phone) => {
  if (!phone) return null;

  // 1. Quitar todo lo que no sea número
  let cleaned = phone.toString().replace(/\D/g, '');

  // 2. Si empieza con 0, quitarlo (ej: 011 -> 11)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // 3. Lógica para Argentina: Meta espera +54 9 + código área + número
  // Si ya tiene el 54, nos aseguramos que tenga el 9.
  if (cleaned.startsWith('54')) {
    if (!cleaned.startsWith('549')) {
      cleaned = '549' + cleaned.substring(2);
    }
  } else {
    // Si no tiene el 54, se lo agregamos junto con el 9
    cleaned = '549' + cleaned;
  }

  return cleaned; // Ejemplo: "11 55443322" -> "5491155443322"
};