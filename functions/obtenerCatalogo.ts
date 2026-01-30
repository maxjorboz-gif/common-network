
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json();

        // 1. GET Productos Filtrados
        const prodRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto?commerce_code=${encodeURIComponent(commerce_code)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!prodRes.ok) throw new Error("Error fetching catalogo");
        const productos = await prodRes.json();

        // Filtrar activos solo
        const activos = productos.filter(p => p.activo !== false);

        // Opcional: Traer atributos si se necesitan para filtros
        // Para catálogo simple, devolvemos productos.

        return Response.json({ success: true, productos: activos });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
