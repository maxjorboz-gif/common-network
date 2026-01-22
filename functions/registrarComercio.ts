// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

function generateSovereignId(num) {
    return num.toString().padStart(6, '0');
}

Deno.serve(async (req) => {
    console.log("REGISTRO: Iniciando...");

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'No se detectó sesión activa. Por favor, logueate nuevamente.' }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
        }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        if (!nombre_comercio) {
            return Response.json({ error: 'El nombre del comercio es obligatorio' }, { status: 400 });
        }

        const userEmail = (user.email || "").toLowerCase().trim();

        // 1. Buscamos comercio existente
        // LEY DE MEMORIA: Usar 'created_date' para el ordenamiento, NO 'created_at'
        let existing = [];
        try {
            existing = await base44.asServiceRole.entities.Comercio.filter({
                email_admin: userEmail
            }, '-created_date', 1);
        } catch (e) {
            console.warn("Falla al filtrar. Verificando si existe la entidad...");
        }

        // 2. Generar ID Soberano (Temporal hasta que el supremo lo apruebe)
        let idBase;
        if (existing.length > 0 && existing[0].id_comercio) {
            idBase = existing[0].id_comercio;
        } else {
            try {
                // Listamos los últimos 500 para contar y dar el siguiente ID
                const todos = await base44.asServiceRole.entities.Comercio.list('-created_date', 500);
                idBase = generateSovereignId(todos.length + 1);
            } catch (e) {
                console.error("Error al listar comercios:", e.message);
                idBase = generateSovereignId(Math.floor(Math.random() * 900000) + 100000);
            }
        }

        const commerceData = {
            nombre_comercio: nombre_comercio,
            email_admin: userEmail,
            whatsapp: whatsapp || "",
            numero_operacion: numero_operacion || "",
            id_comercio: idBase,
            id_visual: idBase,
            aprobacion_pendiente: true,
            activo: false,
            user_id: user.id || ""
        };

        let result;
        if (existing.length > 0) {
            console.log("Actualizando comercio existente para:", userEmail);
            result = await base44.asServiceRole.entities.Comercio.update(existing[0].id, {
                ...commerceData,
                updated_at: new Date().toISOString()
            });
        } else {
            console.log("Creando nuevo registro de comercio para:", userEmail);
            result = await base44.asServiceRole.entities.Comercio.create({
                ...commerceData,
                created_date: new Date().toISOString()
            });
        }

        return Response.json({
            success: true,
            id_comercio: idBase,
            data: result
        });

    } catch (error) {
        console.error("ERROR EN REGISTRAR_COMERCIO:", error);
        return Response.json({
            success: false,
            error: error.message || 'Error desconocido en el servidor'
        }, { status: 500 });
    }
});
