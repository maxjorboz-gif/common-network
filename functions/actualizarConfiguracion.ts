// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { commerce_code, id_comercio: legacyId, configData } = await req.json();

        const id_comercio_final = commerce_code || legacyId;

        if (!id_comercio_final) return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });

        // Buscamos la configuración vinculada al ID COMERCIO
        const configs = await base44.asServiceRole.entities.ConfiguracionComercio.filter({
            commerce_code: id_comercio_final
        }, '-created_date', 1);

        if (configs.length > 0) {
            await base44.asServiceRole.entities.ConfiguracionComercio.update(configs[0].id, {
                ...configData,
                updated_at: new Date().toISOString()
            });
        } else {
            await base44.asServiceRole.entities.ConfiguracionComercio.create({
                commerce_code: id_comercio_final,
                id_comercio: id_comercio_final, // Legacy support
                ...configData,
                created_at: new Date().toISOString()
            });
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
