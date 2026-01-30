// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { ordenId, notas } = await req.json();

        if (!ordenId) return Response.json({ error: "Falta ID de orden" }, { status: 400 });

        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden/${ordenId}`, {
            method: 'PUT',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado_orden: 'pagado',
                metodo_pago: 'Manual/Transferencia',
                notas_admin: notas || 'Pago confirmado manualmente',
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error("Error confirmando pago manual");

        return Response.json({ success: true, message: "Pago confirmado manualmente" });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});