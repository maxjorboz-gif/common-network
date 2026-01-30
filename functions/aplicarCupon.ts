// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Cupon";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { carritoId, codigoCupon, commerce_code, id_comercio: legacyId } = await req.json();
        const id_comercio_final = commerce_code || legacyId;

        if (!carritoId || !codigoCupon || !id_comercio_final) {
            return Response.json({ error: 'Faltan datos (commerce_code requerido)' }, { status: 400 });
        }

        // 1. Buscar Cupón usando la constante BASE_URL
        const queryUrl = `${BASE_URL}?codigo=${encodeURIComponent(codigoCupon)}&commerce_code=${id_comercio_final}&activo=true`;

        const response = await fetch(queryUrl, {
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error consultando cupón: ${await response.text()}`);
        }

        const cupones = await response.json();
        const cupon = Array.isArray(cupones) ? cupones[0] : null;

        if (!cupon) {
            return Response.json({ error: 'Cupón inválido o expirado' }, { status: 404 });
        }

        // 2. Validaciones
        if (cupon.fecha_fin && new Date(cupon.fecha_fin) < new Date()) {
            return Response.json({ error: 'El cupón ha expirado' }, { status: 400 });
        }

        if (cupon.usos_maximos && cupon.usos_actuales >= cupon.usos_maximos) {
            return Response.json({ error: 'El cupón ha alcanzado su límite de usos' }, { status: 400 });
        }

        return Response.json({
            success: true,
            tipo: cupon.tipo,
            valor: cupon.valor,
            minimo_compra: cupon.minimo_compra,
            mensaje: cupon.tipo === 'porcentaje' ? `Descuento del ${cupon.valor}% aplicado` : `Descuento de $${cupon.valor} aplicado`
        });

    } catch (error) {
        console.error('Error aplicarCupon:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
