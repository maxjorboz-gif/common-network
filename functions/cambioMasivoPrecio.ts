
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productosIds, tipo, valor, modo } = await req.json(); // tipo: increase/decrease, modo: percentage/fixed

        if (!productosIds || productosIds.length === 0) return Response.json({ actualizados: 0 });

        let actualizados = 0;

        // No hay "updateMany" en la API REST simple, así que iteramos (lento pero efectivo)
        // 1. Fetch de productos para leer precio actual
        // Optimización: Fetch all y filtrar en memoria si son muchos, o fetch individual. 
        // Asumimos fetch individual por seguridad.

        for (const id of productosIds) {
            // GET
            const getRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${id}`, {
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });

            if (getRes.ok) {
                const prod = await getRes.json();
                let nuevoPrecio = prod.precio_estandar;

                const monto = parseFloat(valor);

                if (modo === 'percentage') {
                    const factor = 1 + (monto / 100);
                    nuevoPrecio = tipo === 'increase' ? nuevoPrecio * factor : nuevoPrecio / factor;
                } else {
                    nuevoPrecio = tipo === 'increase' ? nuevoPrecio + monto : nuevoPrecio - monto;
                }

                // PUT Update
                await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${id}`, {
                    method: 'PUT',
                    headers: {
                        'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ precio_estandar: parseFloat(nuevoPrecio.toFixed(2)) })
                });
                actualizados++;
            }
        }

        return Response.json({ success: true, actualizados });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});