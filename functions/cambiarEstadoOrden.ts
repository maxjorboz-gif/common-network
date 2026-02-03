// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { ordenId, nuevoEstado } = await req.json();

        if (!ordenId || !nuevoEstado) {
            return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. OBTENER ORDEN (SDK Get)
        let orden;
        try {
            orden = await adminClient.entities.Orden.get(ordenId);
        } catch (e) {
            return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
        }

        // 2. ACTUALIZAR ORDEN (SDK Update)
        const updateData = {
            estado: nuevoEstado,
            updated_at: new Date().toISOString()
        };

        // Timestamps de auditoría simples
        if (nuevoEstado === 'ENVIADA') updateData.fecha_envio = new Date().toISOString();
        if (nuevoEstado === 'ENTREGADA') updateData.fecha_entrega = new Date().toISOString();
        if (nuevoEstado === 'CANCELADA') updateData.fecha_cancelacion = new Date().toISOString();

        await adminClient.entities.Orden.update(ordenId, updateData);

        return Response.json({
            success: true,
            message: `Orden actualizada a ${nuevoEstado}`,
            nuevo_estado: nuevoEstado
        });

    } catch (error) {
        console.error('Error cambiarEstadoOrden:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
