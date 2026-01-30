
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json();

        // 1. Fetch Productos
        const prodRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto?commerce_code=${encodeURIComponent(commerce_code)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!prodRes.ok) return Response.json({ destacados: [], nuevos: [] });
        const productos = await prodRes.json();

        const activos = productos.filter(p => p.activo !== false);

        // Lógica de negocio simple
        const destacados = activos.filter(p => p.destacado === true);
        const nuevos = activos.slice(0, 5); // Simulación "nuevos" (últimos 5)

        return Response.json({
            success: true,
            destacados: destacados,
            nuevos: nuevos
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
