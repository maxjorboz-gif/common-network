// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_ORDEN = `https://app.base44.com/api/apps/${APP_ID}/entities/Orden`;
const URL_GASTO = `https://app.base44.com/api/apps/${APP_ID}/entities/GastoPublicitario`;
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) {
            return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });
        }

        // 1. Determinar parámetro de filtro
        let filterParam = idBusqueda.length > 20 ? `id_comercio=${idBusqueda}` : `commerce_code=${idBusqueda}`;

        // 2. OBTENCION DE DATOS EN PARALELO (URL Directa)
        const [resOrdenes, resGastos, resProductos] = await Promise.all([
            fetch(`${URL_ORDEN}?${filterParam}`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_GASTO}?${filterParam}`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_PRODUCTO}?${filterParam}`, { headers: { 'api_key': API_KEY } })
        ]);

        const ordenes = await resOrdenes.json().catch(() => []);
        const gastos = await resGastos.json().catch(() => []);
        const productos = await resProductos.json().catch(() => []);

        // 3. CALCULOS
        const totalVentas = (Array.isArray(ordenes) ? ordenes : [])
            .filter(o => o.estado === 'PAGADA' || o.estado === 'ENTREGADA')
            .reduce((sum, o) => sum + (Number(o.resumen_economico?.total_final) || 0), 0);

        const totalGastoAds = (Array.isArray(gastos) ? gastos : [])
            .reduce((sum, g) => sum + (Number(g.monto) || 0), 0);

        const totalOrdenes = Array.isArray(ordenes) ? ordenes.length : 0;
        const productosStockBajo = (Array.isArray(productos) ? productos : [])
            .filter(p => {
                const stockReal = Number(p.stock_actual !== undefined ? p.stock_actual : (p.stock !== undefined ? p.stock : 0));
                return stockReal <= (Number(p.stock_minimo_alerta) || 5);
            }).length;

        return Response.json({
            success: true,
            estadisticas: {
                totalVentas: Math.round(totalVentas),
                totalOrdenes: totalOrdenes,
                totalGastoAds: Math.round(totalGastoAds),
                roas: totalGastoAds > 0 ? (totalVentas / totalGastoAds).toFixed(2) : 0,
                productosStockBajo: productosStockBajo
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticas:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
