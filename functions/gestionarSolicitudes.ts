// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

function generateRandomId(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        let body;
        try { body = await req.json(); } catch (e) { body = {}; }

        const { action, id_registro, id_comercio } = body;

        // ACCION: LISTAR (Con manejo de errores para evitar 500 en tablas vacías)
        if (action === 'list') {
            let pendientes = [];
            let activos = [];

            try {
                pendientes = await base44.asServiceRole.entities.SolicitudVenta.list();
            } catch (e) { console.warn("List SolicitudVenta fail:", e.message); }

            try {
                activos = await base44.asServiceRole.entities.Comercio.list();
            } catch (e) { console.warn("List Comercio fail:", e.message); }

            const solicitudesNormalizadas = [
                ...pendientes.map(p => ({
                    id: p.id,
                    id_registro: p.id,
                    nombre_comercio: p.nombre,
                    email_admin: p.email,
                    whatsapp: p.whatsapp,
                    numero_operacion: p.comprobante,
                    aprobacion_pendiente: true,
                    activo: false,
                    id_comercio: "PENDIENTE"
                })),
                ...activos.map(c => ({
                    ...c,
                    aprobacion_pendiente: false
                }))
            ];

            return Response.json({ success: true, solicitudes: solicitudesNormalizadas });
        }

        // ACCION: APROBAR
        if (action === 'approve') {
            if (!id_registro) return Response.json({ error: 'Falta ID de registro' }, { status: 400 });
            const solicitud = await base44.asServiceRole.entities.SolicitudVenta.get(id_registro);
            if (!solicitud) return Response.json({ error: 'Solicitud no encontrada' }, { status: 404 });

            const finalId = generateRandomId(10);
            await base44.asServiceRole.entities.Comercio.create({
                id_comercio: finalId,
                id_visual: finalId,
                nombre_comercio: solicitud.nombre,
                email_admin: solicitud.email,
                whatsapp: solicitud.whatsapp,
                numero_operacion: solicitud.comprobante,
                user_id: solicitud.user_id,
                activo: true,
                pago_confirmado: true,
                created_date: new Date().toISOString()
            });

            await base44.asServiceRole.entities.SolicitudVenta.delete(id_registro);
            return Response.json({ success: true, new_id: finalId });
        }

        return Response.json({ error: 'Acción no soportada' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
