// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_ORDEN = `https://app.base44.com/api/apps/${APP_ID}/entities/Orden`;
const URL_GASTO = `https://app.base44.com/api/apps/${APP_ID}/entities/GastoPublicitario`;
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;
const URL_SORTEO = `https://app.base44.com/api/apps/${APP_ID}/entities/Sorteo`;
const URL_LEAD = `https://app.base44.com/api/apps/${APP_ID}/entities/Lead`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) {
            return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });
        }

        let filterParam = idBusqueda.length > 20 ? `id_comercio=${idBusqueda}` : `commerce_code=${idBusqueda}`;

        // 1. OBTENCION DE DATOS INTEGRAL (Dashboard para el Comercio)
        const [resOrdenes, resGastos, resProductos, resSorteos, resLeads] = await Promise.all([
            fetch(`${URL_ORDEN}?${filterParam}`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_GASTO}?${filterParam}`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_PRODUCTO}?${filterParam}`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_SORTEO}?${filterParam}&activo=true`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_LEAD}?${filterParam}&origen=sorteo`, { headers: { 'api_key': API_KEY } })
        ]);

        const ordenes = await resOrdenes.json().catch(() => []);
        const gastos = await resGastos.json().catch(() => []);
        const productos = await resProductos.json().catch(() => []);
        const sorteosActivos = await resSorteos.json().catch(() => []);
        const leadsSorteo = await resLeads.json().catch(() => []);

        // 2. CALCULOS DE VENTAS Y ADS
        const totalVentas = (Array.isArray(ordenes) ? ordenes : [])
            .filter(o => o.estado === 'PAGADA' || o.estado === 'ENTREGADA')
            .reduce((sum, o) => sum + (Number(o.resumen_economico?.total_final) || 0), 0);

        const totalGastoAds = (Array.isArray(gastos) ? gastos : [])
            // Filtramos solicitudes pendientes o rechazadas. 
            // Aceptamos: status='approved' o undefined (legacy)
            .filter(g => !g.status || g.status === 'approved')
            .reduce((sum, g) => sum + (Number(g.monto) || 0), 0);

        // 3. LOGICA DE SORTEO (Marketing Motivacional)
        const sorteoActivo = Array.isArray(sorteosActivos) && sorteosActivos.length > 0 ? sorteosActivos[0] : null;
        const totalParticipantes = Array.isArray(leadsSorteo) ? leadsSorteo.length : 0;

        // Mensaje tentador para el administrador
        let marketingMessage = "¡Lanza un sorteo para atraer clientes hoy!";
        if (sorteoActivo) {
            marketingMessage = `¡Tu sorteo está funcionando! Tienes ${totalParticipantes} clientes potenciales nuevos esperando ganar la ${sorteoActivo.titulo || 'premio'}.`;
        }

        return Response.json({
            success: true,
            estadisticas: {
                totalVentas: Math.round(totalVentas),
                totalOrdenes: Array.isArray(ordenes) ? ordenes.length : 0,
                totalGastoAds: Math.round(totalGastoAds + 20000),
                roas: totalGastoAds > 0 ? (totalVentas / totalGastoAds).toFixed(2) : 0,
                productosStockBajo: (Array.isArray(productos) ? productos : []).filter(p => (Number(p.stock_actual) || 0) <= 5).length
            },
            marketing: {
                sorteoActivo: !!sorteoActivo,
                participantesSorteo: totalParticipantes,
                mensaje: marketingMessage
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticas:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
