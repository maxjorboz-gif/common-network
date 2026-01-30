// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

/**
 * Middleware withAuth (Refactorizado DB-First)
 * Verifica el Token Custom de Comercio y valida contra la tabla Comercio.
 */
export async function withAuth(req, handler, requiredRole) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: 'No autorizado: Token requerido' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // 1. DECODIFICAR TOKEN (Formato: commerce_code:random:timestamp en Base64)
        let commerceCode = null;
        try {
            const decoded = atob(token);
            const parts = decoded.split(":");
            if (parts.length < 3) throw new Error("Token malformado");
            commerceCode = parts[0];
        } catch (e) {
            return Response.json({ error: 'Token inválido' }, { status: 403 });
        }

        if (!commerceCode) {
            return Response.json({ error: 'Token inválido: Sin código de comercio' }, { status: 403 });
        }

        // 2. VALIDAR CONTRA BASE DE DATOS (Single Source of Truth)
        const queryUrl = `${URL_COMERCIO}?commerce_code=${encodeURIComponent(commerceCode)}`;
        const dbResponse = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!dbResponse.ok) {
            return Response.json({ error: 'Error al validar sesión' }, { status: 500 });
        }

        const resultados = await dbResponse.json();
        const comercio = Array.isArray(resultados) ? resultados[0] : null;

        if (!comercio) {
            return Response.json({ error: 'Sesión inválida: Comercio no encontrado' }, { status: 401 });
        }

        if (comercio.activo === false) { // Chequeo explícito de suspensión
            return Response.json({ error: 'Cuenta suspendida o inactiva' }, { status: 403 });
        }

        // 3. CONSTRUIR CONTEXTO DE EJECUCIÓN
        const context = {
            user: {
                id: comercio.user_id || 'legacy_no_id',
                email: comercio.email_negocio,
                role: 'admin_comercio', // Rol fijo por ahora
                commerceCode: comercio.commerce_code
            },
            tenant: {
                commerceCode: comercio.commerce_code,
                id: comercio.id || comercio._id,
                status: comercio.estado_registro
            }
        };

        // 4. EJECUTAR HANDLER
        return await handler(context, req);

    } catch (error) {
        console.error("Middleware withAuth Error:", error);
        return Response.json({ error: 'Error interno de seguridad' }, { status: 500 });
    }
}

