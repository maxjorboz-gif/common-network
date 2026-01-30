
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json(); // Filtro por comercio

        // PATRON FETCH List
        const url = `https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Lead${commerce_code ? '?commerce_code=' + encodeURIComponent(commerceCode) : ''}`;

        const response = await fetch(url, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!response.ok) throw new Error("Error fetching Leads");

        const leads = await response.json();

        // Normalizamos
        const leadsNorm = leads.map(l => ({
            ...l,
            id: l._id || l.id
        }));

        return Response.json({ success: true, leads: leadsNorm });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
