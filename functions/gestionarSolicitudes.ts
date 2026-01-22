// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // SEGURIDAD: Solo el Admin Supremo puede acceder
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { action, id_comercio } = body;

        if (action === 'list') {
            // Listamos todos los comercios que están esperando aprobación
            // En Base44 filter() es poderoso, pero si no podemos usar filter directo por booleanos, 
            // traemos lista y filtramos aquí. 
            const todos = await base44.asServiceRole.entities.Comercio.list('-created_date', 500);
            const solicitudes = todos.filter(c => c.aprobacion_pendiente === true);

            return Response.json({ success: true, solicitudes });
        }

        if (action === 'approve') {
            if (!id_comercio) return Response.json({ error: 'ID requerido' }, { status: 400 });

            // Buscamos el registro interno por id_comercio
            const comercios = await base44.asServiceRole.entities.Comercio.filter({
                id_comercio: id_comercio
            }, '-created_date', 1);

            if (comercios.length === 0) return Response.json({ error: 'No encontrado' }, { status: 404 });

            const target = comercios[0];

            // ACTUALIZAMOS: Activamos la cuenta y quitamos el estado pendiente
            await base44.asServiceRole.entities.Comercio.update(target.id, {
                activo: true,
                aprobacion_pendiente: false,
                pago_confirmado: true,
                updated_at: new Date().toISOString()
            });

            return Response.json({ success: true, message: 'Comercio habilitado correctamente' });
        }

        return Response.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error('Error gestionarSolicitudes:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
