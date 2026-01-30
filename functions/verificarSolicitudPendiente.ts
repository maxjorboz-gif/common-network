
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { id_solicitud } = await req.json();

        // PATRON FETCH GET Single
        const res = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio/${id_solicitud}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!res.ok) return Response.json({ status: 'not_found' });

        const comercio = await res.json();

        return Response.json({
            status: comercio.estado_registro, // pendiente_pago, pendiente_aprobacion, activo
            activo: comercio.activo,
            commerce_code: comercio.commerce_code
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
