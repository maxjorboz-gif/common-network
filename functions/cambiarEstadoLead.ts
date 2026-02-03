// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { leadId, nuevoEstado } = await req.json();

        if (!leadId || !nuevoEstado) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. ACTUALIZACIÓN (SDK Update)
        await adminClient.entities.Lead.update(leadId, {
            estado: nuevoEstado,
            fecha_ultimo_contacto: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        // 2. OBTENER LEAD ACTUALIZADO (SDK Get)
        // SDK update returns nothing or partial. If full object needed:
        const lead = await adminClient.entities.Lead.get(leadId);

        return Response.json({ success: true, lead });

    } catch (error) {
        console.error('Error cambiarEstadoLead:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});