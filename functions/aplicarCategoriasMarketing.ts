// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const ENTITY_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

// Mapeo estratégico de categorías antiguas a nuevas
const MAPEO_CATEGORIAS = {
  'Parrillas': 'Parrillas con Brasero Uruguayo',
  'Set Completo': 'Set Parrillero Completo',
  'Parrillas Combinadas': 'Parrillas Combinadas Premium',
  'Accesorios': 'Accesorios de Cocción: Palita y Atizador',
  // Fallback por defecto
  'default': 'Set Parrillero Completo'
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    // 1. Obtener todos los productos (Directo via Fetch)
    const responseList = await fetch(ENTITY_URL, {
      headers: { 'api_key': API_KEY }
    });

    if (!responseList.ok) {
      throw new Error(`Error obteniendo productos: ${await responseList.text()}`);
    }

    const productos = await responseList.json();

    let productosActualizados = 0;
    const reporteActualizaciones = [];

    for (const producto of productos) {
      const categoriaActual = producto.categoria || 'default';
      const categoriaNueva = MAPEO_CATEGORIAS[categoriaActual] || MAPEO_CATEGORIAS['default'];

      // Si la categoría cambió o si queremos forzar el campo, actualizar
      if (categoriaActual !== categoriaNueva) {
        const productId = producto.id || producto._id;

        // 2. Actualizar Producto (Directo via Fetch PUT/PATCH según tu ejemplo)
        const updateResponse = await fetch(`${ENTITY_URL}/${productId}`, {
          method: 'PATCH',
          headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            categoria: categoriaNueva,
            updated_at: new Date().toISOString()
          })
        });

        if (updateResponse.ok) {
          productosActualizados++;
          reporteActualizaciones.push({
            id: productId,
            titulo: producto.titulo,
            categoria_anterior: categoriaActual,
            categoria_nueva: categoriaNueva
          });
          console.log(`✅ ${producto.titulo}: ${categoriaActual} → ${categoriaNueva}`);
        }
      }
    }

    return Response.json({
      status: 'success',
      count: productosActualizados,
      mensaje: `Se actualizaron ${productosActualizados} productos a categorías de marketing`,
      detalles: reporteActualizaciones
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});