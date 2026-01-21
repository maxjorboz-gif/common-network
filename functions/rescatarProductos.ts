// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Autenticación básica para seguridad (solo admin)
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const SOVEREIGN_ID = "000001";
        console.log("Iniciando rescate de productos...");

        // Traemos todos los productos (limite alto para asegurar cubrir los 80)
        const productos = await base44.asServiceRole.entities.Producto.filter({}, '-created_date', 1000);

        let actualizados = 0;
        const errores = [];

        for (const p of productos) {
            try {
                let modificacion = {};
                let necesitaCambios = false;

                // 1. Asignar id_comercio: "000001"
                if (p.id_comercio !== SOVEREIGN_ID) {
                    modificacion.id_comercio = SOVEREIGN_ID;
                    necesitaCambios = true;
                }

                // 2. Migrar nombre a titulo si titulo está vacío
                if ((!p.titulo || p.titulo.trim() === '') && p.nombre) {
                    modificacion.titulo = p.nombre;
                    necesitaCambios = true;
                }

                // 3. Marcar como activo: true
                if (p.activo !== true) {
                    modificacion.activo = true;
                    necesitaCambios = true;
                }

                if (necesitaCambios) {
                    await base44.asServiceRole.entities.Producto.update(p.id, modificacion);
                    actualizados++;
                }

            } catch (err) {
                console.error(`Error actualizando producto ${p.id}:`, err);
                errores.push({ id: p.id, error: err.message });
            }
        }

        return Response.json({
            success: true,
            total_encontrados: productos.length,
            total_actualizados: actualizados,
            errores: errores
        });

    } catch (error) {
        console.error('Error fatal en script de rescate:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
