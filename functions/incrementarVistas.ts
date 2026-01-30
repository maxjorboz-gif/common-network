
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId } = await req.json();

        // 1. Get current
        const getRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${productoId}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (getRes.ok) {
            const prod = await getRes.json();
            const nuevasVistas = (prod.vistas_totales || 0) + 1;

            // 2. Put Update
            await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${productoId}`, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vistas_totales: nuevasVistas })
            });
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});