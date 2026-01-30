// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productosIds, tipo, valor, modo } = await req.json();

        // VALIDACIÓN MÍNIMA
        if (!productosIds || !Array.isArray(productosIds)) {
            return Response.json({ error: 'Ids Invalidos' }, { status: 400 });
        }

        // UPDATE LOOP
        let count = 0;
        for (const id of productosIds) {
            try {
                // 1. Obtener producto individualmente usando la constante BASE_URL
                const getResponse = await fetch(`${BASE_URL}/${id}`, {
                    headers: { 'api_key': API_KEY }
                });

                if (!getResponse.ok) continue;
                const p = await getResponse.json();

                let nuevo = p.precio_estandar;
                const v = parseFloat(valor);

                if (modo === 'percentage') {
                    // Porcentaje
                    nuevo = tipo === 'increase' ? nuevo * (1 + v / 100) : nuevo * (1 - v / 100);
                } else {
                    // Fijo
                    nuevo = tipo === 'increase' ? nuevo + v : nuevo - v;
                }

                // 2. ACTUALIZAR (PATCH) utilizando la constante BASE_URL
                const updateResponse = await fetch(`${BASE_URL}/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'api_key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        precio_estandar: Math.max(0, Math.round(nuevo)),
                        updated_at: new Date().toISOString()
                    })
                });

                if (updateResponse.ok) {
                    count++;
                }
            } catch (e) {
                console.error(`Error procesando producto ${id}:`, e);
            }
        }

        return Response.json({ success: true, actualizados: count });

    } catch (error) {
        console.error('Error cambioMasivoPrecio:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});