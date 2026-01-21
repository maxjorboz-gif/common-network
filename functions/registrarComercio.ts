// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

function generateSovereignId(num) {
    return num.toString().padStart(6, '0');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me(); // Verify auth

        if (!user) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { nombre_comercio } = await req.json();

        if (!nombre_comercio) {
            return Response.json({ error: 'Nombre de comercio requerido' }, { status: 400 });
        }

        // 1. Check if user already has a commerce
        const existingCommerce = await base44.asServiceRole.entities.Comercio.filter({
            email_admin: user.email
        }, '-created_date', 1);

        if (existingCommerce.length > 0) {
            const comercioExistente = existingCommerce[0];
            // Si ya tiene ID, todo joya, devolvemos eso.
            if (comercioExistente.id_comercio) {
                return Response.json({
                    success: true,
                    message: 'Usuario ya tiene comercio activo',
                    id_comercio: comercioExistente.id_comercio
                });
            }
            // Si existe el registro pero NO tiene ID (caso raro/viejo), 
            // no retornamos todavía, dejamos que el código de abajo le asigne uno.
            // Solo logueamos para saber.
            console.log("Usuario tiene registro 'huérfano' sin ID. Asignando uno nuevo...");
        }

        // 2. Generate Next ID
        // Note: In a high-concurrency real app, this needs atomic increment or a specialized service.
        // For MVP/Single Node, this is acceptable.
        const todosLosComercios = await base44.asServiceRole.entities.Comercio.list('-created_date', 1000);

        let maxActual = 0;
        todosLosComercios.forEach((c) => {
            if (c.id_comercio) {
                const num = parseInt(c.id_comercio, 10);
                if (!isNaN(num) && num > maxActual) maxActual = num;
            }
        });

        const nuevoIdSoberano = generateSovereignId(maxActual + 1);

        // 3. Create or Update Commerce
        let nuevoComercio;

        if (existingCommerce.length > 0) {
            // Caso Huérfano: Actualizamos el existente
            const idExistente = existingCommerce[0].id;
            await base44.asServiceRole.entities.Comercio.update(idExistente, {
                id_comercio: nuevoIdSoberano,
                nombre_comercio: nombre_comercio, // Actualizamos nombre por si quiso cambiarlo
                updated_at: new Date().toISOString(),
                activo: true,
                configuracion: {
                    nombre_tienda: nombre_comercio,
                    color_primario: "#ea580c"
                }
            });
            nuevoComercio = { ...existingCommerce[0], id_comercio: nuevoIdSoberano };
        } else {
            // Caso Nuevo: Creamos de cero
            nuevoComercio = await base44.asServiceRole.entities.Comercio.create({
                email_admin: user.email,
                user_id: user.id,
                id_comercio: nuevoIdSoberano,
                nombre_comercio: nombre_comercio,
                created_at: new Date().toISOString(),
                activo: true,
                configuracion: {
                    nombre_tienda: nombre_comercio,
                    color_primario: "#ea580c"
                }
            });
        }

        return Response.json({
            success: true,
            id_comercio: nuevoIdSoberano,
            comercio: nuevoComercio
        });

    } catch (error) {
        console.error('Error registrarComercio:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
