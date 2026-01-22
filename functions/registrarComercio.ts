// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Sesión expirada' }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: 'Request body missing' }, { status: 400 });
        }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        const userEmail = (user.email || "").toLowerCase().trim();

        // GENERACIÓN DE ID TEMPORAL TOTALMENTE ALEATORIA 
        // Para evitar chocar con cualquier cosa existente en la DB
        const tempId = "SOL-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        // CREACIÓN DIRECTA (SIN FILTROS NI BÚSQUEDAS PREVIAS)
        // Esto evita errores 500 si la base de datos tiene "basura" en los índices
        const result = await base44.asServiceRole.entities.Comercio.create({
            id_comercio: tempId,
            id_visual: tempId,
            nombre_comercio: nombre_comercio,
            email_admin: userEmail,
            whatsapp: whatsapp || "",
            numero_operacion: numero_operacion || "",
            aprobacion_pendiente: true,
            activo: false,
            user_id: user.id || "",
            created_date: new Date().toISOString()
        });

        return Response.json({
            success: true,
            id_comercio: tempId,
            data: result
        });

    } catch (error) {
        console.error("FATAL_ERROR_REGISTRO:", error.message);
        return Response.json({
            success: false,
            error: error.message || 'Error crítico en el motor de base de datos'
        }, { status: 500 });
    }
});
