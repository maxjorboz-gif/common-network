
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json();

        // PATRON FETCH List
        const url = `https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden?commerce_code=${encodeURIComponent(commerceCode)}`;

        const response = await fetch(url, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!response.ok) throw new Error("Error fetching Ordenes");

        const ordenes = await response.json();

        // Normalizamos
        const ordenesNorm = ordenes.map(o => ({
            ...o,
            id: o._id || o.id
        }));

        return Response.json({ success: true, ordenes: ordenesNorm });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
