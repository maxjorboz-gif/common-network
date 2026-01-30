// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
// Se cambia de SaaS_Events a Logs_Configuracion según el mapeo de entidades disponibles
const URL_LOGS = `https://app.base44.com/api/apps/${APP_ID}/entities/Logs_Configuracion`;

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
    commerceCode?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

/**
 * Helper Centralizado para Tracking (Refactorizado sin SDK)
 * Registra eventos de sistema en la entidad Logs_Configuracion.
 */
export async function trackEvent(
    type: AnalyticsEventType,
    data: EventData
) {
    try {
        const payload = {
            tipo_evento: type, // Adaptamos campos a una estructura de log genérica
            commerce_code: data.commerceCode || null,
            user_id: data.userId || null,
            detalles: data.metadata || {},
            fecha: new Date().toISOString()
        };

        const response = await fetch(URL_LOGS, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`[ANALYTICS] Base44 Error: ${errorText}`);
        } else {
            console.log(`[ANALYTICS] Tracked: ${type} for commerce ${data.commerceCode}`);
        }

    } catch (error) {
        // Fallos en analítica NO deben romper la ejecución principal
        console.warn(`[ANALYTICS] Failed to track ${type}:`, error.message);
    }
}
