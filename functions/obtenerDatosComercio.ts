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
        const comercios = await base44.asServiceRole.entities.Comercio.filter({
            email_admin: user.email
        }, '-created_date', 1);

        let miComercio = comercios[0];

        if (!miComercio || !miComercio.id_comercio) {
            // WHITE LABEL FLOW: 
            // Si el usuario no tiene comercio, devolvemos 404 para que el frontend lo mande a registrar.
            return Response.json({ error: 'Comercio no inicializado', code: 'COMMERCE_NOT_FOUND' }, { status: 404 });
        }

        const idSoberano = miComercio.id_comercio;

        // 3. RESPUESTA LIMPIA
        return Response.json({
            success: true,
            id_comercio: idSoberano,
            comercio: {
                ...miComercio,
                id: idSoberano, // El ID nativo muere aquí para el frontend
                id_comercio: idSoberano
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
