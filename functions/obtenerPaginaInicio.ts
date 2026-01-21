// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { id_comercio: idComercioRequest } = await req.json().catch(() => ({}));

        // ID SOBERANO por defecto si no viene en el request (para admin principal)
        const DEFAULT_ID = "000001";
        const idBusqueda = idComercioRequest || DEFAULT_ID;

        // 1. Obtener CATEGORÍAS activas para ese comercio (agrupando productos)
        // Optimizacion: Traemos productos y extraemos categorías únicas en memoria 
        // para no hacer queries complejos inadecuados a Base44
        const productos = await base44.asServiceRole.entities.Producto.filter({
            id_comercio: idBusqueda,
            activo: true
        }, '-created_date', 100);

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
        const configs = await base44.asServiceRole.entities.ConfiguracionComercio.filter({
            id_comercio: idBusqueda
        }, '-created_date', 1);

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
