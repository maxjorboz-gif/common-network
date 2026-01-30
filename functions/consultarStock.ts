
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId } = await req.json();

        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${productoId}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!response.ok) return Response.json({ stock: 0 });

        const prod = await response.json();

        return Response.json({
            success: true,
            stock: prod.stock_actual || 0,
            activo: prod.activo
        });

    } catch (error) {
        return Response.json({ stock: 0 });
    }
});