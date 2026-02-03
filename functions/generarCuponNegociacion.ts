// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { idCliente, porcentajeDescuento, validezMinutos = 15, commerce_code, id_comercio: legacyId } = await req.json();

    const id_comercio_final = commerce_code || legacyId;

    if (!idCliente || !porcentajeDescuento || !id_comercio_final) {
      return Response.json({
        error: 'Faltan parámetros: idCliente, porcentajeDescuento, commerce_code'
      }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const adminClient = base44.asServiceRole;

    // Calcula expiración
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + validezMinutos);

    // Generar código único corto
    const codigo = `OFF${porcentajeDescuento}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Payload para la entidad Cupon (SDK)
    const cuponPayload = {
      codigo,
      id_comercio: id_comercio_final,
      commerce_code: id_comercio_final,
      tipo: 'porcentaje',
      valor: porcentajeDescuento,
      fecha_inicio: new Date().toISOString(),
      fecha_fin: expiracion.toISOString(),
      activo: true,
      usos_maximos: 1,
      usos_actuales: 0,
      id_cliente_dueno: idCliente,
      origen: 'negociacion_ia',
      created_at: new Date().toISOString()
    };

    const cupon = await adminClient.entities.Cupon.create(cuponPayload);

    return Response.json({
      success: true,
      cupon
    });

  } catch (error) {
    console.error('Error generarCuponNegociacion:', error);
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});
