// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // TEST CRUD 1: Crear con lo mínimo absoluto
        console.log("TEST: Intentando crear registro mínimo...");
        const res = await base44.asServiceRole.entities.Comercio.create({
            nombre_comercio: "TEST_RENAME_" + Date.now()
        });

        return Response.json({ success: true, data: res });
    } catch (e) {
        console.error("TEST FAILED:", e.message);
        return Response.json({ success: false, error: e.message, stack: e.stack }, { status: 500 });
    }
});
