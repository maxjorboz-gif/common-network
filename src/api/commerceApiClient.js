import { appParams } from '@/lib/app-params';

/**
 * CLIENTE AUTENTICADO PARA COMERCIOS
 * =========================================================================
 * ESTE ES EL ÚNICO MECANISMO AUTORIZADO PARA LLAMADAS DESDE EL PANEL DE COMERCIO.
 * 
 * ❌ PROHIBIDO usar fetch() directo en componentes del panel.
 * ✅ OBLIGATORIO usar commerceClient.post(), .get(), etc.
 * 
 * Propósito:
 * - Centralizar la inyección del Token JWT de Comercio.
 * - Manejar URLs de Base44 Functions de forma transparente.
 * - Gestionar errores 401 (Logout) de forma global.
 */

const { appId } = appParams;
const BASE_URL = `/api/apps/${appId}/functions`;

// Helper para headers
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };

    // INYECCIÓN AUTOMÁTICA DE TOKEN
    const token = localStorage.getItem('commerce_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Manejo centralizado de respuestas
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // MANEJO DE ERROR GLOBAL 401 (NO AUTORIZADO)
        if (response.status === 401 || response.status === 403) {
            // Check si no estamos ya en login para evitar loop de recargas
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/ingreso')) {
                console.warn('[CommerceClient] Sesión expirada o inválida. Logout forzoso.');
                // Disparamos evento custom para que AuthContext (o quien escuche) limpie el estado
                // O limpiamos y recargamos si es crítico
                localStorage.removeItem('commerce_token');
                localStorage.removeItem('commerce_data');
                // Opcional: window.location.href = '/'; 
                // Dejaremos que el componente maneje el error, pero el token ya murió.
            }
        }

        const errorMessage = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    return data;
};

// Cliente Principal
export const commerceClient = {
    /**
     * Llama a una función backend por nombre (ej: 'obtenerDatosComercio')
     */
    post: async (functionName, body = {}) => {
        const url = `${BASE_URL}/${functionName}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error(`[CommerceClient] Error en ${functionName}:`, error);
            throw error;
        }
    },

    get: async (functionName, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/${functionName}?${query}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error(`[CommerceClient] Error en ${functionName}:`, error);
            throw error;
        }
    }

    // Agregar put/del si fueran necesarios, pero Functions usa mayormente POST RPC.
};
