// @ts-nocheck
import { createClientFromRequest, createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    console.log("INICIO: registrarComercio (Simple Flow)");

    try {
        // 0. NATIVE SERVICE ROLE (No Manual Keys needed)
        const base44 = createClientFromRequest(req);

        // PUBLIC ENDPOINT - No Auth Check needed

        let body;
        try { body = await req.json(); } catch (e) { body = {}; }

        const { nombre_comercio, whatsapp, numero_operacion, email, password, full_name } = body;

        // Validaciones Básicas de Payload
        if (!nombre_comercio || !email || !password) {
            return Response.json({ success: false, error: 'Faltan datos obligatorios (Nombre, Email, Password)' }, { status: 200 });
        }

        const emailNorm = email.toLowerCase().trim();

        // 1. CREAR USUARIO (Auth Admin)
        const { data: newUser, error: authError } = await base44.asServiceRole.auth.admin.createUser({
            email: emailNorm,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: full_name || nombre_comercio }
        });

        if (authError) {
            console.error("AUTH ERROR:", authError.message);
            if (authError.message.includes("already registered")) {
                return Response.json({ success: false, error: 'El email ya está registrado. Por favor inicia sesión primero.' }, { status: 200 });
            }
            return Response.json({ success: false, error: `Error creando usuario: ${authError.message}` }, { status: 200 });
        }

        const userId = newUser.user.id;
        console.log("USUARIO CREADO:", userId);

        // 2. CREAR SOLICITUD (DB)
        const result = await base44.asServiceRole.entities.SolicitudComercio.create({
            nombre: nombre_comercio,
            email: emailNorm,
            whatsapp: whatsapp || "",
            comprobante: numero_operacion || "NO_OP",
            user_id: userId,
            status: "pendiente",
            fecha: new Date().toISOString()
        });

        console.log("EXITO: Solicitud creada:", result.id);

        return Response.json({
            success: true,
            id_registro: result.id,
            message: "Usuario y Solicitud creados correctamente"
        });

    } catch (error) {
        console.error("REGISTRO_FAIL:", error.message);
        // Important: Return 200 so frontend reads the JSON 'error' field
        return Response.json({ success: false, error: `DB Error: ${error.message}` }, { status: 200 });
    }
});
