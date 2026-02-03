// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productosIds, tipo, valor, modo } = await req.json();

        // VALIDACIÓN MÍNIMA
        if (!productosIds || !Array.isArray(productosIds)) {
            return Response.json({ error: 'Ids Invalidos' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // UPDATE LOOP
        let count = 0;

        // Processing in parallel for speed, though sequentially is safer for rate limits if massive.
        // Array.map implies parallel start.
        const promises = productosIds.map(async (id) => {
            try {
                // 1. Obtener producto (SDK)
                const p = await adminClient.entities.Producto.get(id);
                if (!p) return;

                let nuevo = p.precio_estandar || 0;
                const v = parseFloat(valor);

                if (modo === 'percentage') {
                    // Porcentaje
                    nuevo = tipo === 'increase' ? nuevo * (1 + v / 100) : nuevo * (1 - v / 100);
                } else {
                    // Fijo
                    nuevo = tipo === 'increase' ? nuevo + v : nuevo - v;
                }

                // 2. ACTUALIZAR (SDK)
                await adminClient.entities.Producto.update(id, {
                    precio_estandar: Math.max(0, Math.round(nuevo)),
                    updated_at: new Date().toISOString()
                });
                count++;
            } catch (e) {
                console.error(`Error procesando producto ${id}:`, e);
            }
        });

        await Promise.all(promises);

        return Response.json({ success: true, actualizados: count });

    } catch (error) {
        console.error('Error cambioMasivoPrecio:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});