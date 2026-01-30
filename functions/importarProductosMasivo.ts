
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91"; // Hardcoded por seguridad y consistencia
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { commerce_code, productos } = await req.json();

        if (!commerce_code) {
            return new Response(JSON.stringify({ error: "commerce_code requerido" }), { headers: corsHeaders, status: 400 });
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            return new Response(JSON.stringify({ error: "Lista de productos vacía" }), { headers: corsHeaders, status: 400 });
        }

        console.log(`[Importación Masiva] Procesando ${productos.length} items para ${commerce_code}`);

        const resultados = {
            exitosos: 0,
            fallidos: 0,
            errores: []
        };

        // Procesamos en paralelo para velocidad, pero con cuidado de rate limits si fuera necesario.
        // Base44 suele aguantar bien. Hacemos promesas.

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

                // Insertar
                const response = await fetch(URL_PRODUCTO, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api_key': API_KEY
                    },
                    body: JSON.stringify(nuevoProducto)
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`API Error: ${response.status} - ${errorData}`);
                }

                resultados.exitosos++;

            } catch (error) {
                console.error(`Error importando item ${index}:`, error);
                resultados.fallidos++;
                resultados.errores.push(`Item ${index + 1} (${prod.titulo}): ${error.message}`);
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

    } catch (error) {
        console.error("Error general en importación:", error);
        return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
    }
});
