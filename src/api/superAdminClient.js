import { appParams } from '@/lib/app-params';

/**
 * CLIENTE AUTENTICADO PARA SUPER ADMIN
 * =========================================================================
 * Mecanismo exclusivo para el panel de Super Admin.
 * Inyecta el token 'super_admin_token'.
 */

const { appId } = appParams;
const BASE_URL = `/api/apps/${appId}/functions`;

const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('super_admin_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            console.warn('[SuperAdminClient] Sesión expirada. Logout forzoso.');
            localStorage.removeItem('super_admin_token');
            // window.location.href = '/admin-login'; // Optional redirect
        }
        const errorMessage = data.error || data.message || `Error ${response.status}`;
        throw new Error(errorMessage);
    }
    return data;
};

export const superAdminClient = {
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
    }
};
