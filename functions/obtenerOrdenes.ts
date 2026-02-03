// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // Obtener Ordenes (SDK Filter)
        const ordenes = await adminClient.entities.Orden.filter({
            commerce_code: idBusqueda
        });

        // Optional: Sort by date descending in memory if needed, or if API returns sorted
        // ordenes.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        return Response.json({
            success: true,
            ordenes: Array.isArray(ordenes) ? ordenes : []
        });

    } catch (error) {
        console.error('Error obtenerOrdenes:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
