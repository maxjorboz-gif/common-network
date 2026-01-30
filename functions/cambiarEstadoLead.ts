// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Lead";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { leadId, nuevoEstado } = await req.json();

        if (!leadId || !nuevoEstado) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // 1. ACTUALIZACIÓN DIRECTA (PATCH) usando la constante BASE_URL
        const updateResponse = await fetch(`${BASE_URL}/${leadId}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: nuevoEstado,
                fecha_ultimo_contacto: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando lead: ${errorText}`);
        }

        // 2. OBTENER LEAD ACTUALIZADO (GET)
        const getResponse = await fetch(`${BASE_URL}/${leadId}`, {
            headers: { 'api_key': API_KEY }
        });

        const lead = await getResponse.json();

        return Response.json({ success: true, lead });

    } catch (error) {
        console.error('Error cambiarEstadoLead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});