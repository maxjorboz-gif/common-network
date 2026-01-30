
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { sessionId, commerce_code } = await req.json(); // Carrito anónimo usa sessionId

        if (!sessionId) return Response.json({ items: [], subtotal: 0 });

        // FETCH Carrito
        // Entidad: 'Carrito'
        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito?session_id=${encodeURIComponent(sessionId)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!response.ok) return Response.json({ items: [], subtotal: 0 });

        const carritos = await response.json();

        // Si hay items, calcular total (o lo hace el backend legacy?)
        // Devolvemos la lista limpia
        if (carritos && carritos.length > 0) {
            // Asumimos que la entidad Carrito guarda items individuales o un objeto completo.
            // Si es por items: carritos es la lista.
            return Response.json({ success: true, items: carritos });
        }

        return Response.json({ success: true, items: [] });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
