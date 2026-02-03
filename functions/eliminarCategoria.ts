// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const { id_comercio, category_name } = body;

        // MAPPING
        const commerce_code = id_comercio;

        if (!commerce_code || !category_name) {
            return Response.json({ error: 'Faltan datos requeridos (id_comercio, category_name)' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Obtener productos del comercio (SDK)
        const allProducts = await adminClient.entities.Producto.filter({
            commerce_code: commerce_code
        });

        const productsToUpdate = allProducts.filter(p => p.categoria === category_name);

        if (productsToUpdate.length === 0) {
            return Response.json({ success: true, message: 'No se encontraron productos en esta categoría', updated: 0 });
        }

        // 2. Actualizar productos (SDK Update)
        let updatedCount = 0;
        const errors = [];

        // Update in parallel (careful with concurrency limits if many, but Base44 scales)
        const updatePromises = productsToUpdate.map(async (prod) => {
            const prodId = prod.id || prod._id;
            try {
                await adminClient.entities.Producto.update(prodId, {
                    categoria: '' // Clear category
                });
                updatedCount++;
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                errors.push(`Error updating ${prodId}: ${errorMessage}`);
            }
        });

        await Promise.all(updatePromises);

        return Response.json({
            success: true,
            updated: updatedCount,
            total_found: productsToUpdate.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error eliminarCategoria:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
