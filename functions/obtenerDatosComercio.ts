// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // NO HACEMOS AUTH CHECK COMPLEJO AQUÍ PARA EVITAR COLLISIONES CON TABLAS DAÑADAS
        // Solo verificamos email de usuario si es posible
        let user;
        try {
            user = await base44.auth.me();
        } catch (e) {
            return Response.json({ error: 'Auth fail' }, { status: 401 });
        }

        if (!user) return Response.json({ error: 'No user' }, { status: 401 });

        const userEmail = (user.email || "").toLowerCase().trim();

        // LEY DE MEMORIA: Al buscar datos de comercio, si la tabla está rota, 
        // devolvemos 404 para que el front lo mande a /registro.
        // NO intentamos hacer cosas raras si falla.
        try {
            const comercios = await base44.asServiceRole.entities.Comercio.filter({
                email_admin: userEmail
            }, '-created_date', 1);

            const miComercio = comercios[0];

            if (!miComercio || !miComercio.activo) {
                return Response.json({ error: 'No activo', code: 'COMMERCE_NOT_FOUND' }, { status: 404 });
            }

            return Response.json({
                success: true,
                id_comercio: miComercio.id_comercio,
                comercio: miComercio
            });
        } catch (dbErr) {
            // Si la tabla está tan rota que el filter da 500, devolvemos 404 controlado
            return Response.json({ error: 'DB Error/Empty', code: 'COMMERCE_NOT_FOUND' }, { status: 404 });
        }

    } catch (globalErr) {
        return Response.json({ error: globalErr.message }, { status: 500 });
    }
});
