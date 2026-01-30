// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;
const URL_CONFIG = `https://app.base44.com/api/apps/${APP_ID}/entities/ConfiguracionComercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        // 1. Obtener commerce_code (puede venir por URL o por body)
        const url = new URL(req.url);
        let commerceCode = url.searchParams.get('commerce_code');

        if (!commerceCode) {
            const body = await req.json().catch(() => ({}));
            commerceCode = body.commerce_code || body.id_comercio;
        }

        if (!commerceCode) {
            return Response.json({ error: 'commerce_code requerido' }, { status: 400 });
        }

        const filterParam = commerceCode.length > 20 ? `id_comercio=${commerceCode}` : `commerce_code=${commerceCode}`;

        // 2. Fetch de datos en paralelo (Producto y Configuración)
        const [resProductos, resConfig] = await Promise.all([
            fetch(`${URL_PRODUCTO}?${filterParam}&activo=true`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_CONFIG}?${filterParam}`, { headers: { 'api_key': API_KEY } })
        ]);

        const productos = await resProductos.json().catch(() => []);
        const configs = await resConfig.json().catch(() => []);

        // 3. PROCESAMIENTO
        const categoriasSet = new Set();
        (Array.isArray(productos) ? productos : []).forEach((p) => {
            if (p.categoria) categoriasSet.add(p.categoria);
        });

        const categorias = Array.from(categoriasSet).map(c => ({
            id: c.toLowerCase().replace(/\s+/g, '-'),
            nombre: c
        }));

        const destacados = Array.isArray(productos) ? productos.slice(0, 8) : [];

        const configComercio = (Array.isArray(configs) && configs.length > 0) ? configs[0] : {
            nombre_tienda: "Mi Tienda",
            color_primario: "#ea580c",
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
