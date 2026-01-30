
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId, activo } = await req.json();

        if (!productoId) return Response.json({ error: "Falta ID" }, { status: 400 });

        // PATRON UPDATE (PATCH/PUT)
        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${productoId}`, {
            method: 'PUT',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo: activo })
        });

        if (!response.ok) throw new Error("Error actualizando estado producto");

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});