// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { idCliente, porcentajeDescuento, validezMinutos = 15, id_comercio } = await req.json();

    if (!idCliente || !porcentajeDescuento || !id_comercio) {
      return Response.json({
        error: 'Faltan parámetros: idCliente, porcentajeDescuento, id_comercio'
      }, { status: 400 });
    }

    // Calcula expiración
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + validezMinutos);

    // Generar código único corto
    const codigo = `OFF${porcentajeDescuento}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const cupon = await base44.asServiceRole.entities.CuponNegociacion.create({
      codigo,
      id_cliente: idCliente,
      id_comercio: id_comercio,
      descuento_porcentaje: porcentajeDescuento,
      fecha_expiracion: expiracion.toISOString(),
      usado: false
    });

    return Response.json({
      success: true,
      cupon
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
