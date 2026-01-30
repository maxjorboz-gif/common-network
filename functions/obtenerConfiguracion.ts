// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio";

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
    const idBusqueda = commerce_code || legacyId;

    if (!idBusqueda) {
      return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // 1. Obtener Configuración (URL Directa)
    const queryUrl = `${BASE_URL}?commerce_code=${idBusqueda}`;
    const response = await fetch(queryUrl, {
      headers: { 'api_key': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo configuración: ${await response.text()}`);
    }

    const configs = await response.json();

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
    return Response.json({ error: error.message }, { status: 500 });
  }
});
