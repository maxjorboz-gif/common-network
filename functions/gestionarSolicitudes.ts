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

        // Verificación de Admin
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado o no es administrador' }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: 'Body mismatch' }, { status: 400 });
        }

        const { action, id_comercio } = body;

        if (action === 'list') {
            const todos = await base44.asServiceRole.entities.Comercio.list('-created_date', 500);
            return Response.json({ success: true, solicitudes: todos });
        }

        if (action === 'approve') {
            if (!id_comercio) return Response.json({ error: 'ID requerido' }, { status: 400 });

            // Buscar registro
            const query = await base44.asServiceRole.entities.Comercio.filter({
                id_comercio: id_comercio
            }, '-created_date', 1);

            if (query.length === 0) return Response.json({ error: 'Comercio no encontrado' }, { status: 404 });

            const target = query[0];
            const finalId = generateRandomId(10);

            await base44.asServiceRole.entities.Comercio.update(target.id, {
                id_comercio: finalId,
                id_visual: finalId,
                activo: true,
                aprobacion_pendiente: false,
                pago_confirmado: true,
                updated_at: new Date().toISOString()
            });

            return Response.json({
                success: true,
                message: 'Comercio Activado',
                new_id: finalId
            });
        }

        if (action === 'toggle_active') {
            if (!id_comercio) return Response.json({ error: 'ID requerido' }, { status: 400 });
            const { active } = body;

            const query = await base44.asServiceRole.entities.Comercio.filter({
                id_comercio: id_comercio
            }, '-created_date', 1);
            if (query.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });

            await base44.asServiceRole.entities.Comercio.update(query[0].id, {
                activo: active,
                updated_at: new Date().toISOString()
            });
            return Response.json({ success: true });
        }

        return Response.json({ error: 'Action not supported' }, { status: 400 });

    } catch (error) {
        console.error('GESTIONAR_SOLICITUDES_ERROR:', error);
        return Response.json({
            error: 'Backend Failure',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});
