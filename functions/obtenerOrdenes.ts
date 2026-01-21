// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { id_comercio } = await req.json();

        if (!id_comercio) return Response.json({ error: 'Falta ID Soberano' }, { status: 400 });

        // FILTRO SOBERANO
        const ordenes = await base44.asServiceRole.entities.Orden.filter({
            id_comercio: id_comercio
        }, '-created_date', 100);

        return Response.json({ success: true, ordenes });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
