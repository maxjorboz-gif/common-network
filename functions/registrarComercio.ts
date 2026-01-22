// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    console.log("INICIO: registrarComercio (Isolated Waiting Room)");

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: 'Body mismatch' }, { status: 400 });
        }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        const userEmail = (user.email || "").toLowerCase().trim();

        if (!nombre_comercio) {
            return Response.json({ error: 'Falta nombre del comercio' }, { status: 400 });
        }

        // LEY DE MEMORIA: Usamos una entidad NUEVA "SolicitudComercio" para evitar basura de bases anteriores
        // Esto garantiza que el esquema sea fresco y no choque con nada viejo.
        const result = await base44.asServiceRole.entities.SolicitudComercio.create({
            nombre: nombre_comercio,
            email: userEmail,
            whatsapp: whatsapp || "",
            comprobante: numero_operacion || "NO_OP",
            user_id: user.id || "",
            status: "pendiente",
            fecha: new Date().toISOString()
        });

        console.log("EXITO: Solicitud creada con ID:", result.id);

        return Response.json({
            success: true,
            id_registro: result.id,
            data: result
        });

    } catch (error) {
        console.error("CRITICAL_SOLICITUD_ERROR:", error.message);
        return Response.json({
            success: false,
            error: `Error en la base de datos: ${error.message}`,
            debug_info: "Probablemente la entidad SolicitudComercio está naciendo ahora"
        }, { status: 500 });
    }
});
