// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;
const URL_CONFIG = `https://app.base44.com/api/apps/${APP_ID}/entities/ConfiguracionComercio`;
const URL_CLIENTE = `https://app.base44.com/api/apps/${APP_ID}/entities/Cliente`;
const URL_SORTEO = `https://app.base44.com/api/apps/${APP_ID}/entities/Sorteo`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const url = new URL(req.url);
        let commerceCode = url.searchParams.get('commerce_code');
        let customerId = null;

        const body = await req.json().catch(() => ({}));
        if (!commerceCode) {
            commerceCode = body.commerce_code || body.id_comercio;
        }
        customerId = body.id_cliente;

        if (!commerceCode) {
            return Response.json({ error: 'commerce_code requerido' }, { status: 400 });
        }

        const filterParam = commerceCode.length > 20 ? `id_comercio=${commerceCode}` : `commerce_code=${commerceCode}`;

        // 1. FETCH EN PARALELO (Todo lo necesario para la Landing Page)
        const fetchPromises = [
            fetch(`${URL_PRODUCTO}?${filterParam}&activo=true`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_CONFIG}?${filterParam}`, { headers: { 'api_key': API_KEY } }),
            fetch(`${URL_SORTEO}?${filterParam}&activo=true`, { headers: { 'api_key': API_KEY } })
        ];

        if (customerId) {
            fetchPromises.push(fetch(`${URL_CLIENTE}/${customerId}`, { headers: { 'api_key': API_KEY } }));
        }

        const responses = await Promise.all(fetchPromises);

        const productos = await responses[0].json().catch(() => []);
        const configs = await responses[1].json().catch(() => []);
        const sorteos = await responses[2].json().catch(() => []);
        let clienteData = null;

        if (customerId && responses[3] && responses[3].ok) {
            clienteData = await responses[3].json().catch(() => null);
        }

        // 2. PROCESAMIENTO
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
            banner_url: null,
            marketing_red_activo: false
        };

        const sorteoActivo = Array.isArray(sorteos) && sorteos.length > 0 ? sorteos[0] : null;

        // 3. LÓGICA DE RED DE SOCIOS (Cross-Marketing)
        let anunciosRed = [];
        if (configComercio.marketing_red_activo) {
            try {
                // Buscamos productos de OTROS comercios (id_comercio != actual)
                // Limitamos a 20 para hacer el filtrado manual más rápido
                const resOtros = await fetch(`${URL_PRODUCTO}?activo=true&_limit=20`, {
                    headers: { 'api_key': API_KEY }
                });
                const otrosProductos = await resOtros.json().catch(() => []);

                if (Array.isArray(otrosProductos)) {
                    const filtrados = otrosProductos.filter(p =>
                        (p.commerce_code !== commerceCode && p.id_comercio !== commerceCode)
                    );

                    // Separar por "Similares" (Misma categoría de negocio o complementaria - simplificado por ahora) 
                    // y "Aleatorios"
                    const mimaCategoria = filtrados.filter(p => p.categoria_negocio === configComercio.categoria_negocio);
                    const otrasCategorias = filtrados.filter(p => p.categoria_negocio !== configComercio.categoria_negocio);

                    // Tomamos 3 de cada (o lo que haya disponible)
                    const similares = mimaCategoria.sort(() => 0.5 - Math.random()).slice(0, 3);
                    const aleatorios = otrasCategorias.sort(() => 0.5 - Math.random()).slice(0, 3);

                    anunciosRed = [...similares, ...aleatorios];
                }
            } catch (e) {
                console.warn("Error cargando Red de Socios:", e);
            }
        }

        // 4. IDENTIDAD
        let mensaje_personalizado = null;
        if (clienteData && clienteData.nombre_completo) {
            const primerNombre = clienteData.nombre_completo.split(' ')[0];
            mensaje_personalizado = `¡Qué bueno verte de nuevo, ${primerNombre}!`;
        }

        return Response.json({
            success: true,
            data: {
                categorias,
                destacados,
                configuracion: configComercio,
                sorteo: sorteoActivo,
                anunciosRed, // Nuevos anuncios de la red cruzada
                identidad: {
                    cliente: clienteData ? {
                        id: customerId,
                        nombre: clienteData.nombre_completo,
                        mensaje: mensaje_personalizado
                    } : null
                }
            }
        });

    } catch (error) {
        console.error('Error obtenerPaginaInicio:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
