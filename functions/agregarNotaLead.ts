
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { leadId, nota, autor } = await req.json();

        // 1. Get Lead
        const getRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Lead/${leadId}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!getRes.ok) throw new Error("Lead no encontrado");
        const lead = await getRes.json();

        // 2. Append Note
        const historial = lead.historial_seguimiento || [];
        historial.push({
            fecha: new Date().toISOString(),
            accion: 'nota_agregada',
            detalle: nota,
            usuario: autor || 'Admin'
        });

        // 3. Update Lead
        const updateRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Lead/${leadId}`, {
            method: 'PUT',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                historial_seguimiento: historial,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateRes.ok) throw new Error("Error guardando nota");

        return Response.json({ success: true, historial: historial });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});