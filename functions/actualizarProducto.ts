// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
// URL exacta siguiendo tu regla
const BASE_URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;
const BASE_URL_ATRIBUTOS = `https://app.base44.com/api/apps/${APP_ID}/entities/AtributoProducto`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId, productoData, atributos } = await req.json();

        if (!productoId || !productoData) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // 1. Obtener producto por ID
        const responseProducto = await fetch(`${BASE_URL_PRODUCTO}/${productoId}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseProducto.ok) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }
        const productoActual = await responseProducto.json();

        if (productoData.precio_estandar) {
            productoData.precio_estandar = parseFloat(productoData.precio_estandar);
        }

        // 2. Actualizar producto (PATCH) utilizando la URL completa a la entidad
        const updateResponse = await fetch(`${BASE_URL_PRODUCTO}/${productoId}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...productoData,
                stock_actual: productoData.stock_actual !== undefined ? parseInt(productoData.stock_actual) : productoActual.stock_actual,
                costo_producto: productoData.costo_producto !== undefined ? parseFloat(productoData.costo_producto) : productoActual.costo_producto,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando producto: ${errorText}`);
        }

        // 3. Gestionar atributos
        if (atributos && Array.isArray(atributos)) {
            const resAttrs = await fetch(`${BASE_URL_ATRIBUTOS}?id_producto=${productoId}`, {
                headers: { 'api_key': API_KEY }
            });

            if (resAttrs.ok) {
                const atributosAntiguos = await resAttrs.json();
                if (Array.isArray(atributosAntiguos)) {
                    for (const attr of atributosAntiguos) {
                        await fetch(`${BASE_URL_ATRIBUTOS}/${attr.id || attr._id}`, {
                            method: 'DELETE',
                            headers: { 'api_key': API_KEY }
                        });
                    }
                }
            }

            for (let i = 0; i < atributos.length; i++) {
                await fetch(BASE_URL_ATRIBUTOS, {
                    method: 'POST',
                    headers: {
                        'api_key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_producto: productoId,
                        nombre_atributo: atributos[i].nombre_atributo,
                        valor_atributo: atributos[i].valor_atributo,
                        ia_weight: atributos[i].ia_weight || 5,
                        orden: i,
                        created_at: new Date().toISOString()
                    })
                });
            }
        }

        return Response.json({ success: true, mensaje: 'Producto actualizado exitosamente' });

    } catch (error) {
        console.error('Error actualizarProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
