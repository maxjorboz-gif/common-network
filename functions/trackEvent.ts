// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const APP_ID = "6967728aba18db08a32d56fd";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/TrackingEvent`;
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

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

        if (!commonnet_client_id || !event_name) {
            return Response.json({ error: 'Missing required tracking fields' }, { status: 400 });
        }

        // Obtener User Agent e IP Headers
        const user_agent = req.headers.get('user-agent') || 'unknown';
        const ip = req.headers.get('x-forwarded-for') || 'unknown'; // Simple hash simulation or raw

        // Hashear IP para privacidad (simple simulation aquí, idealmente usar crypto real)
        let ip_hash = 'unknown';
        if (ip !== 'unknown') {
            // Simple hash for demo purposes as we don't have crypto lib imported
            ip_hash = btoa(ip).substring(0, 20);
        }

        const trackingEntry = {
            commonnet_client_id,
            tenant_id,
            commerce_code,
            session_id,
            event_type,
            event_name,
            entity_type,
            entity_id,
            payload: {
                ...payload,
                url,
                referrer
            },
            user_agent,
            ip_hash,
            created_at: new Date().toISOString()
        };

        // Insertar en Base44 Entity TrackingEvent
        // Usamos fetch directo para no depender de librerías internas
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
            // No fallamos la request al cliente para no bloquear, solo logueamos
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error('Tracking Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
