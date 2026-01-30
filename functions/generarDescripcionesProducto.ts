
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { titulo, categoria, atributos, precio, estilo } = await req.json().catch(() => ({}));

        // NOTA: 'atributos' en el input aquí se refiere a "descripcion_tecnica" (texto crudo)
        // El usuario escribe las specs en el textarea y nosotros extraemos atributos estructurados de ahí.

        if (!titulo) {
            return Response.json({ error: 'Falta el título del producto' }, { status: 400 });
        }

        const priceStr = precio ? `$${Number(precio).toLocaleString('es-AR')}` : 'Consultar precio';
        const specsText = atributos || ''; // Input crudo del usuario (specs)

        // 1. GENERAR DESCRIPCIÓN COMERCIAL (Basada en estilo)
        let descripcion = '';
        const lowerStyle = (estilo || 'creativo').toLowerCase();

        if (lowerStyle.includes('sofisticado')) {
            descripcion = `Experimentá la excelencia con el nuevo ${titulo}. 
Una pieza diseñada para quienes no negocian la calidad. 
Distinción, funcionalidad y estilo en un solo producto.
Adquirilo hoy a un valor exclusivo de ${priceStr}.`;

        } else if (lowerStyle.includes('elegante')) {
            descripcion = `Sutileza y buen gusto definen al ${titulo}. 
Pensado para armonizar tus espacios y elevar tu experiencia diaria.
Disponible ahora para vos por ${priceStr}. La elegancia nunca pasa de moda.`;

        } else if (lowerStyle.includes('urgencia') || lowerStyle.includes('fuego')) {
            descripcion = `¡OFERTA LIMITADA! 🔥 Llevate el ${titulo} ANTES QUE SE AGOTE.
No dejes pasar esta oportunidad única de conseguir la mejor calidad al mejor precio: ${priceStr}.
¡Compra ahora! Stock crítico. Envíos inmediatos. 🚀`;

        } else { // Creativo / Default
            descripcion = `¡Descubrí el nuevo ${titulo}! ✨
La solución perfecta que estabas buscando para ${categoria || 'tu día a día'}.
Diseñado con los mejores materiales.
Llevatelo hoy por solo ${priceStr}. ¡No te quedes sin el tuyo!`;
        }

        // 2. GENERAR META PRODUCT CATEGORY (Normalización)
        // Lógica Mock: Detectar palabras clave para asignar categoría de Google/Meta
        let meta_category = 'Home & Garden'; // Default
        const lowerTitle = titulo.toLowerCase();

        if (lowerTitle.includes('parrilla') || lowerTitle.includes('asado') || lowerTitle.includes('fuego')) {
            meta_category = 'Home & Garden > Kitchen & Dining > Cookware > Outdoor Grills';
        } else if (lowerTitle.includes('set') || lowerTitle.includes('kit') || lowerTitle.includes('cuchillo')) {
            meta_category = 'Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils';
        } else if (lowerTitle.includes('tabla')) {
            meta_category = 'Home & Garden > Kitchen & Dining > Cutting Boards';
        }

        // 3. GENERAR ATRIBUTOS ESTRUCTURADOS (Extracción)
        // Intentamos sacar key-values del texto de specifications
        const extractedAttributes = [];

        // Mock Parsing: Buscamos líneas con ":"
        const lines = specsText.split('\n');
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, val] = line.split(':');
                if (key && val) {
                    extractedAttributes.push({
                        nombre: key.replace(/^-/, '').trim(),
                        valor: val.trim()
                    });
                }
            }
        });

        // Si no encontró nada, simulamos algunos basados en titulo
        if (extractedAttributes.length === 0) {
            if (lowerTitle.includes('acero')) extractedAttributes.push({ nombre: 'Material', valor: 'Acero Inoxidable' });
            if (lowerTitle.includes('madera')) extractedAttributes.push({ nombre: 'Material', valor: 'Madera Premium' });
            extractedAttributes.push({ nombre: 'Condición', valor: 'Nuevo' });
        }

        return Response.json({
            success: true,
            data: {
                descripcion: descripcion,
                meta_product_category: meta_category,
                atributos: extractedAttributes
            }
        });

    } catch (error) {
        console.error('Error generando descripciones:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
