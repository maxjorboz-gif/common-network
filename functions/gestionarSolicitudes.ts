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

        // SEGURIDAD: Solo el Admin Supremo puede acceder
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { action, id_comercio } = body;

        if (action === 'list') {
            // Listamos todos los comercios para tener la lista completa en el panel supremo
            const todos = await base44.asServiceRole.entities.Comercio.list('-created_date', 500);
            return Response.json({ success: true, solicitudes: todos });
        }

        if (action === 'approve') {
            if (!id_comercio) return Response.json({ error: 'ID requerido' }, { status: 400 });

            // Buscamos el registro interno
            const comercios = await base44.asServiceRole.entities.Comercio.filter({
                id_comercio: id_comercio
            }, '-created_date', 1);

            if (comercios.length === 0) return Response.json({ error: 'No encontrado' }, { status: 404 });

            const target = comercios[0];
            const finalId = generateRandomId(10);

            // ACTUALIZAMOS: Activamos la cuenta, quitamos el estado pendiente y asignamos el ID DEFINITIVO
            await base44.asServiceRole.entities.Comercio.update(target.id, {
                id_comercio: finalId,
                id_visual: finalId,
                activo: true,
                aprobacion_pendiente: false,
                pago_confirmado: true,
                updated_at: new Date().toISOString()
            });

            return Response.json({ success: true, message: `Comercio habilitado con ID: ${finalId}` });
        }

        if (action === 'toggle_active') {
            if (!id_comercio) return Response.json({ error: 'ID requerido' }, { status: 400 });
            const { active } = body;

            const comercios = await base44.asServiceRole.entities.Comercio.filter({
                id_comercio: id_comercio
            }, '-created_date', 1);
            if (comercios.length === 0) return Response.json({ error: 'No encontrado' }, { status: 404 });

            await base44.asServiceRole.entities.Comercio.update(comercios[0].id, {
                activo: active,
                updated_at: new Date().toISOString()
            });
            return Response.json({ success: true });
        }

        return Response.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error('Error gestionarSolicitudes:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
