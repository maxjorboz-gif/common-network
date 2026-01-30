
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { ordenId, nuevoEstado } = await req.json();

        // PATRON UPDATE
        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden/${ordenId}`, {
            method: 'PUT',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado_orden: nuevoEstado,
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error("Error actualizando Orden");

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
