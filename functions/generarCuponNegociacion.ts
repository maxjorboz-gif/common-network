// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { idCliente, porcentajeDescuento, validezMinutos = 15, commerce_code, id_comercio: legacyId } = await req.json();

    const id_comercio_final = commerce_code || legacyId;

    if (!idCliente || !porcentajeDescuento || !id_comercio_final) {
      return Response.json({
        error: 'Faltan parámetros: idCliente, porcentajeDescuento, commerce_code'
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
      commerce_code: id_comercio_final,
      id_comercio: id_comercio_final, // Keep legacy field populated if possible/needed or rely on commerce_code being added to schema
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
