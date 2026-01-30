
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId } = await req.json();

        if (!productoId) return Response.json({ error: "Falta ID" }, { status: 400 });

        // PATRON DELETE
        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${productoId}`, {
            method: 'DELETE',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91'
            }
        });

        if (!response.ok) throw new Error("Error eliminando producto");

        // También deberíamos eliminar atributos (limpieza), pero DELETE cascada no siempre es automático.
        // Lo dejamos simple por ahora o implementamos delete loop si es crítico.

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});