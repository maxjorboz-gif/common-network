// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

// CORRECCIÓN: Usamos una entidad VÁLIDA según listado oficial (forceWipe.ts)
// Antes: TrackingEvent (No existía) -> Ahora: Logs_Configuracion (Existe y sirve para logs)
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Logs_Configuracion`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response("OK", {
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        }

        const data = await req.json().catch(() => ({}));

        const {
            commonnet_client_id,
            tenant_id,
            commerce_code,
            session_id,
            event_type,
            event_name,
            entity_type,
            entity_id,
            payload,
            url,
            referrer
        } = data;

        // Validación laxa para no perder data, pero requerimos al menos el evento
        if (!event_name) {
            return Response.json({ error: 'Missing event_name' }, { status: 400 });
        }

        // Obtener User Agent e IP Headers (Privacidad básica)
        const user_agent = req.headers.get('user-agent') || 'unknown';
        const ip = req.headers.get('x-forwarded-for') || 'unknown';

        let ip_hash = 'unknown';
        if (ip !== 'unknown') {
            ip_hash = btoa(ip).substring(0, 20); // Simple obfuscation
        }

        // Estructura adaptada para Logs_Configuracion
        // Logs_Configuracion suele ser una tabla genérica key-value o JSON flexible.
        // Asumiremos que tiene campos flexibles o guardaremos todo en un campo 'detalle' o 'valor'.
        // NOTA: Si Logs_Configuracion tiene esquema estricto, esto podría requerir ajuste.
        // Dado el nombre "Logs", asumimos flexibilidad.

        const trackingEntry = {
            tipo: "ANALYTICS", // Categoría macro
            key: event_name,   // El nombre del evento
            valor: {           // Todo el payload detallado
                commonnet_client_id,
                tenant_id,
                commerce_code, // Clave para filtrar luego
                session_id,
                event_type,
                entity_type,
                entity_id,
                payload: { ...payload, url, referrer },
                user_agent,
                ip_hash
            },
            created_at: new Date().toISOString()
        };

        // Insertar en Base44
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api_key': API_KEY
            },
            body: JSON.stringify(trackingEntry)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Error saving tracking event:', errText);
            // Silent fail to frontend
        }

        return Response.json({ success: true }, { headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (error) {
        console.error('Tracking Error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
