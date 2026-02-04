import { appParams } from '@/lib/app-params';

/**
 * CLIENTE AUTENTICADO PARA SUPER ADMIN
 * =========================================================================
 * ESTE ES EL ÚNICO MECANISMO AUTORIZADO PARA LLAMADAS DESDE EL PANEL DE SUPER ADMIN.
 * 
 * ❌ PROHIBIDO usar fetch() directo en componentes del panel de super admin.
 * ✅ OBLIGATORIO usar superAdminClient.post(), .get(), etc.
 * 
 * Propósito:
 * - Centralizar la inyección del Token JWT de Super Admin.
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

    // INYECCIÓN AUTOMÁTICA DE TOKEN DE SUPER ADMIN
    const token = localStorage.getItem('superadmin_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Manejo centralizado de respuestas
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // MANEJO DE ERROR GLOBAL 401/403 (NO AUTORIZADO)
        if (response.status === 401 || response.status === 403) {
            // Check si no estamos ya en login para evitar loop de recargas
            if (!window.location.pathname.includes('/admin-login')) {
                console.warn('[SuperAdminClient] Sesión expirada o inválida. Logout forzoso.');
                // Limpiar tokens y datos
                localStorage.removeItem('superadmin_token');
                localStorage.removeItem('superadmin_data');
                // Redirigir a login de super admin
                window.location.href = '/admin-login';
            }
        }

        const errorMessage = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    return data;
};

// Cliente Principal
export const superAdminClient = {
    /**
     * Llama a una función backend por nombre (ej: 'obtenerTodosComercios')
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
            console.error(`[SuperAdminClient] Error en ${functionName}:`, error);
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
            console.error(`[SuperAdminClient] Error en ${functionName}:`, error);
            throw error;
        }
    },

    /**
     * Helper para obtener el token actual
     */
    getToken: () => {
        return localStorage.getItem('superadmin_token');
    },

    /**
     * Helper para verificar si hay sesión activa
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('superadmin_token');
    }
};
