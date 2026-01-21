import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Obtener todos los productos
    const productos = await base44.asServiceRole.entities.Producto.list('-created_date', 200);
    
    let productosActualizados = 0;
    const reporteActualizaciones = [];

    for (const producto of productos) {
      const categoriaActual = producto.categoria || 'default';
      const categoriaNueva = MAPEO_CATEGORIAS[categoriaActual] || MAPEO_CATEGORIAS['default'];

      // Si la categoría cambió, actualizar
      if (categoriaActual !== categoriaNueva) {
        await base44.asServiceRole.entities.Producto.update(producto.id, {
          categoria: categoriaNueva
        });
        
        productosActualizados++;
        reporteActualizaciones.push({
          id: producto.id,
          titulo: producto.titulo,
          categoria_anterior: categoriaActual,
          categoria_nueva: categoriaNueva
        });
        
        console.log(`✅ ${producto.titulo}: ${categoriaActual} → ${categoriaNueva}`);
      }
    }

    return Response.json({
      status: 'success',
      productosActualizados,
      mensaje: `Se actualizaron ${productosActualizados} productos a categorías de marketing`,
      detalles: reporteActualizaciones
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});