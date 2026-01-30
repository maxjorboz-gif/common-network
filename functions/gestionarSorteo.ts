// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_SORTEO = `https://app.base44.com/api/apps/${APP_ID}/entities/Sorteo`;

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

        // --- ACCIÓN: LISTAR ---
        if (action === 'list') {
            const res = await fetch(`${URL_SORTEO}?commerce_code=${commerce_code}`, {
                headers: { 'api_key': API_KEY }
            });
            const list = await res.json();
            return Response.json({ success: true, sorteos: Array.isArray(list) ? list : [] });
        }

        // --- ACCIÓN: OBTENER ACTIVO (Para el Frontend) ---
        if (action === 'get_active') {
            const res = await fetch(`${URL_SORTEO}?commerce_code=${commerce_code}&activo=true`, {
                headers: { 'api_key': API_KEY }
            });
            const activos = await res.json();
            // Retornamos el más reciente si hay varios activos por error
            return Response.json({
                success: true,
                sorteo: Array.isArray(activos) && activos.length > 0 ? activos[0] : null
            });
        }

        // --- ACCIÓN: CREAR ---
        if (action === 'create') {
            // Antes de crear uno activo, podríamos desactivar los anteriores
            const payload = {
                ...data,
                commerce_code,
                total_participantes: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const res = await fetch(URL_SORTEO, {
                method: 'POST',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al crear el sorteo");
            const nuevoSorteo = await res.json();
            return Response.json({ success: true, sorteo: nuevoSorteo });
        }

        // --- ACCIÓN: ACTUALIZAR (Toggles, Cambio de premios, etc) ---
        if (action === 'update') {
            if (!sorteoId) return Response.json({ error: 'Falta sorteoId' }, { status: 400 });

            const res = await fetch(`${URL_SORTEO}/${sorteoId}`, {
                method: 'PATCH',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    updated_at: new Date().toISOString()
                })
            });

            if (!res.ok) throw new Error("Error al actualizar el sorteo");
            const actualizado = await res.json();
            return Response.json({ success: true, sorteo: actualizado });
        }

        // --- ACCIÓN: ELIMINAR ---
        if (action === 'delete') {
            if (!sorteoId) return Response.json({ error: 'Falta sorteoId' }, { status: 400 });

            const res = await fetch(`${URL_SORTEO}/${sorteoId}`, {
                method: 'DELETE',
                headers: { 'api_key': API_KEY }
            });

            if (!res.ok) throw new Error("Error al eliminar el sorteo");
            return Response.json({ success: true, mensaje: "Sorteo eliminado" });
        }

        return Response.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error("Error en gestionarSorteo:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
