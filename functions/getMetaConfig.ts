
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json();

        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio?commerce_code=${encodeURIComponent(commerce_code)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!response.ok) return Response.json({ success: true, pixelId: null, token: null });

        const configs = await response.json();
        const config = (configs && configs.length > 0) ? configs[0] : null;

        if (config) {
            return Response.json({
                success: true,
                pixelId: config.meta_pixel_id,
                accessToken: config.meta_access_token,
                testEventCode: config.meta_test_event_code
            });
        }

        return Response.json({ success: true, pixelId: null });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});