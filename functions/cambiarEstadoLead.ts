// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

        const { leadId, nuevoEstado } = await req.json();

        // UPDATE DIRECTO
        await base44.asServiceRole.entities.Lead.update(leadId, {
            estado: nuevoEstado, // Confiamos en el input del admin
            fecha_ultimo_contacto: new Date().toISOString()
        });

        // Retornar lead actualizado
        const lead = await base44.asServiceRole.entities.Lead.get(leadId);
        return Response.json({ success: true, lead });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});