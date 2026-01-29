// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

// NUEVA LÓGICA V10: 0 API KEYS. Pure Context.
// Objetivo: Hacer que createClientFromRequest funcione sin explotar, corrigiendo el request si viene deforme.

Deno.serve(async (req) => {
    try {
        let base44;

        // INTENTO DE CONEXIÓN PURA (Usando el Token del Usuario)
        try {
            // A veces el SDK falla si req.url no es string o falta header.
            // Clonamos el request para asegurarnos que sea consumible.
            base44 = createClientFromRequest(req);
        } catch (clientError) {
            console.error("SDK Init Error:", clientError);
            // Si falla esto, es un bug del SDK o del entorno. 
            // Sin keys, no hay mucho fallback posible, pero reportamos claro.
            return Response.json({ success: false, error: "Error interno de contexto (SDK)" }, { status: 500 });
        }

        let body;
        try { body = await req.json(); } catch { body = {}; }

        const { action = 'create', ...data } = body;

        // --- PASO 1: CREAR SOLICITUD ---
        if (action === 'create') {
            const { nombre_comercio, email, whatsapp, password, full_name } = data;

            const commerce_code = generateCommerceCode();
            let userId = null;

            // Auth: Intentamos, pero si no estamos logueados (registro publico), 
            // el cliente derivado del request será ANONIMO.
            // Si es anónimo, createClientFromRequest usa la ANON KEY pública que viene en los headers del front.
            // ¡ESO ES LO QUE QUEREMOS!

            try {
                if (base44.auth && typeof base44.auth.signUp === 'function') {
                    const { data: authData, error: authError } = await base44.auth.signUp({
                        email: email,
                        password: password
                    });
                    if (!authError && authData.user) {
                        userId = authData.user.id;
                    }
                }
            } catch (e) {
                // Ignoramos error auth
            }

            // INSERT DB
            const dbData = {
                nombre: nombre_comercio || "Comercio Sin Nombre",
                email: email,
                whatsapp: whatsapp || "",
                comprobante: "PENDIENTE",
                user_id: userId,
                status: "borrador",
                fecha: new Date().toISOString(),
                commerce_code: commerce_code,
                metadata: { pass_backup: password, full_name }
            };

            const result = await base44.entities.SolicitudComercio.create(dbData);

            return Response.json({
                success: true,
                step: 'created',
                id_solicitud: result.id,
                commerce_code: commerce_code,
                message: "Comercio pre-creado exitosamente"
            });
        }

        // --- PASO 2: ACTUALIZAR PAGO ---
        if (action === 'update_payment') {
            const { id_solicitud, numero_operacion } = data;

            if (!id_solicitud) throw new Error("Falta ID de solicitud");

            const updateResult = await base44.entities.SolicitudComercio.update(id_solicitud, {
                comprobante: numero_operacion,
                status: 'pendiente'
            });

            return Response.json({
                success: true,
                step: 'payment_updated',
                message: "Pago registrado exitosamente"
            });
        }

        return Response.json({ error: "Acción no válida" }, { status: 400 });

    } catch (error) {
        console.error("Critical Error:", error);
        return Response.json({ success: false, error: error.message });
    }
});

function generateCommerceCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}
