
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response('OK');

        const { productoId, productoData, atributos } = await req.json();

        if (!productoId || !productoData) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // 1. UPDATE PRODUCTO (Pattern)
        const updateResponse = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto/${productoId}`, {
            method: 'PUT',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });

        if (!updateResponse.ok) throw new Error('Error al actualizar producto en Base44');

        const productoActualizado = await updateResponse.json();

        // 2. UPDATE ATRIBUTOS (Get All, Filter, Delete Old, Create New)
        // A) GetAll (to filter by product)
        const getAttrs = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto`, {
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            }
        });

        if (getAttrs.ok) {
            const allAttrs = await getAttrs.json();
            const attrsToDelete = allAttrs.filter(a => a.id_producto === productoId);

            // Delete Old (Parallel)
            const deletePromises = attrsToDelete.map(a =>
                fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto/${a._id || a.id}`, {
                    method: 'DELETE',
                    headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
                })
            );
            await Promise.all(deletePromises);
        }

        // B) Create New
        if (atributos && atributos.length > 0) {
            const createPromises = atributos.map((attr, index) =>
                fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto`, {
                    method: 'POST',
                    headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91', 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_producto: productoId,
                        nombre_atributo: attr.nombre_atributo,
                        valor_atributo: attr.valor_atributo,
                        ia_weight: attr.ia_weight || 5,
                        orden: index
                    })
                })
            );
            await Promise.all(createPromises);
        }

        return Response.json({
            success: true,
            producto: productoActualizado,
            mensaje: 'Producto actualizado exitosamente'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});