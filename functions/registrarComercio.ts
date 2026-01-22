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

        const { nombre_comercio, whatsapp, numero_operacion } = await req.json();

        if (!nombre_comercio) {
            return Response.json({ error: 'Nombre de comercio requerido' }, { status: 400 });
        }

        const userEmail = user.email || "";
        const normalizedEmail = userEmail.toLowerCase().trim();

        // 1. Check if user already has a commerce
        const existingCommerce = await base44.asServiceRole.entities.Comercio.filter({
            email_admin: normalizedEmail
        }, '-created_date', 1);

        // 2. Generate Next ID (ID Soberano)
        const todosLosComercios = await base44.asServiceRole.entities.Comercio.list('-created_date', 1000);

        let maxActual = 0;
        todosLosComercios.forEach((c) => {
            if (c.id_comercio) {
                const num = parseInt(c.id_comercio, 10);
                if (!isNaN(num) && num > maxActual) maxActual = num;
            }
        });

        const nuevoIdSoberano = generateSovereignId(maxActual + 1);

        // 3. Create or Update Commerce (ALWAYS INACTIVE UNTIL SUPREME ADMIN APPROVAL)
        let nuevoComercio;

        const commerceData = {
            email_admin: normalizedEmail,
            user_id: user.id,
            id_comercio: nuevoIdSoberano,
            id_visual: nuevoIdSoberano,
            nombre_comercio: nombre_comercio,
            whatsapp: whatsapp || "",
            numero_operacion: numero_operacion || "",
            aprobacion_pendiente: true,
            activo: false, // BLOQUEADO HASTA QUE EL SUPREMO DIGA SI
            configuracion: {
                nombre_tienda: nombre_comercio,
                color_primario: "#ea580c"
            }
        };

        if (existingCommerce.length > 0) {
            const idExistente = existingCommerce[0].id;
            await base44.asServiceRole.entities.Comercio.update(idExistente, {
                ...commerceData,
                updated_at: new Date().toISOString()
            });
            nuevoComercio = { ...existingCommerce[0], ...commerceData };
        } else {
            nuevoComercio = await base44.asServiceRole.entities.Comercio.create({
                ...commerceData,
                created_at: new Date().toISOString()
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
