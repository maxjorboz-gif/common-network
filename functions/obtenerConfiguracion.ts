// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id_comercio } = await req.json();

    if (!id_comercio) {
      return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // USO ID SOBERANO (000001)
    const configs = await base44.asServiceRole.entities.ConfiguracionComercio.filter({
      id_comercio: id_comercio
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
