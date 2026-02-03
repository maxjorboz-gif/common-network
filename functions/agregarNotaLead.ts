// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { leadId, nota } = await req.json();

        if (!leadId || !nota) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Obtener lead por ID (SDK Get) checks existance implicitly
        // but we'll proceed to update. SDK update might return error if not found? 
        // Or we can just update.

        // 2. Actualizar notas (SDK Update)
        await adminClient.entities.Lead.update(leadId, {
            notas: nota,
            fecha_ultimo_contacto: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        // 3. Obtener lead actualizado (SDK Get)
        const leadActualizado = await adminClient.entities.Lead.get(leadId);

        return Response.json({
            success: true,
            lead: leadActualizado
        });

    } catch (error) {
        console.error('Error agregarNotaLead:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});