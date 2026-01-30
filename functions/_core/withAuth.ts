// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_SOLICITUD = `https://app.base44.com/api/apps/${APP_ID}/entities/SolicitudComercio`;

/**
 * Middleware withAuth (Refactorizado sin SDK)
 * Verifica el JWT del usuario y resuelve su commerce_code asociado.
 */
export async function withAuth(req, handler, requiredRole) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return Response.json({ error: 'No autorizado: Falta encabezado de autorización' }, { status: 401 });
        }

        // 1. VERIFICAR USUARIO (Fetch directo a la API de Auth)
        const userResponse = await fetch('https://app.base44.com/api/auth/me', {
            headers: { 'Authorization': authHeader }
        });

        if (!userResponse.ok) {
            return Response.json({ error: 'Sesión expirada o token inválido' }, { status: 401 });
        }

        const { data: { user } } = await userResponse.json();

        if (!user) {
            return Response.json({ error: 'Usuario no encontrado' }, { status: 401 });
        }

        // 2. VALIDAR ROL
        const userRole = user.user_metadata?.role || 'merchant';

        if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
            return Response.json({ error: 'Permisos insuficientes' }, { status: 403 });
        }

        // 3. RESOLVER COMMERCE_CODE (Tenant)
        let commerceCode = user.user_metadata?.commerce_code;

        if (!commerceCode) {
            // Buscamos si tiene una solicitud aprobada vinculada
            const queryUrl = `${URL_SOLICITUD}?user_id=${user.id}`;
            const solRes = await fetch(queryUrl, {
                headers: { 'api_key': API_KEY }
            });

            if (solRes.ok) {
                const solicitudes = await solRes.json();
                if (Array.isArray(solicitudes) && solicitudes.length > 0) {
                    commerceCode = solicitudes[0].commerce_code;
                }
            }
        }

        // 4. CONSTRUIR CONTEXTO Y LLAMAR AL HANDLER
        const context = {
            user: {
                id: user.id,
                email: user.email,
                role: userRole,
                commerceCode: commerceCode
            },
            tenant: commerceCode ? {
                commerceCode: commerceCode,
                status: 'active'
            } : null
        };

        return await handler(context, req);

    } catch (error) {
        console.error("Middleware withAuth Error:", error);
        return Response.json({ error: 'Error interno en la verificación de autenticación' }, { status: 500 });
    }
}
