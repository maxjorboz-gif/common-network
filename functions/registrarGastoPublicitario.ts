// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const {
            commerce_code,
            id_comercio: legacyId,
            fecha,
            monto,
            plataforma,
            campana
        } = await req.json();

        const id_comercio_final = commerce_code || legacyId;

        if (!id_comercio_final || !fecha || !monto) {
            return Response.json({ error: 'Faltan datos obligatorios (commerce_code, fecha, monto)' }, { status: 400 });
        }

        const gasto = await base44.asServiceRole.entities.GastoPublicitario.create({
            commerce_code: id_comercio_final,
            fecha,
            monto: Number(monto),
            plataforma: plataforma || 'Meta Ads',
            campana: campana || 'General',
            creado_por: user.email
        });

        return Response.json({
            success: true,
            gasto
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
