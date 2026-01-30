// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { commerce_code, id_comercio: legacyId } = await req.json();
    const idBusqueda = commerce_code || legacyId;

    if (!idBusqueda) {
      return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const configs = await base44.asServiceRole.entities.ConfiguracionComercio.filter({
      commerce_code: idBusqueda
    }, '-created_date', 1);

    const defaultConfig = {
      descuento_base_transferencia: 10,
      costo_envio_default: 0,
      habilitar_envio_gratis_global: false,
      precio_minimo_piso_tarjeta: 30
    };

    return Response.json({
      success: true,
      config: configs.length > 0 ? configs[0] : defaultConfig
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
