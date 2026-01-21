// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { id_comercio, configData } = await req.json();

        if (!id_comercio) return Response.json({ error: 'Falta ID Soberano' }, { status: 400 });

        // Buscamos la configuración vinculada al ID SOBERANO
        const configs = await base44.asServiceRole.entities.ConfiguracionComercio.filter({
            id_comercio: id_comercio
        }, '-created_date', 1);

        if (configs.length > 0) {
            await base44.asServiceRole.entities.ConfiguracionComercio.update(configs[0].id, {
                ...configData,
                updated_at: new Date().toISOString()
            });
        } else {
            await base44.asServiceRole.entities.ConfiguracionComercio.create({
                id_comercio: id_comercio, // TATUAJE EN CONFIG
                ...configData,
                created_at: new Date().toISOString()
            });
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
