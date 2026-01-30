
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json();

        // 1. Fetch Ordenes (para ventas)
        const ordRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden?commerce_code=${encodeURIComponent(commerce_code)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });
        const ordenes = ordRes.ok ? await ordRes.json() : [];

        // 2. Fetch Productos (para stock)
        const prodRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto?commerce_code=${encodeURIComponent(commerce_code)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });
        const productos = prodRes.ok ? await prodRes.json() : [];

        // Calcular
        const ventasTotales = ordenes.filter(o => o.estado_orden === 'pagado').reduce((acc, o) => acc + (o.total || 0), 0);
        const ordenesPendientes = ordenes.filter(o => o.estado_orden === 'pendiente_pago').length;
        const lowStock = productos.filter(p => p.stock_actual <= (p.stock_minimo_alerta || 5)).length;

        return Response.json({
            success: true,
            stats: {
                ventas_totales: ventasTotales,
                ordenes_pendientes: ordenesPendientes,
                productos_bajo_stock: lowStock,
                total_productos: productos.length
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
