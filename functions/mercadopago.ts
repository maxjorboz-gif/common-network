// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ordenId } = await req.json();

    if (!ordenId) {
      return Response.json({ error: 'ordenId requerido' }, { status: 400 });
    }

    // 1. OBTENER ORDEN (Usamos filter para ser specs-compliant)
    // Ya tiene todo lo necesario embebido gracias a finalizarCompra.ts
    const ordenes = await base44.asServiceRole.entities.Orden.filter({ id: ordenId }, '-created_date', 1);
    const orden = ordenes[0];

    if (!orden) return Response.json({ error: 'Orden no encontrada' }, { status: 404 });

    // 2. EXTRAER DATOS (Usa lo que ya guardó finalizarCompra)
    // Fallback seguro si faltan datos
    const cliente = orden.cliente || {};
    const envio = orden.logistica || orden.datos_envio || {};
    const hashes = orden.hashes_generados || {};

    // 3. MERCADO PAGO PREFERENCE
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MP_ACCESS_TOKEN) return Response.json({ error: 'Falta configurar MP_ACCESS_TOKEN' }, { status: 500 });

    const origin = req.headers.get('origin') || 'https://tuparilla.com';

    const mpItems = orden.items.map((item) => ({
      title: item.titulo,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio_unitario || item.pNum),
      currency_id: 'ARS'
    }));

    const preferenceBody = {
      items: mpItems,
      back_urls: {
        // Rutas normalizadas a minúsculas
        success: `${origin}/checkout?payment=success&external_reference=${orden.numero_orden || orden.id}`,
        failure: `${origin}/checkout?payment=failure`,
        pending: `${origin}/checkout?payment=pending`
      },
      auto_return: 'approved',
      external_reference: orden.numero_orden || orden.id, // ID Linkeado para webhook
      payer: {
        name: cliente.nombre_completo || 'Cliente',
        email: cliente.email || 'guest@email.com',
        phone: {
          area_code: '54',
          number: cliente.telefono_whatsapp?.replace(/\D/g, '') || ''
        }
      },
      statement_descriptor: 'TIENDA PARRILLAS',
      metadata: {
        orden_id: orden.id,
        comercio_id: orden.id_comercio
      }
    };

    // Llamada a Mercado Pago
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preferenceBody)
    });

    const preference = await mpRes.json();
    if (!preference.id) {
      console.error('MP Error:', preference);
      throw new Error('No se pudo crear preferencia MP');
    }

    // 4. META EVENTO (InitiateCheckout)
    // Usamos los hashes YA calculados en finalizarCompra
    // No bloqueamos el flujo principal si Meta falla
    try {
      const META_DATASET_ID = Deno.env.get('META_DATASET_ID');
      const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

      if (META_DATASET_ID && META_ACCESS_TOKEN) {
        const eventId = `init_chk_mp_${orden.id}_${Date.now()}`;
        const metaPayload = {
          data: [{
            event_name: 'InitiateCheckout',
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: 'website',
            user_data: {
              em: hashes.emH ? [hashes.emH] : [],
              ph: hashes.phH ? [hashes.phH] : [],
              fbp: orden.fbp,
              fbc: orden.fbc,
              client_user_agent: orden.userAgent
            },
            custom_data: {
              content_ids: orden.items.map((i) => i.id_producto),
              value: Number(orden.resumen_economico?.total_final || orden.total),
              currency: 'ARS'
            }
          }]
        };

        await fetch(`https://graph.facebook.com/v18.0/${META_DATASET_ID}/events?access_token=${META_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload)
        });
      }
    } catch (e) { console.warn('Meta Warning:', e); }

    return Response.json({
      preference_id: preference.id,
      init_point: preference.init_point
    });

  } catch (error) {
    console.error('Error MP Function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
