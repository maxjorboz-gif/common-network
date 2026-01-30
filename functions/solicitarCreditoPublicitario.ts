// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_SOLICITUD = `https://app.base44.com/api/apps/${APP_ID}/entities/SolicitudCredito`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const {
            commerce_code,
            monto,
            transaction_id,
            consumo_preferencia, // e.g., "2000 pesos por dia"
            platform // default "Meta Ads"
        } = body;

        if (!commerce_code || !transaction_id || !monto) {
            return Response.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        // Crear Solicitud
        const response = await fetch(URL_SOLICITUD, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commerce_code,
                monto: Number(monto),
                transaction_id,
                consumo_preferencia: consumo_preferencia || 'A definir',
                status: 'pending', // pending, approved, rejected
                plataforma: platform || 'Meta Ads',
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Error creando solicitud: ${await response.text()}`);
        }

        const data = await response.json();

        return Response.json({
            success: true,
            solicitud: data
        });

    } catch (error) {
        console.error('Error solicitarCreditoPublicitario:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
