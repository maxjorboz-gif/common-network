// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { ordenId, nuevoEstado } = await req.json();

        if (!ordenId || !nuevoEstado) {
            return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        // 1. OBTENER ORDEN (Usando constante BASE_URL)
        const responseOrden = await fetch(`${BASE_URL}/${ordenId}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseOrden.ok) {
            return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
        }
        const orden = await responseOrden.ok ? await responseOrden.json() : null;
        if (!orden) return Response.json({ error: 'Orden no encontrada' }, { status: 404 });

        // 2. ACTUALIZAR ORDEN (PATCH) utilizando la constante BASE_URL
        const updateData = {
            estado: nuevoEstado,
            updated_at: new Date().toISOString()
        };

        // Timestamps de auditoría simples
        if (nuevoEstado === 'ENVIADA') updateData.fecha_envio = new Date().toISOString();
        if (nuevoEstado === 'ENTREGADA') updateData.fecha_entrega = new Date().toISOString();
        if (nuevoEstado === 'CANCELADA') updateData.fecha_cancelacion = new Date().toISOString();

        const updateResponse = await fetch(`${BASE_URL}/${ordenId}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando orden: ${errorText}`);
        }

        return Response.json({
            success: true,
            message: `Orden actualizada a ${nuevoEstado}`,
            nuevo_estado: nuevoEstado
        });

    } catch (error) {
        console.error('Error cambiarEstadoOrden:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
