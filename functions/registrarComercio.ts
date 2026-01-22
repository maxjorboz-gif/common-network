// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

function generateSovereignId(num) {
    return num.toString().padStart(6, '0');
}

Deno.serve(async (req) => {
    console.log("LOG: Iniciando registrarComercio...");
    try {
        const base44 = createClientFromRequest(req);

        // Verificación de autenticación
        const user = await base44.auth.me();
        if (!user) {
            console.error("LOG: Usuario no autenticado");
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Parseo de body
        let body;
        try {
            body = await req.json();
            console.log("LOG: Body recibido:", JSON.stringify(body));
        } catch (e) {
            return Response.json({ error: 'Body mismatch' }, { status: 400 });
        }

        const { nombre_comercio, whatsapp, numero_operacion } = body;

        if (!nombre_comercio) {
            return Response.json({ error: 'Nombre requerido' }, { status: 400 });
        }

        const userEmail = user.email || "";
        const normalizedEmail = userEmail.toLowerCase().trim();

        console.log("LOG: Procesando para email:", normalizedEmail);

        // 1. Check existing
        let existingCommerce = [];
        try {
            existingCommerce = await base44.asServiceRole.entities.Comercio.filter({
                email_admin: normalizedEmail
            }, '-created_date', 1);
        } catch (err) {
            console.warn("LOG: Error filtrando comercio (quizás no existe el campo email_admin):", err.message);
        }

        // 2. ID Logic
        let idSoberano;
        if (existingCommerce.length > 0 && existingCommerce[0].id_comercio) {
            idSoberano = existingCommerce[0].id_comercio;
            console.log("LOG: Usando ID existente:", idSoberano);
        } else {
            console.log("LOG: Generando nuevo ID...");
            try {
                const todos = await base44.asServiceRole.entities.Comercio.list('-created_date', 100);
                let maxActual = 0;
                todos.forEach((c) => {
                    if (c.id_comercio) {
                        const num = parseInt(c.id_comercio, 10);
                        if (!isNaN(num) && num > maxActual) maxActual = num;
                    }
                });
                idSoberano = generateSovereignId(maxActual + 1);
            } catch (err) {
                console.error("LOG: Error listando comercios:", err.message);
                idSoberano = generateSovereignId(Math.floor(Math.random() * 900000) + 100000); // Fallback random
            }
        }

        // 3. Save Data
        const commerceData = {
            email_admin: normalizedEmail,
            user_id: user.id || "",
            id_comercio: idSoberano,
            id_visual: idSoberano,
            nombre_comercio: nombre_comercio,
            whatsapp: whatsapp || "",
            numero_operacion: numero_operacion || "",
            aprobacion_pendiente: true,
            activo: false,
            updated_at: new Date().toISOString()
        };

        let finalResult;
        try {
            if (existingCommerce.length > 0) {
                console.log("LOG: Actualizando registro...");
                finalResult = await base44.asServiceRole.entities.Comercio.update(existingCommerce[0].id, commerceData);
            } else {
                console.log("LOG: Creando nuevo presupuesto de comercio...");
                finalResult = await base44.asServiceRole.entities.Comercio.create({
                    ...commerceData,
                    created_at: new Date().toISOString()
                });
            }
        } catch (dbErr) {
            console.error("LOG: CRASH EN DB:", dbErr.message);
            // Si falla por campos que no existen, intentamos lo mínimo
            const minimalData = {
                email_admin: normalizedEmail,
                id_comercio: idSoberano,
                nombre_comercio: nombre_comercio,
                numero_operacion: numero_operacion || ""
            };
            if (existingCommerce.length > 0) {
                finalResult = await base44.asServiceRole.entities.Comercio.update(existingCommerce[0].id, minimalData);
            } else {
                finalResult = await base44.asServiceRole.entities.Comercio.create(minimalData);
            }
        }

        return Response.json({
            success: true,
            id_comercio: idSoberano,
            comercio: finalResult
        });

    } catch (error) {
        console.error('LOG: ERROR CRITICO:', error);
        return Response.json({
            error: 'Backend Failure',
            details: error.message
        }, { status: 500 });
    }
});
