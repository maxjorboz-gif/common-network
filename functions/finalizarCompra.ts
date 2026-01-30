
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, cliente, items, total, metodo_pago } = await req.json();

        // 1. Crear Orden (CREATE)
        const ordenPayload = {
            commerce_code: commerce_code,
            cliente_nombre: cliente.nombre,
            cliente_email: cliente.email,
            cliente_telefono: cliente.telefono,
            cliente_direccion: cliente.direccion,
            items: items, // Guardamos items embebidos o relacionados? Base44 permite JSON? SI.
            total: total,
            metodo_pago: metodo_pago,
            estado_orden: 'pendiente_pago',
            created_at: new Date().toISOString()
        };

        const createRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden`, {
            method: 'POST',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ordenPayload)
        });

        if (!createRes.ok) throw new Error("Error creando orden");
        const orden = await createRes.json();

        // 2. Limpiar Carrito (Opcional, si tenemos session_id)
        // No tenemos session_id aquí en el payload, asumimos que el front se encarga o lo enviamos

        return Response.json({
            success: true,
            ordenId: orden.id || orden._id,
            mensaje: "Orden creada"
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
