
// @ts-nocheck
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response('OK'); // CORS

        const body = await req.json();
        const { commerce_code: idRecibido, id_comercio: legacyId } = body;
        const commerceCode = idRecibido || legacyId;

        if (!commerceCode) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        // 1. OBTENER PRODUCTOS (FETCH FILTERED)
        // URL: [BASE]/Producto?commerce_code=[CODE]
        const prodUrl = `${BASE_URL}/Producto?commerce_code=${encodeURIComponent(commerceCode)}`;

        const prodResponse = await fetch(prodUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!prodResponse.ok) {
            throw new Error('Error fetching productos from Base44');
        }

        const productos = await prodResponse.json();

        // 2. OBTENER ATRIBUTOS (Para que el panel de edición funcione completo)
        // Nota: Si no podemos filtrar por commerce_code en Atributos (porque no tiene el campo),
        // tendríamos que traer todos o filtrar en memoria.
        // ASUMIMOS que AtributoProducto NO tiene commerce_code directo, sino id_producto.
        // ESTRATEGIA OPTIMIZADA: Get all attributes y filtrar en memoria por IDs de mis productos.
        // (Si son muchos, esto es lento, pero por ahora sirve).

        const attrUrl = `${BASE_URL}/AtributoProducto`; // Trae max 50/100 default
        const attrResponse = await fetch(attrUrl, { headers: { 'api_key': API_KEY } });
        let atributos = [];
        if (attrResponse.ok) {
            const todosAtributos = await attrResponse.json();
            // Filtramos solo los que pertenecen a mis productos
            const misProductoIds = new Set(productos.map(p => p.id || p._id));
            atributos = todosAtributos.filter(a => misProductoIds.has(a.id_producto));
        }

        // Normalizar stock para el admin (unificar campos legacy)
        const productosNorm = productos.map((p) => ({
            ...p,
            stock_actual: Number(p.stock !== undefined ? p.stock : (p.stock_actual !== undefined ? p.stock_actual : 0))
        }));

        return Response.json({
            success: true,
            productos: productosNorm,
            atributos: atributos // Enviamos también los atributos
        });

    } catch (error) {
        console.error('Error productos admin:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
