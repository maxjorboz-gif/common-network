
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { itemId, cantidad, sessionId } = await req.json(); // itemId es el ID del registro Carrito

        if (cantidad <= 0) {
            // DELETE (Si cantidad es 0 o menos, borrar)
            await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito/${itemId}`, {
                method: 'DELETE',
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });
        } else {
            // UPDATE cantidad
            await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito/${itemId}`, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad: cantidad })
            });
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
