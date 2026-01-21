// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

/**
 * Genera el formato 000001
 */
function generateSovereignId(num) {
    return num.toString().padStart(6, '0');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        // 1. BUSCAMOS POR EMAIL (Identidad primaria)
        // Normalizamos el email para evitar problemas de espacios o mayúsculas
        const userEmail = user.email || "";
        const normalizedEmail = userEmail.toLowerCase().trim();

        let miComercio = null;

        if (normalizedEmail) {
            const comercios = await base44.asServiceRole.entities.Comercio.filter({
                email_admin: normalizedEmail
            }, '-created_date', 1);
            miComercio = comercios[0];
        }

        // 2. BUSQUEDA POR USER_ID (Fallback si el email fallara por alguna razón o no tuviera)
        if (!miComercio && user.id) {
            const comerciosById = await base44.asServiceRole.entities.Comercio.filter({
                user_id: user.id
            }, '-created_date', 1);
            miComercio = comerciosById[0];
        }

        if (!miComercio || !miComercio.id_comercio) {
            // WHITE LABEL FLOW: 
            // Si el usuario no tiene comercio, devolvemos 404 para que el frontend lo mande a registrar.
            return Response.json({
                error: 'Comercio no inicializado',
                code: 'COMMERCE_NOT_FOUND',
                email_intent: normalizedEmail
            }, { status: 404 });
        }

        const idSoberano = miComercio.id_comercio;

        // 3. RESPUESTA LIMPIA
        return Response.json({
            success: true,
            id_comercio: idSoberano,
            comercio: {
                ...miComercio,
                id: idSoberano, // Normalizamos: para el front, el ID es el soberano
                id_comercio: idSoberano,
                id_visual: miComercio.id_visual || idSoberano // Backup
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
