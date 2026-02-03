const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

// REGLA FORCE_WIPE: URL Estándar de Base de Datos
const BASE_URL_API = `https://app.base44.com/api/apps/${APP_ID}/entities`;

/**
 * Middleware withAuth (Refactorizado DB-First & Ubiquitous Language)
 * Verifica el Token Custom de Comercio y valida contra la tabla Comercio.
 * Alineado ESTRICTAMENTE a nombres de FORCE_WIPE.ts.
 */
interface AuthContext {
    user: {
        id: string;             // user_id
        email_negocio: string;  // email_negocio (EXACT MATCH)
        role: "admin_comercio";
        id_comercio: string;  // id_comercio (Variable Normalizada)
    };
    tenant: {
        id_comercio: string;  // id_comercio (Variable Normalizada)
        id: string;             // _id (Base44 system field)
        estado_registro: string;// estado_registro (EXACT MATCH)
        plan: string;           // plan (EXACT MATCH)
        activo: boolean;        // activo (EXACT MATCH)
    };
}

export async function withAuth(req: Request, handler: (context: AuthContext, req: Request) => Promise<Response>, requiredRole?: string) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: 'No autorizado: Token requerido' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // 1. DECODIFICAR TOKEN (Formato: id_comercio:random:timestamp en Base64)
        let id_comercio = null;
        try {
            const decoded = atob(token);
            const parts = decoded.split(":");
            if (parts.length < 3) throw new Error("Token malformado");

            // Extracción directa respetando nombre de variable
            id_comercio = parts[0];
        } catch (e) {
            return Response.json({ error: 'Token inválido' }, { status: 403 });
        }

        if (!id_comercio) {
            return Response.json({ error: 'Token inválido: Sin código de comercio' }, { status: 403 });
        }

        // 2. VALIDAR CONTRA BASE DE DATOS (Single Source of Truth: Entidad Comercio)
        // REGLA: Usar URL estándar ${BASE_URL_API}/Comercio
        // MAPPING: id_comercio (app) -> commerce_code (db)
        const queryUrl = `${BASE_URL_API}/Comercio?commerce_code=${encodeURIComponent(id_comercio)}`;

        const dbResponse = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!dbResponse.ok) {
            console.error(`Error validadando comercio: ${dbResponse.status} - ${dbResponse.statusText}`);
            return Response.json({ error: 'Error al validar sesión' }, { status: 500 });
        }

        const resultados = await dbResponse.json();
        const comercio = Array.isArray(resultados) ? resultados[0] : null;

        if (!comercio) {
            return Response.json({ error: 'Sesión inválida: Comercio no encontrado' }, { status: 401 });
        }

        if (comercio.activo === false) { // Chequeo explícito de suspensión (campo: activo)
            return Response.json({ error: 'Cuenta suspendida o inactiva' }, { status: 403 });
        }

        // 3. CONSTRUIR CONTEXTO DE EJECUCIÓN (Uso de Nombres Exactos)
        const context: AuthContext = {
            user: {
                id: comercio.user_id || 'legacy_no_id',
                email_negocio: comercio.email_negocio,
                role: 'admin_comercio',
                id_comercio: comercio.commerce_code || comercio.id_comercio
            },
            tenant: {
                id_comercio: comercio.commerce_code || comercio.id_comercio,
                id: comercio.id || comercio._id,
                estado_registro: comercio.estado_registro,
                plan: comercio.plan,
                activo: comercio.activo
            }
        };

        // 4. EJECUTAR HANDLER
        return await handler(context, req);

    } catch (error) {
        console.error("Middleware withAuth Error:", error);
        return Response.json({ error: 'Error interno de seguridad' }, { status: 500 });
    }
}

