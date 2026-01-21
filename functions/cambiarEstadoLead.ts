import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { leadId, nuevoEstado } = await req.json();

        if (!leadId || !nuevoEstado) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        const estadosValidos = ['nuevo', 'contactado', 'en_negociacion', 'convertido', 'perdido'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return Response.json({ error: 'Estado inválido' }, { status: 400 });
        }

        // Obtener lead por ID
        const lead = await base44.asServiceRole.entities.Lead.get(leadId);
        if (!lead) {
            return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
        }

        // Actualizar estado
        await base44.asServiceRole.entities.Lead.update(leadId, {
            estado: nuevoEstado,
            fecha_ultimo_contacto: new Date().toISOString()
        });

        const leadActualizado = await base44.asServiceRole.entities.Lead.get(leadId);

        return Response.json({
            success: true,
            lead: leadActualizado
        });

    } catch (error) {
        console.error('Error cambiarEstadoLead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});