
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { sessionId, producto, cantidad, commerce_code } = await req.json();

        if (!sessionId || !producto) return Response.json({ error: "Datos incompletos" }, { status: 400 });

        // 1. Check si ya existe el item en el carrito (Upsert logic manual)
        // Buscamos sesion + producto
        const query = `session_id=${encodeURIComponent(sessionId)}&product_id=${encodeURIComponent(producto.id)}`;
        const checkRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito?${query}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        const existingItems = await checkRes.json();

        if (existingItems && existingItems.length > 0) {
            // UPDATE cantidad
            const item = existingItems[0];
            const nuevaCantidad = item.cantidad + cantidad;

            await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito/${item._id || item.id}`, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            });

        } else {
            // CREATE nuevo item
            const payload = {
                session_id: sessionId,
                commerce_code: commerce_code,
                product_id: producto.id,
                titulo: producto.titulo,
                precio: producto.precio_estandar, // Snapshot del precio
                cantidad: cantidad,
                imagen: producto.imagen_principal || (producto.fotos && producto.fotos[0]?.url),
                created_at: new Date().toISOString()
            };

            await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito`, {
                method: 'POST',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        }

        return Response.json({ success: true, message: "Agregado al carrito" });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
