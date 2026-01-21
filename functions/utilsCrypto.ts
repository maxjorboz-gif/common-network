// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * UTILS CRYPTO - Basado en Leyes de Meta y Privacidad
 * Paso 1 de la hoja de ruta establecida.
 */

// 1. SHA256 Hash Infalible
export const sha256Hash = async (string) => {
  if (!string) return null;
  const utf8 = new TextEncoder().encode(string.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// 2. Generador de event_id Único
// 2. Generador de event_id Único (Flexible)
export const generateEventId = (prefix = 'event', uniqueId = '') => {
  return `${prefix}_${uniqueId || Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
};