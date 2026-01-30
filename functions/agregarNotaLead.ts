// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Lead`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { leadId, nota } = await req.json();

        if (!leadId || !nota) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // 1. Obtener lead por ID para validar existencia
        const responseLead = await fetch(`${BASE_URL}/${leadId}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseLead.ok) {
            return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
        }

        // 2. Actualizar notas (PATCH)
        const updateResponse = await fetch(`${BASE_URL}/${leadId}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notas: nota,
                fecha_ultimo_contacto: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando lead: ${errorText}`);
        }

        // 3. Obtener lead actualizado
        const finalResponse = await fetch(`${BASE_URL}/${leadId}`, {
            headers: { 'api_key': API_KEY }
        });
        const leadActualizado = await finalResponse.json();

        return Response.json({
            success: true,
            lead: leadActualizado
        });

    } catch (error) {
        console.error('Error agregarNotaLead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});