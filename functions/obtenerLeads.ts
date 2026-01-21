// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id_comercio } = await req.json();

        if (!id_comercio) {
            return Response.json({ error: 'Falta ID de comercio (id_comercio)' }, { status: 400 });
        }

        // Obtener Leads ordenados por fecha
        const leads = await base44.asServiceRole.entities.Lead.filter({
            id_comercio: id_comercio
        }, '-fecha_contacto', 100);

        return Response.json({
            success: true,
            leads
        });

    } catch (error) {
        console.error('Error obtenerLeads:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
