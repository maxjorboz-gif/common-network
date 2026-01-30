
// @ts-nocheck
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_GASTO = `https://app.base44.com/api/apps/${APP_ID}/entities/GastoPublicitario`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code } = await req.json().catch(() => ({}));

        if (!commerce_code) {
            return Response.json({ error: 'Falta commerce_code' }, { status: 400 });
        }

        // 1. Obtener todos los gastos de este comercio (Activos)
        const queryUrl = `${URL_GASTO}?commerce_code=${commerce_code}`;
        const response = await fetch(queryUrl, { headers: { 'api_key': API_KEY } });

        if (!response.ok) throw new Error('Error al buscar gastos');

        const gastos = await response.json();

        // Filtrar solo los NO archivados
        const gastosActivos = gastos.filter(g => !g.archived);

        if (gastosActivos.length === 0) {
            return Response.json({ success: true, message: 'No hay gastos para resetear' });
        }

        // 2. Marcar como archivados (Soft Delete)
        // Esto permite mantener el histórico para auditoría pero "resetear" el contador visual
        let updated = 0;
        const promises = gastosActivos.map(async (g) => {
            const id = g.id || g._id;
            await fetch(`${URL_GASTO}/${id}`, {
                method: 'PATCH',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archived: true, archived_at: new Date().toISOString() })
            });
            updated++;
        });

        await Promise.all(promises);

        return Response.json({ success: true, count: updated });

    } catch (error) {
        console.error('Error resetGastoPublicitario:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
