// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { productoData, atributos } = await req.json();
        // Validamos campos requeridos básicos
        if (!productoData || !productoData.titulo || !productoData.precio_estandar) {
            return Response.json({ error: 'Parámetros incompletos: Titulo y Precio son obligatorios' }, { status: 400 });
        }
        // BACKEND VALIDA PRECIO
        const precioEstandar = parseFloat(productoData.precio_estandar);
        if (precioEstandar <= 0) {
            return Response.json({ error: 'Precio debe ser mayor a 0' }, { status: 400 });
        }
        if (!productoData.categoria || productoData.categoria.trim() === '') {
            return Response.json({ error: 'Categoría es obligatoria' }, { status: 400 });
        }
        // BLINDAJE: ID SOBERANO (Dinámico)
        // Buscamos cuál es TU ID real en la base de datos
        const comercios = await base44.asServiceRole.entities.Comercio.filter({
            email_admin: user.email
        }, '-created_date', 1);
        if (!comercios[0] || !comercios[0].id_comercio) {
            return Response.json({ error: "Usuario no tiene ID Comercio asignado. Ejecute vincularNuevoUsuario primero." }, { status: 400 });
        }
        const SOVEREIGN_ID = comercios[0].id_comercio;
        // Crear producto con ID Comercio forzado
        const nuevoProducto = await base44.asServiceRole.entities.Producto.create({
            ...productoData,
            id_comercio: SOVEREIGN_ID, // Sobrescribe cualquier cosa que venga del front
            precio_estandar: precioEstandar,
            precio_minimo: precioEstandar * 0.60,
            stock_actual: parseInt(productoData.stock_actual || 0),
            costo_producto: parseFloat(productoData.costo_producto || 0),
            activo: true,
            total_vendidos: 0,
            promedio_estrellas: 0,
            total_resenas: 0,
            vistas_totales: 0
        });
        // Crear atributos si existen
        if (atributos && atributos.length > 0) {
            const atributosParaCrear = atributos.map((attr, index) => ({
                id_producto: nuevoProducto.id,
                nombre_atributo: attr.nombre_atributo,
                valor_atributo: attr.valor_atributo,
                ia_weight: attr.ia_weight || 5,
                orden: index
            }));
            await base44.asServiceRole.entities.AtributoProducto.bulkCreate(atributosParaCrear);
        }
        return Response.json({
            success: true,
            producto: nuevoProducto,
            mensaje: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('Error crearProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
