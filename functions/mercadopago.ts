// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_ORDEN = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden";
const URL_EVENTO_META = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/EventoMeta";

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { ordenId } = await req.json();

    if (!ordenId) {
      return Response.json({ error: 'ordenId requerido' }, { status: 400 });
    }

    // 1. OBTENER ORDEN (URL Directa)
    const responseOrden = await fetch(`${URL_ORDEN}/${ordenId}`, {
      headers: { 'api_key': API_KEY }
    });

    if (!responseOrden.ok) {
      return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    const orden = await responseOrden.json();

    // 2. EXTRAER DATOS
    const cliente = orden.cliente || {};
    const hashes = orden.hashes_generados || {};

    // 3. MERCADO PAGO PREFERENCE
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MP_ACCESS_TOKEN) return Response.json({ error: 'Falta configurar MP_ACCESS_TOKEN' }, { status: 500 });

    const origin = req.headers.get('origin') || 'https://tuparilla.com';

    const mpItems = orden.items.map((item) => ({
      title: item.titulo,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio_unitario || item.precio_estandar),
      currency_id: 'ARS'
    }));

    const preferenceBody = {
      items: mpItems,
      back_urls: {
        success: `${origin}/checkout?payment=success&external_reference=${orden.numero_orden || orden.id || orden._id}`,
        failure: `${origin}/checkout?payment=failure`,
        pending: `${origin}/checkout?payment=pending`
      },
      auto_return: 'approved',
      external_reference: orden.numero_orden || orden.id || orden._id,
      payer: {
        name: cliente.nombre_completo || 'Cliente',
        email: cliente.email || 'guest@email.com',
        phone: {
          area_code: '54',
          number: cliente.telefono_whatsapp?.replace(/\D/g, '') || ''
        }
      },
      metadata: {
        orden_id: orden.id || orden._id,
        comercio_id: orden.commerce_code || orden.id_comercio
      }
    };

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

    // 4. REGISTRAR EVENTO META (Iniciado Checkout en MercadoPago)
    try {
      const eventId = `init_chk_mp_${orden.id || orden._id}_${Date.now()}`;
      await fetch(URL_EVENTO_META, {
        method: 'POST',
        headers: {
          'api_key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: eventId,
          event_name: 'InitiateCheckout',
          id_comercio: orden.commerce_code || orden.id_comercio,
          user_data: {
            em: hashes.emH ? [hashes.emH] : [],
            ph: hashes.phH ? [hashes.phH] : [],
            fbp: orden.fbp,
            fbc: orden.fbc,
            client_user_agent: orden.userAgent
          },
          custom_data: {
            content_ids: orden.items?.map((i) => i.id_producto),
            value: Number(orden.resumen_economico?.total_final || orden.total),
            currency: 'ARS'
          },
          action_source: 'website',
          event_time: Math.floor(Date.now() / 1000)
        })
      });
    } catch (e) {
      console.warn('Error registrando EventoMeta en MP:', e);
    }

    return Response.json({
      preference_id: preference.id,
      init_point: preference.init_point
    });

  } catch (error) {
    console.error('Error MP Function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
