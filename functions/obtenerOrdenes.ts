// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { commerce_code, id_comercio: legacyId } = await req.json();
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });

        // FILTRO COMERCIO
        const filter = {};
        if (idBusqueda.length > 20) {
            filter.id_comercio = idBusqueda;
        } else {
            filter.commerce_code = idBusqueda;
        }

        const ordenes = await base44.asServiceRole.entities.Orden.filter(filter, '-created_date', 100);

        return Response.json({ success: true, ordenes });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
