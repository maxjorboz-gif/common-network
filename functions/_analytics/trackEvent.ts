// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// Event Types for Strict Typing
export type AnalyticsEventType =
    | 'tenant_created'
    | 'subscription_started'
    | 'subscription_canceled'
    | 'payment_failed'
    | 'tenant_suspended'
    | 'product_created'
    | 'order_created'
    | 'login_success';

interface EventData {
    commerceCode?: string; // Was tenantId
    userId?: string;
    metadata?: Record<string, any>;
}

// Helper Centralizado para Tracking (Non-blocking)
export async function trackEvent(
    type: AnalyticsEventType,
    data: EventData,
    base44Client?: any
) {
    // Si no pases cliente, creamos uno al vuelo.
    // Usamos ANON KEY por defecto para no romper si falta la Service Key.
    const client = base44Client || createClient(
        Deno.env.get("BASE44_API_URL") ?? "",
        Deno.env.get("BASE44_ANON_KEY") ?? ""
    );

    try {

        // Intentamos escribir. Si la tabla tiene RLS, esto puede fallar si no es el usuario dueño.
        // Pero para 'tenant_created', probablemente tengamos sesión o sea pública.
        await client.entities.SaaS_Events.create({
            type: type,
            tenant_id: data.commerceCode || null,
            user_id: data.userId || null,
            metadata: data.metadata || {},
            created_at: new Date().toISOString()
        });

        console.log(`[ANALYTICS] Tracked: ${type} for commerce ${data.commerceCode}`);

    } catch (error) {
        // Fallos en analítica NO deben romper la app
        console.warn(`[ANALYTICS] Failed to track ${type}:`, error.message);
    }
}

