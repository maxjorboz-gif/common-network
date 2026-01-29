// @ts-nocheck
// Gestión de Solicitudes y Comercios (Backend Puro V3)
// Lee y gestiona la Entity 'Comercio' directamente.

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        let body;
        try { body = await req.json(); } catch { body = {}; }
        const { action, id_registro, commerce_code, active, id } = body;

        console.log("GestionarSolicitudes Action:", action);

        if (action === 'list') {
            // Leemos TODOS los comercios
            const response = await fetch(BASE44_URL, {
                headers: { 'api_key': API_KEY }
            });

            if (!response.ok) throw new Error("Error leyendo comercios de Base44");
            const allComercios = await response.json();

            // Clasificamos para el Frontend
            const listado = allComercios.map(c => {
                const esPendiente = c.estado_registro !== 'activo' && c.estado_registro !== 'rechazado';
                return {
                    // Datos crudos
                    ...c,

                    // Adaptadores para UI vieja
                    id_registro: c._id || c.id, // ID real de la entity
                    nombre_comercio: c.nombre,
                    email_admin: c.email_negocio,
                    aprobacion_pendiente: esPendiente,
                    activo: c.activo || (!esPendiente),
                    id_comercio: c.commerce_code || "PENDIENTE",
                    pago_confirmado: c.numero_operacion && c.numero_operacion !== 'PENDIENTE'
                };
            });

            return Response.json({ success: true, solicitudes: listado });
        }

        if (action === 'approve') {
            // Aprobar significa cambiar estado a 'activo'
            const updateUrl = `${BASE44_URL}/${id_registro}`;
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado_registro: 'activo',
                    activo: true
                })
            });

            const result = await response.json();
            return Response.json({ success: true, data: result });
        }

        if (action === 'toggle_active') {
            // Necesitamos el ID para hacer update. Si viene commerce_code, hay que buscarlo primero.
            // Para simplificar, asumimos que el frontend manda el ID real o que buscamos.

            // BUSQUEDA por commerce_code si no hay ID directo
            let targetId = id;
            if (!targetId && commerce_code) {
                const search = await fetch(`${BASE44_URL}?commerce_code=${commerce_code}`, { headers: { 'api_key': API_KEY } });
                const found = await search.json();
                if (found && found.length > 0) targetId = found[0]._id || found[0].id;
            }

            if (!targetId) return Response.json({ error: "ID no encontrado" });

            const updateUrl = `${BASE44_URL}/${targetId}`;
            await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: active }) // Ojo: Base44 usa 'active' o 'activo'? Entity definio 'activo'
            });

            // Update correcto con nombre de campo correcto
            await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: active })
            });

            return Response.json({ success: true });
        }

        if (action === 'resetData') {
            // DANGER: Borrar todo. Solo para admins locos.
            // Fetch list -> Delete loop
            const listResponse = await fetch(BASE44_URL, { headers: { 'api_key': API_KEY } });
            const all = await listResponse.json();

            let deletedCount = 0;
            for (const item of all) {
                await fetch(`${BASE44_URL}/${item._id || item.id}`, {
                    method: 'DELETE',
                    headers: { 'api_key': API_KEY }
                });
                deletedCount++;
            }

            return Response.json({ success: true, message: `Borrados ${deletedCount} registros.` });
        }

        return Response.json({ error: 'Accion desconocida' });

    } catch (error) {
        console.error("Error Gestionar:", error);
        return Response.json({ success: false, error: error.message });
    }
});
