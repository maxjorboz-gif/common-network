// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { base44 } from '@/api/base44Client';

const CLIENT_ID_KEY = 'commonnet_client_id';

// 1. Obtener o Generar ID
export const getClientId = () => {
    let clientId = localStorage.getItem(CLIENT_ID_KEY);
    if (!clientId) {
        clientId = uuidv4();
        localStorage.setItem(CLIENT_ID_KEY, clientId);
    }
    return clientId;
};

// 2. Función Helper para Trackear
export const trackEvent = async (eventData) => {
    try {
        const payload = {
            commonnet_client_id: getClientId(),
            tenant_id: null, // Dejamos que lo maneje el contexto o se pase explícitamente si se tiene
            id_comercio: null, // Ídem
            event_type: eventData.event_type || 'unknown',
            event_name: eventData.event_name || 'unknown_event',
            entity_type: eventData.entity_type || null,
            entity_id: eventData.entity_id || null,
            payload: eventData.payload || {},
            url: window.location.href,
            referrer: document.referrer,
            ...eventData // Merge directo para sobreescribir tenant/commerce si vienen
        };

        // Enviar al backend (Fire and Forget)
        base44.functions.invoke('trackEvent', payload).catch(err => {
            console.error('[Tracking] Error sending event:', err);
        });

    } catch (error) {
        console.error('[Tracking] Critical error:', error);
    }
};
