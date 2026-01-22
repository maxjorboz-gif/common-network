// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

function generateSovereignId(num) {
    return num.toString().padStart(6, '0');
}

Deno.serve(async (req) => {
    console.log("SOLICITUD INICIADA: registrarComercio");

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Sesión no encontrada' }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
            console.log("BODY_RECIBIDO:", JSON.stringify(body));
        } catch (e) {
            return Response.json({ error: 'Body de solicitud vacío o mal formado' }, { status: 400 });
        }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        if (!nombre_comercio) {
            return Response.json({ error: 'El nombre del comercio es obligatorio' }, { status: 400 });
        }

        const normalizedEmail = (user.email || "").toLowerCase().trim();

        // 1. Buscar si ya existe el registro (con seguridad)
        let existing = [];
        try {
            existing = await base44.asServiceRole.entities.Comercio.filter({
                email_admin: normalizedEmail
            }, '-created_at', 1);
        } catch (e) {
            console.warn("Error filtrando Comercio, procediendo como nuevo:", e.message);
        }

        // 2. Definir ID Visual / Interno inicial
        let idBase;
        if (existing.length > 0 && existing[0].id_comercio) {
            idBase = existing[0].id_comercio;
        } else {
            // Generamos uno basado en records actuales o random si falla el conteo
            try {
                const todos = await base44.asServiceRole.entities.Comercio.list('-created_at', 1);
                // Si hay records, generamos el siguiente, si no, empezamos en 1
                idBase = generateSovereignId(todos.length + 1);
            } catch (e) {
                idBase = generateSovereignId(Math.floor(Math.random() * 10000));
            }
        }

        // 3. Preparar DATA (solo campos conocidos y seguros)
        const commerceData = {
            nombre_comercio: nombre_comercio,
            email_admin: normalizedEmail,
            whatsapp: whatsapp || "",
            numero_operacion: numero_operacion || "",
            id_comercio: idBase,
            id_visual: idBase,
            aprobacion_pendiente: true,
            activo: false,
            user_id: user.id
        };

        let result;
        if (existing.length > 0) {
            console.log("ACTUALIZANDO_EXISTENTE:", existing[0].id);
            result = await base44.asServiceRole.entities.Comercio.update(existing[0].id, commerceData);
        } else {
            console.log("CREANDO_NUEVO_REGISTRO");
            result = await base44.asServiceRole.entities.Comercio.create(commerceData);
        }

        return Response.json({
            success: true,
            message: 'Solicitud guardada correctamente',
            id_comercio: idBase,
            data: result
        });

    } catch (error) {
        console.error("CRITICAL_FUNCTIONS_ERROR:", error.message);
        // Devolvemos el error detallado para diagnosticar en el front
        return Response.json({
            success: false,
            error: error.message,
            debug_info: "Error en registrarComercio.ts"
        }, { status: 500 });
    }
});
