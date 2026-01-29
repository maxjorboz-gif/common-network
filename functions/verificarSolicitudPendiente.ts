// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

// NUEVA LÓGICA V8: Verificación Directa
// Usa el cliente del usuario para buscar sus propios registros.

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // 1. Quién soy?
        const { data: { user } } = await base44.auth.getUser();
        if (!user) return Response.json({ tiene_solicitud: false });

        // 2. Buscar en mis solicitudes
        const { data: solicitudes } = await base44.entities.SolicitudComercio.filter({
            user_id: user.id
        });

        if (solicitudes && solicitudes.length > 0) {
            // Tomamos la más reciente o la primera
            const sol = solicitudes[0];
            return Response.json({
                tiene_solicitud: true,
                solicitud: {
                    nombre_comercio: sol.nombre,
                    numero_operacion: sol.comprobante,
                    status: sol.status
                }
            });
        }

        return Response.json({ tiene_solicitud: false });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
