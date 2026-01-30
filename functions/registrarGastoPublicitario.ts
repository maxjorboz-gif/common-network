// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_GASTO = `https://app.base44.com/api/apps/${APP_ID}/entities/GastoPublicitario`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const {
            commerce_code,
            id_comercio: legacyId,
            fecha,
            monto,
            plataforma,
            campana,
            creado_por
        } = body;

        const id_comercio_final = commerce_code || legacyId;

        if (!id_comercio_final || !fecha || !monto) {
            return Response.json({ error: 'Faltan datos obligatorios (commerce_code, fecha, monto)' }, { status: 400 });
        }

        // 1. Crear Gasto Publicitario (URL Directa)
        const response = await fetch(URL_GASTO, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commerce_code: id_comercio_final,
                fecha,
                monto: Number(monto),
                plataforma: plataforma || 'Meta Ads',
                campana: campana || 'General',
                creado_por: creado_por || 'Sistema',
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error registrando gasto: ${errorText}`);
        }

        const gasto = await response.json();

        return Response.json({
            success: true,
            gasto
        });

    } catch (error) {
        console.error('Error registrarGastoPublicitario:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
