// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // 1. SEGURIDAD: Solo Admin
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const { ordenId, nuevoEstado } = await req.json();

        if (!ordenId || !nuevoEstado) {
            return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // 2. VALIDACIÓN DE ESTADOS (Normalizados a MAYÚSCULAS como finalizarCompra)
        // Ojo: PAGADA se debe manejar SÓLO por confirmarPago.ts para asegurar Meta CAPI y Stock
        const estadosValidos = ['EN_PREPARACION', 'ENVIADA', 'ENTREGADA', 'CANCELADA'];

        if (!estadosValidos.includes(nuevoEstado)) {
            // Si intentan pasar a PAGADA por acá, rebotamos amablemente
            if (nuevoEstado === 'PAGADA' || nuevoEstado === 'pago_confirmado') {
                return Response.json({
                    error: 'Para confirmar pago use la función específica de confirmación que maneja stock y marketing.'
                }, { status: 400 });
            }
            return Response.json({ error: `Estado no válido. Permitidos: ${estadosValidos.join(', ')}` }, { status: 400 });
        }

        // 3. OBTENER ORDEN
        // Usamos filter en lugar de get directo para asegurar robustez
        const ordenes = await base44.asServiceRole.entities.Orden.filter({ id: ordenId }, '-created_date', 1);
        const orden = ordenes[0];

        if (!orden) return Response.json({ error: 'Orden no encontrada' }, { status: 404 });

        // 4. LÓGICA DE CANCELACIÓN (Devolución de Stock)
        if (nuevoEstado === 'CANCELADA' && orden.estado !== 'CANCELADA') {
            // Si la orden estaba pagada o ya había descontado stock, hay que devolverlo
            // Asumimos que si estaba PAGADA, EN_PREPARACION o ENVIADA, el stock ya se bajó.
            const estadosConStockDescontado = ['PAGADA', 'EN_PREPARACION', 'ENVIADA', 'ENTREGADA'];

            if (estadosConStockDescontado.includes(orden.estado)) {
                console.log(`Devolviendo stock para orden ${orden.numero_orden}...`);
                for (const item of orden.items) {
                    const productos = await base44.asServiceRole.entities.Producto.filter({ id: item.id_producto }, '-created_date', 1);
                    const p = productos[0];
                    if (p) {
                        await base44.asServiceRole.entities.Producto.update(p.id, {
                            stock: (p.stock || 0) + item.cantidad,
                            vendidos: Math.max(0, (p.vendidos || 0) - item.cantidad)
                        });
                    }
                }
            }
        }

        // 5. ACTUALIZAR ORDEN
        const updateData = { estado: nuevoEstado };

        // Timestamps de auditoría
        if (nuevoEstado === 'ENVIADA') updateData.fecha_envio = new Date().toISOString();
        if (nuevoEstado === 'ENTREGADA') updateData.fecha_entrega = new Date().toISOString();
        if (nuevoEstado === 'CANCELADA') updateData.fecha_cancelacion = new Date().toISOString();

        await base44.asServiceRole.entities.Orden.update(orden.id, updateData);

        return Response.json({
            success: true,
            message: `Orden actualizada a ${nuevoEstado}`,
            nuevo_estado: nuevoEstado
        });

    } catch (error) {
        console.error('Error cambiarEstadoOrden:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
