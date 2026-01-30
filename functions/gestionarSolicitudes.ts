
// @ts-nocheck
// Gestión de Solicitudes y Comercios
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        let body;
        try { body = await req.json(); } catch { body = {}; }
        const { action, id_registro, commerce_code, active, id } = body;

        if (action === 'list') {
            // USAR PATRON FETCH (READ Entities)
            const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio`, {
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Error leyendo comercios de Base44");
            const allComercios = await response.json();

            // Mapeo Frontend
            const listado = allComercios.map(c => {
                const esPendiente = c.estado_registro !== 'activo' && c.estado_registro !== 'rechazado';
                return {
                    ...c,
                    id_registro: c._id || c.id,
                    nombre_comercio: c.nombre_comercio, // Correct Field Name
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
            // USAR PATRON UPDATE (PUT)
            const updateUrl = `https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio/${id_registro}`;
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado_registro: 'activo',
                    activo: true
                })
            });
            const result = await response.json();
            return Response.json({ success: true, data: result });
        }

        if (action === 'toggle_active') {
            // BUSQUEDA por commerce_code si falta ID
            let targetId = id;
            if (!targetId && commerce_code) {
                const search = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio?commerce_code=${encodeURIComponent(commerceCode)}`, {
                    headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
                });
                const found = await search.json();
                if (found && found.length > 0) targetId = found[0]._id || found[0].id;
            }

            if (!targetId) return Response.json({ error: "ID no encontrado" });

            // UPDATE
            await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio/${targetId}`, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activo: active })
            });

            return Response.json({ success: true });
        }

        if (action === 'delete') {
            if (!id) return Response.json({ error: "Se requiere ID" }, { status: 400 });

            // USAR PATRON DELETE
            const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio/${id}`, {
                method: 'DELETE',
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });

            if (!response.ok) return Response.json({ success: false, error: "No se pudo eliminar el comercio" });

            return Response.json({ success: true, message: "Comercio eliminado" });
        }

        return Response.json({ error: 'Accion desconocida' });

    } catch (error) {
        return Response.json({ success: false, error: error.message });
    }
});
