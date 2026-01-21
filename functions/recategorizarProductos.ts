// @ts-nocheck
import { createClientFromRequest } from '@base44/sdk';

const COMERCIO_ID = '1'; // Ajustar si es necesario

// Mapeo de categorías técnicas a nombres marketing
const MAPEO_CATEGORIAS = {
  'Set Completo': 'Set Parrillero Completo',
  'Parrillas con Brasero': 'Parrillas con Brasero Cunita',
  'Accesorios': 'Kit parrilleros: Palita y Atizador',
  'Combinadas': 'Parrillas Combinadas Premium'
};



// ====================================
// PALABRAS CLAVE PARA FALLBACK INTELIGENTE
// ====================================
const PALABRAS_CLAVE_CATEGORIA = {
  'Set Parrillero Completo': ['set completo', 'kit completo', 'pack parrillero', 'set parrilla'],
  'Parrillas con Brasero Cunita': ['brasero', 'cunita', 'parrilla brasero', 'brasero cunita'],
  'Kit parrilleros: Palita y Atizador': ['palita', 'atizador', 'accesorios', 'herramientas'],
  'Parrillas Combinadas Premium': ['combinada', 'premium', 'parrilla combinada', 'carbón gas']
};

// ====================================
// DETECTAR CATEGORÍA POR PALABRAS CLAVE
// ====================================
function detectarCategoriaInteligente(titulo, categoriaActual) {
  const tituloNormalizado = (titulo || '').toLowerCase();

  for (const [categoria, palabras] of Object.entries(PALABRAS_CLAVE_CATEGORIA)) {
    for (const palabra of palabras) {
      if (tituloNormalizado.includes(palabra)) {
        return categoria;
      }
    }
  }

  // Si no encuentra coincidencia, devolver original
  return categoriaActual || 'Sin categoría';
}

// ====================================
// ENVIAR A META CATALOG API
// ====================================
async function sincronizarConMetaCatalogo(productosActualizados) {
  const META_DATASET_ID = Deno.env.get('META_DATASET_ID');
  const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

  if (!META_DATASET_ID || !META_ACCESS_TOKEN) {
    console.warn('⚠️ Meta credentials no configurados - sincronización saltada');
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${META_DATASET_ID}/batch`;

    // Enviar cambios de categoría a Meta Catalog
    const updates = productosActualizados.map(p => ({
      id: p.sku_taller_interno || p.id,
      category_name: p.meta_product_category || p.categoria,
      name: p.titulo,
      description: p.descripcion,
      price: p.precio_estandar,
      currency: p.moneda || 'ARS'
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: updates,
        access_token: META_ACCESS_TOKEN
      })
    });

    const result = await response.json();
    console.log('✅ Meta Catalog sincronizado:', result);
    return result;
  } catch (error) {
    console.error('⚠️ Error sincronizando Meta Catalog:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Obtener todos los productos
    const todosProductos = await base44.asServiceRole.entities.Producto.filter({
      id_comercio: COMERCIO_ID
    }, '-created_date', 1000);

    console.log(`[INFO] Encontrados ${todosProductos.length} productos`);

    // ====================================
    // MAPEAR Y PREPARAR ACTUALIZACIONES
    // ====================================
    const actualizacionesProductos = todosProductos.map(producto => {
      // Inteligencia de fallback: buscar por palabras clave si no está en mapeo
      const categoriaNueva = MAPEO_CATEGORIAS[producto.categoria] ||
        detectarCategoriaInteligente(producto.titulo, producto.categoria);

      return {
        id: producto.id,
        datos: {
          categoria: categoriaNueva,
          meta_product_category: categoriaNueva // Sincronizar con Meta
          // ✅ Fotos NO se reemplazan - se preservan las individuales por producto
        },
        producto: producto
      };
    });

    // ====================================
    // EJECUTAR ACTUALIZACIONES EN PARALELO
    // ====================================
    const actualizacionesPromesas = actualizacionesProductos.map(item =>
      base44.asServiceRole.entities.Producto.update(item.id, item.datos)
    );

    const productosActualizados = await Promise.all(actualizacionesPromesas);
    const actualizados = productosActualizados.length;

    console.log(`[SUCCESS] ${actualizados} productos recategorizados en paralelo`);

    // ====================================
    // SINCRONIZAR CON META CATALOG API
    // ====================================
    const metaSincronizado = await sincronizarConMetaCatalogo(productosActualizados);

    return Response.json({
      status: 'success',
      productosActualizados: actualizados,
      mensaje: `✅ ${actualizados} productos recategorizados y sincronizados con Meta`,
      categoriasNuevas: Object.values(MAPEO_CATEGORIAS),
      metaSincronizado: metaSincronizado ? 'Éxito' : 'No configurado',
      detalles: {
        conFallback: actualizacionesProductos.filter(p =>
          !MAPEO_CATEGORIAS[p.producto.categoria]
        ).length,
        tiempoOperacion: 'paralelo'
      }
    });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});