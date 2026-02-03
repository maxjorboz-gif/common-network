// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { id_comercio, productos } = await req.json();

        // MAPPING: id_comercio -> commerce_code (internal logic)
        const commerce_code = id_comercio;

        if (!commerce_code) {
            return new Response(JSON.stringify({ error: "id_comercio requerido" }), { headers: corsHeaders, status: 400 });
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            return new Response(JSON.stringify({ error: "Lista de productos vacía" }), { headers: corsHeaders, status: 400 });
        }

        console.log(`[Importación Masiva] Procesando ${productos.length} items para ${commerce_code}`);

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        const resultados = {
            exitosos: 0,
            fallidos: 0,
            errores: [] as string[]
        };

        const promesas = productos.map(async (prod, index) => {
            try {
                // Validaciones mínimas
                if (!prod.titulo || !prod.precio_estandar) {
                    throw new Error("Falta título o precio");
                }

                // Normalizar datos
                const nuevoProducto = {
                    commerce_code,
                    titulo: String(prod.titulo).trim(),
                    descripcion: prod.descripcion || "",
                    descripcion_tecnica: prod.descripcion_tecnica || "",
                    precio_estandar: Number(prod.precio_estandar) || 0,
                    precio_minimo: 0, // Por defecto 0 si no se pasara, o lógica frontend
                    activar_minimos: false, // Default off
                    stock_actual: Number(prod.stock_actual) || 0,
                    categoria: prod.categoria || "General",
                    imagen_principal: prod.imagen_principal || "",
                    sku_taller_interno: prod.sku_taller_interno || `IMP-${Date.now()}-${index}`,
                    activo: true,
                    created_at: new Date().toISOString()
                };

                // Insertar con SDK
                await adminClient.entities.Producto.create(nuevoProducto);

                resultados.exitosos++;

            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error importando item ${index}:`, error);
                resultados.fallidos++;
                resultados.errores.push(`Item ${index + 1} (${prod.titulo}): ${errorMessage}`);
            }
        });

        await Promise.all(promesas);

        return new Response(JSON.stringify({
            success: true,
            message: `Proceso finalizado. ${resultados.exitosos} importados, ${resultados.fallidos} fallidos.`,
            detalles: resultados
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: unknown) {
        console.error("Error general en importación:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: errorMessage }), { headers: corsHeaders, status: 500 });
    }
});
