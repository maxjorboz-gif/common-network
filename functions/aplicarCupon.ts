// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // RECIBIMOS id_comercio ESTANDARIZADO
        const { carritoId, codigoCupon, id_comercio } = await req.json();

        if (!carritoId || !codigoCupon || !id_comercio) {
            return Response.json({ error: 'Faltan datos (id_comercio requerido)' }, { status: 400 });
        }

        // Buscar Cupón
        const cupones = await base44.asServiceRole.entities.CuponNegociacion.filter({
            codigo: codigoCupon,
            id_comercio: id_comercio, // Filtramos por comercio para evitar colisiones en marca blanca
            usado: false
        }, '-created_date', 1);

        const cupon = cupones[0];

        if (!cupon) {
            return Response.json({ error: 'Cupón inválido o expirado' }, { status: 404 });
        }

        // Validar fecha
        if (new Date(cupon.fecha_expiracion) < new Date()) {
            return Response.json({ error: 'El cupón ha expirado' }, { status: 400 });
        }

        // Marcar como usado (si es de uso único)
        // Ojo: Si quisiéramos que se use solo al FINALIZAR compra, no deberíamos marcarlo aquí,
        // pero por ahora mantenemos la lógica simple de validación.
        // Lo ideal sería solo retornarlo válido y que finalizarCompra lo queme.

        return Response.json({
            success: true,
            descuento: cupon.descuento_porcentaje,
            mensaje: `Descuento del ${cupon.descuento_porcentaje}% aplicado`
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
