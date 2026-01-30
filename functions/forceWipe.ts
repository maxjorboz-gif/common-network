// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    // 1. SIN AUTH USER CHECK - EMERGENCIA
    // Solo usamos el Service Role Admin
    const base44Admin = createClient(
        Deno.env.get("BASE44_API_URL") ?? "",
        Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("LOG: FORCE WIPE INICIADO (Bypass Auth)");

    const entities = [
        'Orden',
        'Lead',
        'Conversacion',
        'Producto',
        'SolicitudComercio',
        'SolicitudVenta',
        'Comercio',
        'Configuracion'
    ];

    let stats = {};

    for (const entity of entities) {
        try {
            if (!base44Admin.entities[entity]) continue;

            const items = await base44Admin.entities[entity].list();
            let count = 0;
            for (const item of items) {
                await base44Admin.entities[entity].delete(item.id);
                count++;
            }
            stats[entity] = count;
        } catch (e) {
            stats[entity] = `Error: ${e.message}`;
        }
    }

    return Response.json({
        success: true,
        message: "Wipe Forzado Completado",
        stats
    });
});
