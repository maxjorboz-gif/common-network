import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Redondear al múltiplo más cercano (10 o 100)
function roundToNearest(value, multiple) {
    return Math.round(value / multiple) * multiple;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        const { productosIds, tipo, valor, modo, roundingOption = '10' } = await req.json();

        if (!productosIds || !tipo || !valor || !modo) {
            return Response.json({ error: 'Faltan datos' }, { status: 400 });
        }

        const todosProductos = await base44.asServiceRole.entities.Producto.list('-created_date', 5000);
        const productosAActualizar = todosProductos.filter(p => productosIds.includes(p.id));

        // Actualizar precios en paralelo
        const updatePromises = productosAActualizar.map(async (producto) => {
            let newPrice = producto.precio_estandar;

            if (modo === 'percentage') {
                newPrice = tipo === 'increase' 
                    ? producto.precio_estandar * (1 + valor / 100)
                    : producto.precio_estandar * (1 - valor / 100);
            } else {
                newPrice = tipo === 'increase'
                    ? producto.precio_estandar + valor
                    : producto.precio_estandar - valor;
            }

            newPrice = Math.max(newPrice, 0);

            // Aplicar redondeo
            let finalPrice = roundingOption === '10'
                ? roundToNearest(newPrice, 10)
                : roundingOption === '100'
                ? roundToNearest(newPrice, 100)
                : Math.round(newPrice);

            finalPrice = Math.max(finalPrice, 0);

            await base44.asServiceRole.entities.Producto.update(producto.id, {
                precio_estandar: finalPrice
            });
        });

        await Promise.all(updatePromises);

        return Response.json({
            success: true,
            actualizados: productosAActualizar.length,
            message: `✅ ${productosAActualizar.length} productos actualizados correctamente`
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});