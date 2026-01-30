// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;
const URL_RESENA = `https://app.base44.com/api/apps/${APP_ID}/entities/Resena`;
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { productoId } = body;

        if (!productoId) {
            return Response.json({ error: 'Falta ID de producto' }, { status: 400 });
        }

        // 1. OBTENER PRODUCTO (URL Directa)
        const responseProd = await fetch(`${URL_PRODUCTO}/${productoId}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseProd.ok) {
            return Response.json({ error: 'Producto no disponible' }, { status: 404 });
        }

        const producto = await responseProd.json();

        if (producto.activo === false) {
            return Response.json({ error: 'Producto no disponible' }, { status: 404 });
        }

        // 2. CARGA PARALELA (Reseñas, Relacionados y Comercio)
        const commerceKey = producto.commerce_code || producto.id_comercio;

        const [resenasRes, relacionadosRes, comercioRes] = await Promise.all([
            // Reseñas aprobadas del producto
            fetch(`${URL_RESENA}?id_producto=${productoId}&aprobada=true`, {
                headers: { 'api_key': API_KEY }
            }),
            // Productos relacionados (misma categoría, mismo comercio)
            fetch(`${URL_PRODUCTO}?commerce_code=${commerceKey}&categoria=${encodeURIComponent(producto.categoria)}`, {
                headers: { 'api_key': API_KEY }
            }),
            // Datos del comercio
            fetch(`${URL_COMERCIO}?commerce_code=${commerceKey}`, {
                headers: { 'api_key': API_KEY }
            })
        ]);

        const resenas = await resenasRes.json().catch(() => []);
        const relacionadosRaw = await relacionadosRes.json().catch(() => []);
        const comercios = await comercioRes.json().catch(() => []);

        const productosRelacionados = Array.isArray(relacionadosRaw)
            ? relacionadosRaw.filter(p => (p.id || p._id) !== productoId && p.activo !== false).slice(0, 4)
            : [];

        const comercio = Array.isArray(comercios) ? comercios[0] : { nombre: 'Tienda' };

        // 3. FORMATEO DE DATOS
        const stockReal = Number(producto.stock_actual !== undefined ? producto.stock_actual : (producto.stock !== undefined ? producto.stock : 0));
        const umbral_escasez = 5;

        const precioBase = Number(producto.precio_estandar || producto.precio || 0);
        const precioOferta = Number(producto.precio_oferta || 0);
        const precioFinal = (precioOferta > 0 && precioOferta < precioBase) ? precioOferta : precioBase;

        const productoDatos = {
            ...producto,
            stock: stockReal,
            hay_stock: stockReal > 0,
            es_escaso: stockReal > 0 && stockReal <= umbral_escasez,
            es_ultima_unidad: stockReal === 1,
            precio_base: precioBase,
            precio_final: precioFinal,
            tiene_descuento: precioFinal < precioBase
        };

        return Response.json({
            success: true,
            producto: productoDatos,
            resenas: resenas,
            productosRelacionados: productosRelacionados,
            comercio: comercio,
            disponible: stockReal > 0,
            stock_disponible: stockReal
        });

    } catch (error) {
        console.error('Error en obtenerDetalleProducto:', error);
        return Response.json({ success: false, error: 'Error al cargar detalles' }, { status: 500 });
    }
});
