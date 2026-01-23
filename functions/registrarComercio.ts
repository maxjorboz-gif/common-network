// @ts-nocheck
import { createClientFromRequest, createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    console.log("INICIO: registrarComercio (Simple Flow)");

    try {
        const base44User = createClientFromRequest(req);
        // Admin client for DB writes
        const base44Admin = createClient(
            Deno.env.get("BASE44_API_URL") ?? "",
            Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
        );

        const user = await base44User.auth.me();
        if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

        let body;
        try { body = await req.json(); } catch (e) { body = {}; }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        const userEmail = (user.email || "").toLowerCase().trim();

        if (!nombre_comercio) {
            return Response.json({ error: 'Falta nombre del comercio' }, { status: 400 });
        }

        // DIRECT INSERT: SolicitudComercio
        const result = await base44Admin.entities.SolicitudComercio.create({
            nombre: nombre_comercio,
            email: userEmail,
            whatsapp: whatsapp || "",
            comprobante: numero_operacion || "NO_OP",
            user_id: user.id || "",
            status: "pendiente",
            fecha: new Date().toISOString()
        });

        console.log("EXITO: Solicitud creada:", result.id);

        return Response.json({
            success: true,
            id_registro: result.id
        });

    } catch (error) {
        console.error("REGISTRO_FAIL:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
