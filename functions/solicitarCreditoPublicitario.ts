// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const {
            id_comercio,
            commerce_code: legacyCode,
            monto,
            transaction_id,
            consumo_preferencia, // e.g., "2000 pesos por dia"
            platform // default "Meta Ads"
        } = body;

        const commerce_code = id_comercio || legacyCode;

        if (!commerce_code || !transaction_id || !monto) {
            return Response.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // Crear Solicitud (SDK Create)
        const nuevaSolicitud = await adminClient.entities.GastoPublicitario.create({
            commerce_code,
            monto: Number(monto),
            transaction_id,
            consumo_preferencia: consumo_preferencia || 'A definir',
            status: 'pending', // pending, approved, rejected
            tipo: 'solicitud_carga',
            plataforma: platform || 'Meta Ads',
            created_at: new Date().toISOString()
        });

        return Response.json({
            success: true,
            solicitud: nuevaSolicitud
        });

    } catch (error) {
        console.error('Error solicitarCreditoPublicitario:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
