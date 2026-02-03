// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
    const idBusqueda = commerce_code || legacyId;

    if (!idBusqueda) {
      return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const adminClient = base44.asServiceRole;

    // 1. Obtener Configuración (SDK Filter)
    const configs = await adminClient.entities.ConfiguracionComercio.filter({
      commerce_code: idBusqueda
    });

    const defaultConfig = {
      descuento_base_transferencia: 10,
      costo_envio_default: 0,
      habilitar_envio_gratis_global: false,
      precio_minimo_piso_tarjeta: 30
    };

    return Response.json({
      success: true,
      config: Array.isArray(configs) && configs.length > 0 ? configs[0] : defaultConfig
    });

  } catch (error) {
    console.error('Error obtenerConfiguracion:', error);
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});
