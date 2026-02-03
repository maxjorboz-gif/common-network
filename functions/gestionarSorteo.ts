// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * GESTIONAR SORTEOS (Lógica de Marketing)
 * Acciones: 'create', 'list', 'update', 'get_active', 'delete'
 */
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { action, commerce_code, sorteoId, data } = body;

        if (!commerce_code) {
            return Response.json({ error: 'Falta commerce_code' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // --- ACCIÓN: LISTAR ---
        if (action === 'list') {
            const list = await adminClient.entities.Sorteo.filter({
                commerce_code: commerce_code
            });
            return Response.json({ success: true, sorteos: Array.isArray(list) ? list : [] });
        }

        // --- ACCIÓN: OBTENER ACTIVO (Para el Frontend) ---
        if (action === 'get_active') {
            const activos = await adminClient.entities.Sorteo.filter({
                commerce_code: commerce_code,
                activo: true
            });
            // Retornamos el más reciente si hay varios activos por error
            return Response.json({
                success: true,
                sorteo: Array.isArray(activos) && activos.length > 0 ? activos[0] : null
            });
        }

        // --- ACCIÓN: CREAR ---
        if (action === 'create') {
            const payload = {
                ...data,
                commerce_code,
                total_participantes: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const nuevoSorteo = await adminClient.entities.Sorteo.create(payload);
            return Response.json({ success: true, sorteo: nuevoSorteo });
        }

        // --- ACCIÓN: ACTUALIZAR ---
        if (action === 'update') {
            if (!sorteoId) return Response.json({ error: 'Falta sorteoId' }, { status: 400 });

            await adminClient.entities.Sorteo.update(sorteoId, {
                ...data,
                updated_at: new Date().toISOString()
            });

            // SDK update returns nothing or partial. If full object needed:
            const actualizado = await adminClient.entities.Sorteo.get(sorteoId);
            return Response.json({ success: true, sorteo: actualizado });
        }

        // --- ACCIÓN: ELIMINAR ---
        if (action === 'delete') {
            if (!sorteoId) return Response.json({ error: 'Falta sorteoId' }, { status: 400 });

            // SDK DELETE
            // Assuming SDK has delete method if allowed by Base44
            await adminClient.entities.Sorteo.delete(sorteoId);

            return Response.json({ success: true, mensaje: "Sorteo eliminado" });
        }

        return Response.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error("Error en gestionarSorteo:", error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
