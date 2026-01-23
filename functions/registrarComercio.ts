// @ts-nocheck
import { createClientFromRequest, createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    console.log("INICIO: registrarComercio (Simple Flow)");

    try {
        // 0. CHECK ENV VARS
        const apiUrl = Deno.env.get("BASE44_API_URL");
        const serviceKey = Deno.env.get("BASE44_SERVICE_ROLE_KEY");
        if (!apiUrl || !serviceKey) {
            console.error("CRITICAL: Missing Admin Env Vars");
            return Response.json({ success: false, error: "Server Config Error: Missing API Keys" }, { status: 200 });
        }

        const base44Admin = createClient(apiUrl, serviceKey);
        const base44User = createClientFromRequest(req);

        const user = await base44User.auth.me();
        if (!user) return Response.json({ success: false, error: 'Auth Expired' }, { status: 200 });

        let body;
        try { body = await req.json(); } catch (e) { body = {}; }

        const { nombre_comercio, whatsapp, numero_operacion } = body;
        const userEmail = (user.email || "").toLowerCase().trim();

        if (!nombre_comercio) {
            return Response.json({ success: false, error: 'Falta nombre del comercio' }, { status: 200 });
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
        // Important: Return 200 so frontend reads the JSON 'error' field
        return Response.json({ success: false, error: `DB Error: ${error.message}` }, { status: 200 });
    }
});
