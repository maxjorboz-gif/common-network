// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { commerce_code, id_comercio: legacyId } = await req.json();
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        // Obtener Leads ordenados por fecha
        const filter = {};
        if (idBusqueda.length > 20) {
            filter.id_comercio = idBusqueda;
        } else {
            filter.commerce_code = idBusqueda;
        }

        const leads = await base44.asServiceRole.entities.Lead.filter(filter, '-fecha_contacto', 100);

        return Response.json({
            success: true,
            leads
        });

    } catch (error) {
        console.error('Error obtenerLeads:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
