// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') return Response.json({ error: 'Auth' }, { status: 403 });

        const { productosIds, tipo, valor, modo } = await req.json();

        // VALIDACIÓN MÍNIMA
        if (!productosIds || !Array.isArray(productosIds)) return Response.json({ error: 'Ids Invalidos' }, { status: 400 });

        // UPDATE LOOP
        let count = 0;
        for (const id of productosIds) {
            try {
                const p = await base44.asServiceRole.entities.Producto.get(id);
                if (!p) continue;

                let nuevo = p.precio_estandar;
                const v = parseFloat(valor);

                if (modo === 'percentage') {
                    // Porcentaje
                    nuevo = tipo === 'increase' ? nuevo * (1 + v / 100) : nuevo * (1 - v / 100);
                } else {
                    // Fijo
                    nuevo = tipo === 'increase' ? nuevo + v : nuevo - v;
                }

                // Guardar sin reglas de redondeo complejas
                await base44.asServiceRole.entities.Producto.update(id, {
                    precio_estandar: Math.max(0, Math.round(nuevo))
                });
                count++;
            } catch (e) { }
        }

        return Response.json({ success: true, actualizados: count });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});