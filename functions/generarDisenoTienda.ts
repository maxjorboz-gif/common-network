
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { descripcion_negocio, nombre_comercio, estilo } = await req.json().catch(() => ({}));

        if (!descripcion_negocio && !estilo) {
            return Response.json({ error: 'Falta información para generar el diseño.' }, { status: 400 });
        }

        const lowerDesc = (descripcion_negocio || '').toLowerCase();
        const requestedStyle = (estilo || '').toLowerCase();

        let brand_color = '#000000';
        let lead_hook_titulo = '¡No te vayas sin tu descuento!';
        let estilo_visual = 'estándar';
        let mensaje = '';

        // Prioridad: Estilo solicitado explícitamente > Análisis de descripción > Default

        if (requestedStyle.includes('corporativo') || requestedStyle.includes('serio')) {
            brand_color = '#0F172A'; // Slate-900
            estilo_visual = 'corporativo';
            lead_hook_titulo = 'Beneficio exclusivo para clientes.';
            mensaje = 'Aplicando estilo sobrio y profesional para transmitir confianza.';

        } else if (requestedStyle.includes('minimalista') || requestedStyle.includes('moderno')) {
            brand_color = '#404040'; // Neutral-700
            estilo_visual = 'minimalista';
            lead_hook_titulo = 'Un detalle simple para vos.';
            mensaje = 'Diseño limpio y moderno ("Less is more").';

        } else if (requestedStyle.includes('llamativo') || requestedStyle.includes('oferta')) {
            brand_color = '#DC2626'; // Red-600
            estilo_visual = 'agresivo';
            lead_hook_titulo = '¡STOP! 🔥 OFERTA DE ÚLTIMO MOMENTO';
            mensaje = 'Colores vibrantes y textos urgentes para maximizar ventas.';

        } else if (requestedStyle.includes('natural') || requestedStyle.includes('calmo')) {
            brand_color = '#059669'; // Emerald-600
            estilo_visual = 'natural';
            lead_hook_titulo = 'Tu bienestar nos importa 🌿';
            mensaje = 'Tonos verdes y comunicación relajada.';

        } else {
            // Lógica automática basada en descripción (si no se eligió botón específico o es "Auto")
            if (lowerDesc.match(/comida|parrilla|asado|hamburguesa|food|restaurante/)) {
                brand_color = '#EA580C'; // Orange-600
                estilo_visual = 'vibrante';
                lead_hook_titulo = `¡Se te enfría el pedido! 🍔`;
            } else if (lowerDesc.match(/ropa|moda|fashion|indumentaria|style/)) {
                brand_color = '#171717';
                estilo_visual = 'sofisticado';
                lead_hook_titulo = `Un detalle exclusivo te espera... ✨`;
            } else if (lowerDesc.match(/tecno|celular|iphone|gamer/)) {
                brand_color = '#3B82F6';
                estilo_visual = 'tecnológico';
                lead_hook_titulo = `¡Upgrade disponible! 🚀`;
            } else if (lowerDesc.match(/lujo|joya|reloj|oro|premium/)) {
                brand_color = '#CA8A04'; // Gold
                estilo_visual = 'lujoso';
                lead_hook_titulo = `La oportunidad es ahora. 💎`;
            } else {
                mensaje = 'No detectamos un nicho claro, aplicando estilo versátil.';
            }
        }

        if (!mensaje) {
            mensaje = `Diseño ${estilo_visual} generado para tu negocio de ${descripcion_negocio.substring(0, 15)}...`;
        }

        const propuesta = {
            brand_color_primary: brand_color,
            lead_hook_titulo: lead_hook_titulo,
            estilo_sugerido: estilo_visual,
            mensaje_agente: mensaje
        };

        return Response.json({
            success: true,
            data: propuesta
        });

    } catch (error) {
        console.error('Error generando diseño:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
