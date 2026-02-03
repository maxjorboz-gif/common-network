// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { carritoId, codigoCupon, commerce_code, id_comercio: legacyId } = await req.json();
        const id_comercio_final = commerce_code || legacyId;

        if (!carritoId || !codigoCupon || !id_comercio_final) {
            return Response.json({ error: 'Faltan datos (commerce_code requerido)' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Buscar Cupón (SDK)
        const cupones = await adminClient.entities.Cupon.filter({
            codigo: codigoCupon,
            commerce_code: id_comercio_final,
            activo: true
        });

        const cupon = Array.isArray(cupones) && cupones.length > 0 ? cupones[0] : null;

        if (!cupon) {
            return Response.json({ error: 'Cupón inválido o expirado' }, { status: 404 });
        }

        // 2. Validaciones
        if (cupon.fecha_fin && new Date(cupon.fecha_fin) < new Date()) {
            return Response.json({ error: 'El cupón ha expirado' }, { status: 400 });
        }

        if (cupon.usos_maximos && cupon.usos_actuales >= cupon.usos_maximos) {
            return Response.json({ error: 'El cupón ha alcanzado su límite de usos' }, { status: 400 });
        }

        return Response.json({
            success: true,
            tipo: cupon.tipo,
            valor: cupon.valor,
            minimo_compra: cupon.minimo_compra,
            mensaje: cupon.tipo === 'porcentaje' ? `Descuento del ${cupon.valor}% aplicado` : `Descuento de $${cupon.valor} aplicado`
        });

    } catch (error) {
        console.error('Error aplicarCupon:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
