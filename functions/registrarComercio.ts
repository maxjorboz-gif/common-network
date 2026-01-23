// @ts-nocheck
import { createClientFromRequest, createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    console.log("INICIO: registrarComercio (Simple Flow)");

    try {
        // 0. NATIVE SERVICE ROLE (No Manual Keys needed)
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user) return Response.json({ success: false, error: 'Auth Expired' }, { status: 200 });

        let body;
        try { body = await req.json(); } catch (e) { body = {}; }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        const userEmail = (user.email || "").toLowerCase().trim();

        if (!nombre_comercio) {
            return Response.json({ success: false, error: 'Falta nombre del comercio' }, { status: 200 });
        }

        // DIRECT INSERT: SolicitudComercio
        // Use native Service Role from Platform
        const result = await base44.asServiceRole.entities.SolicitudComercio.create({
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
        // Important: Return 200 so frontend reads the JSON 'error' field
        return Response.json({ success: false, error: `DB Error: ${error.message}` }, { status: 200 });
    }
});
