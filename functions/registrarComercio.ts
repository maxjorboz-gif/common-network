
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const { action, ...data } = body;

        // --- UPDATE PAYMENT (PUT) ---
        if (action === 'update_payment') {
            const { id_solicitud, numero_operacion } = data;

            // Pattern: Update Entity
            const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio/${id_solicitud}`, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_operacion: numero_operacion,
                    estado_registro: 'pendiente_aprobacion',
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error("Error actualizando pago comercio");

            return Response.json({ success: true, step: 'payment_updated' });
        }

        // --- CREATE (POST) ---

        // 1. Check Duplicates (READ Pattern with Filter)
        const checkRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio?email_negocio=${encodeURIComponent(data.email)}`, {
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            }
        });

        if (checkRes.ok) {
            const existing = await checkRes.json();
            if (Array.isArray(existing) && existing.length > 0) {
                return Response.json({ success: false, error: "Este email ya está registrado." }, { status: 400 });
            }
        }

        // 2. Prepare Payload
        const commerceCode = Math.random().toString(36).substring(2, 12).toUpperCase();
        const payload = {
            nombre_comercio: data.nombre_comercio,
            nombre_usuario: data.full_name,
            email_negocio: data.email,
            password: data.password,
            whatsapp_negocio: data.whatsapp,
            commerce_code: commerceCode,
            estado_registro: "pendiente_pago",
            numero_operacion: "PENDIENTE",
            activo: false,
            plan: "bronce",
            created_at: new Date().toISOString()
        };

        // 3. Create (CREATE Pattern)
        const createRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio`, {
            method: 'POST',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!createRes.ok) throw new Error("Error creando comercio");
        const nuevoComercio = await createRes.json();

        return Response.json({
            success: true,
            id_solicitud: nuevoComercio.id || nuevoComercio._id,
            commerce_code: commerceCode
        });

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
