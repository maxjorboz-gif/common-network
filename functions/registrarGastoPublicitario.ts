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
            id_comercio,
            fecha,
            monto,
            plataforma,
            campana
        } = await req.json();

        if (!id_comercio || !fecha || !monto) {
            return Response.json({ error: 'Faltan datos obligatorios (id_comercio, fecha, monto)' }, { status: 400 });
        }

        const gasto = await base44.asServiceRole.entities.GastoPublicitario.create({
            id_comercio: id_comercio,
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
