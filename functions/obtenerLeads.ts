// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req: Request) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // Obtener Leads (SDK Filter)
        const leads = await adminClient.entities.Lead.filter({
            commerce_code: idBusqueda
        });

        // Optional: Sort descending in memory
        // leads.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        return Response.json({
            success: true,
            leads: Array.isArray(leads) ? leads : []
        });

    } catch (error) {
        console.error('Error obtenerLeads:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
