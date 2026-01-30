
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, monto, plataforma, fecha } = await req.json();

        const payload = {
            commerce_code: commerce_code,
            monto: monto,
            plataforma: plataforma || 'Meta Ads',
            fecha: fecha || new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/GastoPublicitario`, {
            method: 'POST',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error registrando gasto");

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
