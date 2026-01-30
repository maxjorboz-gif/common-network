// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_PRODUCTO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { commerce_code: idRecibido, id_comercio: legacyId } = body;
        const commerceCode = idRecibido || legacyId;

        if (!commerceCode) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        // 1. OBTENER PRODUCTOS (URL Directa con filtro por commerce_code)
        const response = await fetch(`${URL_PRODUCTO}?commerce_code=${commerceCode}`, {
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error obteniendo productos: ${errorText}`);
        }

        const productos = await response.json();

        // 2. FORMATEAR PARA EL FRONTEND
        const productosProcesados = productos
            .filter((p) => p.activo !== false)
            .map((p) => {
                // NORMALIZACIÓN DE STOCK
                const stockReal = Number(p.stock_actual !== undefined ? p.stock_actual : (p.stock !== undefined ? p.stock : 0));
                const umbral = Number(p.stock_minimo_alerta) || 5;

                return {
                    ...p,
                    stock: stockReal,
                    disponible: stockReal > 0,
                    es_escaso: stockReal > 0 && stockReal <= umbral,
                    mensaje_stock: stockReal > 0 ? (stockReal <= umbral ? `¡Solo quedan ${stockReal}!` : 'En stock') : 'Sin stock'
                };
            });

        return Response.json({
            success: true,
            productos: productosProcesados
        });

    } catch (error) {
        console.error('Error obteniendo catálogo:', error.message);
        return Response.json({ error: 'No se pudo cargar el catálogo' }, { status: 500 });
    }
});
