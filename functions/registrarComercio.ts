// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

function generateSovereignId(num) {
    return num.toString().padStart(6, '0');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Verificación de autenticación
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Parseo de body con fallback para evitar crash
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: 'Body de solicitud inválido o vacío' }, { status: 400 });
        }

        const { nombre_comercio, whatsapp, numero_operacion } = body;

        if (!nombre_comercio) {
            return Response.json({ error: 'Nombre de comercio requerido' }, { status: 400 });
        }

        const userEmail = user.email || "";
        const normalizedEmail = userEmail.toLowerCase().trim();

        // 1. Check if user already has a commerce
        // Usamos asServiceRole para poder filtrar por email_admin libremente
        const existingCommerce = await base44.asServiceRole.entities.Comercio.filter({
            email_admin: normalizedEmail
        }, '-created_date', 1);

        // 2. Logic for ID generation
        // Si ya existe y tiene ID, lo mantenemos. Si no, generamos uno temporal.
        let idSoberano;
        if (existingCommerce.length > 0 && existingCommerce[0].id_comercio) {
            idSoberano = existingCommerce[0].id_comercio;
        } else {
            // Generación de ID incremental para el flujo inicial
            const todos = await base44.asServiceRole.entities.Comercio.list('-created_date', 1000);
            let maxActual = 0;
            todos.forEach((c) => {
                if (c.id_comercio) {
                    const num = parseInt(c.id_comercio, 10);
                    if (!isNaN(num) && num > maxActual) maxActual = num;
                }
            });
            idSoberano = generateSovereignId(maxActual + 1);
        }

        // 3. Data structure
        const commerceData = {
            email_admin: normalizedEmail,
            user_id: user.id || "",
            id_comercio: idSoberano,
            id_visual: idSoberano,
            nombre_comercio: nombre_comercio,
            whatsapp: whatsapp || "",
            numero_operacion: numero_operacion || "",
            aprobacion_pendiente: true, // Flag para el Panel Supremo
            activo: false, // Inactivo hasta aprobación
            // No guardamos configuración compleja aquí para evitar problemas de esquema
            updated_at: new Date().toISOString()
        };

        let result;
        if (existingCommerce.length > 0) {
            const idDoc = existingCommerce[0].id;
            result = await base44.asServiceRole.entities.Comercio.update(idDoc, commerceData);
        } else {
            result = await base44.asServiceRole.entities.Comercio.create({
                ...commerceData,
                created_at: new Date().toISOString()
            });
        }

        return Response.json({
            success: true,
            message: 'Solicitud de registro exitosa',
            id_comercio: idSoberano,
            comercio: result
        });

    } catch (error) {
        console.error('Fatal Error registrarComercio:', error);
        return Response.json({
            error: 'Database Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});
