
// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req: Request) => {
    try {
        if (req.method === 'OPTIONS') return new Response('OK'); // CORS

        const { id_comercio } = await req.json();

        if (!id_comercio) {
            return Response.json({ error: 'Falta ID de comercio (id_comercio)' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. OBTENER PRODUCTOS (SDK FILTER)
        // MAPPING: id_comercio -> commerce_code
        const productos = await adminClient.entities.Producto.filter({
            commerce_code: id_comercio
        });

        // 2. OBTENER ATRIBUTOS (Para que el panel de edición funcione completo)
        // ESTRATEGIA OPTIMIZADA: Get all attributes y filtrar en memoria por IDs de mis productos.
        // Nota: Base44 SDK filter accept limited operators currently.
        const misProductoIds = new Set(productos.map(p => p.id || p._id));

        let atributos = [];
        try {
            // Fetching all (or constrained list) and filtering
            const todosAtributos = await adminClient.entities.AtributoProducto.list({ limit: 500 }); // Reasonable limit for now
            atributos = todosAtributos.filter(a => misProductoIds.has(a.id_producto));
        } catch (e) {
            console.warn("Error fetching atributos:", e);
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
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
