import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const COMERCIO_ID = '1';

// Mapeo inteligente de categorías existentes a nuevas categorías de marketing
const CATEGORIA_MAP = {
  'Set Completo': 'Set Parrillero Completo',
  'Combinadas': 'Parrillas Combinadas Premium',
  'Brasero': 'Parrillas con Brasero Uruguayo',
  'Parrilla': 'Parrillas con Brasero Uruguayo',
  'Accesorios': 'Accesorios de Cocción: Palita y Atizador',
  'Herramientas': 'Accesorios de Cocción: Palita y Atizador'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Obtener todos los productos del comercio
    const productos = await base44.asServiceRole.entities.Producto.filter({
      id_comercio: COMERCIO_ID
    }, '-created_date', 100);

    let actualizados = 0;
    
    // Re-categorizar cada producto
    for (const producto of productos) {
      const categoriaActual = producto.categoria || '';
      let nuevaCategoria = null;

      // Buscar mapeo exacto
      if (CATEGORIA_MAP[categoriaActual]) {
        nuevaCategoria = CATEGORIA_MAP[categoriaActual];
      } else {
        // Buscar mapeo parcial por substring
        for (const [old, newCat] of Object.entries(CATEGORIA_MAP)) {
          if (categoriaActual.toLowerCase().includes(old.toLowerCase())) {
            nuevaCategoria = newCat;
            break;
          }
        }
      }

      // Si se encontró una nueva categoría, actualizar
      if (nuevaCategoria && nuevaCategoria !== categoriaActual) {
        await base44.asServiceRole.entities.Producto.update(producto.id, {
          categoria: nuevaCategoria
        });
        actualizados++;
        console.log(`✅ ${producto.titulo} → ${nuevaCategoria}`);
      }
    }

    return Response.json({
      status: 'success',
      productosActualizados: actualizados,
      totalProductos: productos.length,
      mensaje: `Re-categorización completada: ${actualizados}/${productos.length} productos actualizados`,
      categoriasNuevas: Object.values(CATEGORIA_MAP)
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});