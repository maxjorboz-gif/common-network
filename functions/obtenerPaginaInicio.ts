// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Obtener commerce_code desde la URL (query param)
        const url = new URL(req.url);
        const commerceCode = url.searchParams.get('commerce_code');

        // 2. Validación mínima (solo para Home público)
        if (!commerceCode) {
            return Response.json(
        { error: 'commerce_code requerido' },
        { status: 400 }
    );
}

        // HEURÍSTICA DE COMPATIBILIDAD
        // Si el ID es largo (> 20 chars), asumimos que es un UUID legacy (id_comercio)
        // Si es corto, es un commerce_code nuevo
        const isLegacyId = idBusqueda.length > 20;

        // 1. Obtener CATEGORÍAS
        const productFilter = { activo: true };
        if (isLegacyId) {
            productFilter.id_comercio = idBusqueda;
        } else {
            productFilter.commerce_code = idBusqueda;
        }

        const productos = await base44.asServiceRole.entities.Producto.filter(productFilter, '-created_date', 100);

        const categoriasSet = new Set();
        productos.forEach((p) => {
            if (p.categoria) categoriasSet.add(p.categoria);
        });
        const categorias = Array.from(categoriasSet).map(c => ({
            id: c.toLowerCase().replace(/\s+/g, '-'),
            nombre: c
        }));

        // 2. Obtener PRODUCTOS DESTACADOS (ej. los más nuevos o más vendidos)
        // Por ahora usamos los mismos productos recuperados arriba
        const destacados = productos.slice(0, 8); // Top 8

        // 3. Obtener CONFIGURACIÓN visual del comercio (si existe)
        const configFilter = {};
        if (isLegacyId) {
            configFilter.id_comercio = idBusqueda;
        } else {
            configFilter.commerce_code = idBusqueda;
        }

        const configs = await base44.asServiceRole.entities.ConfiguracionComercio.filter(configFilter, '-created_date', 1);

        const configComercio = configs[0] || {
            nombre_tienda: "Mi Tienda",
            color_primario: "#ea580c", // Orange-600 default
            banner_url: null
        };

        return Response.json({
            success: true,
            data: {
                categorias,
                destacados,
                configuracion: configComercio
            }
        });

    } catch (error) {
        console.error('Error obtenerPaginaInicio:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
