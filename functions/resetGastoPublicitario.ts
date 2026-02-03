// @ts-nocheck
import { createClientFromRequest } from "https://esm.sh/@base44/sdk@0.8.3";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { id_comercio, commerce_code: legacyCode } = await req.json().catch(() => ({}));
        const commerce_code = id_comercio || legacyCode;

        if (!commerce_code) {
            return Response.json({ error: 'Falta commerce_code' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Obtener todos los gastos de este comercio (SDK Filter)
        const gastos = await adminClient.entities.GastoPublicitario.filter({
            commerce_code: commerce_code
        });

        // Filtrar solo los NO archivados
        const gastosActivos = gastos.filter(g => !g.archived);

        if (gastosActivos.length === 0) {
            return Response.json({ success: true, message: 'No hay gastos para resetear' });
        }

        // 2. Marcar como archivados (Soft Delete) - SDK Update
        let updated = 0;
        const promises = gastosActivos.map(async (g) => {
            const id = g.id || g._id;
            await adminClient.entities.GastoPublicitario.update(id, {
                archived: true,
                archived_at: new Date().toISOString()
            });
            updated++;
        });

        await Promise.all(promises);

        return Response.json({ success: true, count: updated });

    } catch (error) {
        console.error('Error resetGastoPublicitario:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
