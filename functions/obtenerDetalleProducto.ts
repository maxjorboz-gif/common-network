
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { slug, id } = await req.json(); // Puede venir por slug o id

        let producto = null;

        if (id) {
            const res = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${id}`, {
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });
            if (res.ok) producto = await res.json();
        } else if (slug) {
            // Si el front usa slug, buscamos via filter (asumiendo campo slug existe o usamos titulo)
            const res = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto?slug=${encodeURIComponent(slug)}`, {
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });
            if (res.ok) {
                const list = await res.json();
                if (list.length > 0) producto = list[0];
            }
        }

        if (!producto) return Response.json({ error: "Producto no encontrado" }, { status: 404 });

        // Traer atributos relacionados
        const attrRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto?id_producto=${producto._id || producto.id}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        }); // Asumiendo que podemos filtrar por id_producto. Si no, fetch all y filter en memoria.

        let atributos = [];
        if (attrRes.ok) {
            const all = await attrRes.json();
            // Si la API no filtró (retornó todos), filtramos manual
            atributos = all.filter(a => a.id_producto === (producto._id || producto.id));
        }

        return Response.json({
            success: true,
            producto: {
                ...producto,
                atributos: atributos
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
