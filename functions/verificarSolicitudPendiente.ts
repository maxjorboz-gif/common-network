// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Verificar autenticación
        let user;
        try {
            user = await base44.auth.me();
        } catch (e) {
            return Response.json({ error: 'Auth fail' }, { status: 401 });
        }

        if (!user) return Response.json({ error: 'No user' }, { status: 401 });

        const userEmail = (user.email || "").toLowerCase().trim();

        // Buscar si existe una solicitud pendiente para este usuario
        try {
            const solicitudes = await base44.asServiceRole.entities.SolicitudComercio.filter({
                email: userEmail,
                status: "pendiente"
            }, '-fecha', 1);

            const solicitudPendiente = solicitudes[0];

            if (solicitudPendiente) {
                return Response.json({
                    success: true,
                    tiene_solicitud: true,
                    solicitud: {
                        id: solicitudPendiente.id,
                        nombre_comercio: solicitudPendiente.nombre,
                        fecha: solicitudPendiente.fecha,
                        numero_operacion: solicitudPendiente.comprobante
                    }
                });
            }

            return Response.json({
                success: true,
                tiene_solicitud: false
            });

        } catch (dbErr) {
            // Si la tabla no existe o está vacía, no hay solicitud
            return Response.json({
                success: true,
                tiene_solicitud: false
            });
        }

    } catch (globalErr) {
        return Response.json({ error: globalErr.message }, { status: 500 });
    }
});
