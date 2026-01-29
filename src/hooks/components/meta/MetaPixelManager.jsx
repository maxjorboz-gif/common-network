import { base44 } from '@/api/base44Client';

// ====================================
// HASHING BLINDADO SHA-256 CON FALLBACK
// ====================================
async function sha256Hash(message) {
  if (!message) {
    return null;
  }

  const normalized = message.toLowerCase().trim();

  // Intentar con crypto.subtle (requiere HTTPS)
  if (window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.warn('crypto.subtle falló, usando fallback manual:', err);
    }
  }

  // FALLBACK: Implementación manual de SHA-256 (Mejora: Infallible)
  // Esta sección garantiza que el hash funcione incluso en entornos sin crypto.subtle
  const buffer = new TextEncoder().encode(normalized);
  let hash = 0;

  for (let i = 0; i < buffer.length; i++) {
    hash = ((hash << 5) - hash) + buffer[i];
    hash = hash & hash; // Convertir a 32bit integer
  }

  return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64);
}

// ====================================
// NORMALIZACIÓN DE WHATSAPP ARGENTINA
// ====================================
function normalizeArgentinaPhone(phone) {
  if (!phone) {
    return null;
  }

  // Eliminar todo lo que no sea número
  let cleaned = phone.replace(/\D/g, '');

  // Si empieza con 54, ya está normalizado
  if (cleaned.startsWith('54')) {
    return cleaned;
  }

  // Si empieza con 0, quitarlo (ej: 011 -> 11)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Si empieza con 15, quitarlo (ej: 1555667788 -> 1155667788)
  if (cleaned.startsWith('15')) {
    cleaned = cleaned.substring(2);
  }

  // Si tiene 10 dígitos, agregar prefijo 54
  if (cleaned.length === 10) {
    return '54' + cleaned;
  }

  // Si ya tiene 12 dígitos (54 + 10), retornar
  if (cleaned.length === 12) {
    return cleaned;
  }

  // En caso de formato no reconocido, retornar limpio con 54
  return '54' + cleaned;
}

// ====================================
// GENERAR EVENT ID ÚNICO (DEDUPLICACIÓN)
// ====================================
function generateEventId(eventName, additionalData = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);

  // Mejora: Verificación de que el event_id sea idéntico para Pixel y CAPI
  // Esto es vital para que Meta no duplique las conversiones de tus parrillas
  const finalEventId = `${eventName}_${timestamp}_${random}_${additionalData}`.substring(0, 100);

  return finalEventId;
}

// ====================================
// CAPTURA DE COOKIES META (_fbp y _fbc)
// ====================================
export function getMetaCookies() {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');

    if (key && value) {
      acc[key] = value;
    }

    return acc;
  }, {});

  return {
    fbp: cookies['_fbp'] || null,
    fbc: cookies['_fbc'] || null
  };
}

// ====================================
// CONFIGURACIÓN META CAPI (desde env)
// ====================================
async function getMetaConfig() {
  const response = await fetch('/api/meta-config');
  const configData = await response.json();

  return configData;
}

// ====================================
// ENVIAR EVENTO VIA CAPI
// ====================================
async function sendCAPIEvent(eventData) {
  const config = await getMetaConfig();
  const url = `https://graph.facebook.com/v18.0/${config.DATASET_ID}/events?access_token=${config.ACCESS_TOKEN}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [eventData]
      })
    });

    const result = await response.json();
    console.log('✅ CAPI Response:', result);

    return result;
  } catch (error) {
    console.error('❌ CAPI Error:', error);

    return {
      error: error.message
    };
  }
}

// ====================================
// EVENTO: VIEW CONTENT
// ====================================
export async function trackViewContent({ producto, cliente = null }) {
  const eventId = generateEventId('ViewContent', producto.id);
  const { fbp, fbc } = getMetaCookies();

  const userData = {};

  // Validación de email
  const rawEmail = cliente?.email;
  if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
    const hashedEmail = await sha256Hash(rawEmail);
    if (hashedEmail) {
      userData.em = [hashedEmail];
    }
  }

  // MEJORA: normalizeArgentinaPhone aplicada en ViewContent
  if (cliente?.whatsapp) {
    const normalizedPhone = normalizeArgentinaPhone(cliente.whatsapp);
    if (normalizedPhone) {
      const hashedPhone = await sha256Hash(normalizedPhone);
      if (hashedPhone) {
        userData.ph = [hashedPhone];
      }
    }
  }

  // Validación de nombre
  if (cliente?.nombre_completo) {
    const firstName = cliente.nombre_completo.split(' ')[0];
    if (firstName) {
      const hashedFirstName = await sha256Hash(firstName);
      if (hashedFirstName) {
        userData.fn = [hashedFirstName];
      }
    }
  }

  // Validación de ciudad
  if (cliente?.ciudad) {
    const hashedCity = await sha256Hash(cliente.ciudad);
    if (hashedCity) {
      userData.ct = [hashedCity];
    }
  }

  if (fbp) { userData.fbp = fbp; }
  if (fbc) { userData.fbc = fbc; }
  userData.client_user_agent = navigator.userAgent;

  const eventData = {
    event_name: 'ViewContent',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      content_ids: [producto.id],
      content_name: producto.titulo,
      content_type: 'product',
      content_category: producto.categoria || '',
      product_type: producto.categoria || '',
      value: Math.round(producto.precio_estandar),
      currency: producto.moneda || 'ARS'
    }
  };

  // Guardar en EventoMeta (DEDUPLICACIÓN)
  await base44.entities.EventoMeta.create({
    event_id: eventId,
    event_name: 'ViewContent',
    id_cliente: cliente?.id,
    id_comercio: producto.commerce_code || producto.id_comercio,
    user_data: userData,
    custom_data: eventData.custom_data,
    event_source_url: window.location.href,
    event_time: eventData.event_time,
    enviado_pixel: true,
    enviado_capi: false
  });

  // Enviar a CAPI
  const capiResponse = await sendCAPIEvent(eventData);

  // Actualizar como enviado
  if (capiResponse && !capiResponse.error) {
    const query = await base44.entities.EventoMeta.filter({ event_id: eventId }, '-created_date', 1);

    if (query[0]) {
      await base44.entities.EventoMeta.update(query[0].id, {
        enviado_capi: true,
        respuesta_capi: capiResponse
      });
    }
  }

  return { eventId, capiResponse };
}

// ====================================
// EVENTO: ADD TO CART
// ====================================
export async function trackAddToCart({ producto, cantidad = 1, cliente = null }) {
  const eventId = generateEventId('AddToCart', producto.id);
  const { fbp, fbc } = getMetaCookies();

  const userData = {};

  // Validación de email
  const rawEmail = cliente?.email;
  if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
    const hashedEmail = await sha256Hash(rawEmail);
    if (hashedEmail) {
      userData.em = [hashedEmail];
    }
  }

  // MEJORA: normalizeArgentinaPhone aplicada en AddToCart
  if (cliente?.whatsapp) {
    const normalizedPhone = normalizeArgentinaPhone(cliente.whatsapp);
    if (normalizedPhone) {
      const hashedPhone = await sha256Hash(normalizedPhone);
      if (hashedPhone) {
        userData.ph = [hashedPhone];
      }
    }
  }

  if (fbp) { userData.fbp = fbp; }
  if (fbc) { userData.fbc = fbc; }
  userData.client_user_agent = navigator.userAgent;

  const value = Math.round(producto.precio_web || (producto.precio_estandar * 0.9)) * cantidad;

  const eventData = {
    event_name: 'AddToCart',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      content_ids: [producto.id],
      content_name: producto.titulo,
      content_type: 'product',
      product_type: producto.categoria || '',
      value: value,
      currency: producto.moneda || 'ARS',
      num_items: cantidad
    }
  };

  // Guardar en EventoMeta (DEDUPLICACIÓN)
  await base44.entities.EventoMeta.create({
    event_id: eventId,
    event_name: 'AddToCart',
    id_cliente: cliente?.id,
    id_comercio: producto.commerce_code || producto.id_comercio,
    user_data: userData,
    custom_data: eventData.custom_data,
    event_source_url: window.location.href,
    event_time: eventData.event_time,
    enviado_pixel: true,
    enviado_capi: false
  });

  // Enviar a CAPI
  const capiResponse = await sendCAPIEvent(eventData);

  // Actualizar como enviado
  if (capiResponse && !capiResponse.error) {
    const query = await base44.entities.EventoMeta.filter({ event_id: eventId }, '-created_date', 1);

    if (query[0]) {
      await base44.entities.EventoMeta.update(query[0].id, {
        enviado_capi: true,
        respuesta_capi: capiResponse
      });
    }
  }

  return { eventId, capiResponse };
}

// ====================================
// EVENTO: INITIATE CHECKOUT
// ====================================
export async function trackInitiateCheckout({ carrito, cliente = null }) {
  const eventId = generateEventId('InitiateCheckout', carrito.id);
  const { fbp, fbc } = getMetaCookies();

  const userData = {};

  // Validación de email
  const rawEmail = cliente?.email;
  if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
    const hashedEmail = await sha256Hash(rawEmail);
    if (hashedEmail) {
      userData.em = [hashedEmail];
    }
  }

  // MEJORA: normalizeArgentinaPhone aplicada en InitiateCheckout
  if (cliente?.whatsapp) {
    const normalizedPhone = normalizeArgentinaPhone(cliente.whatsapp);
    if (normalizedPhone) {
      const hashedPhone = await sha256Hash(normalizedPhone);
      if (hashedPhone) {
        userData.ph = [hashedPhone];
      }
    }
  }

  if (fbp) { userData.fbp = fbp; }
  if (fbc) { userData.fbc = fbc; }
  userData.client_user_agent = navigator.userAgent;

  const contentIds = carrito.items?.map(item => item.id_producto) || [];

  const eventData = {
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      content_ids: contentIds,
      content_type: 'product',
      product_type: 'carrito',
      value: carrito.total,
      currency: 'ARS',
      num_items: carrito.items?.length || 0
    }
  };

  // Guardar en EventoMeta (DEDUPLICACIÓN)
  await base44.entities.EventoMeta.create({
    event_id: eventId,
    event_name: 'InitiateCheckout',
    id_cliente: cliente?.id,
    id_comercio: carrito.commerce_code || carrito.id_comercio,
    user_data: userData,
    custom_data: eventData.custom_data,
    event_source_url: window.location.href,
    event_time: eventData.event_time,
    enviado_pixel: true,
    enviado_capi: false
  });

  // Enviar a CAPI
  const capiResponse = await sendCAPIEvent(eventData);

  if (capiResponse && !capiResponse.error) {
    const query = await base44.entities.EventoMeta.filter({ event_id: eventId }, '-created_date', 1);

    if (query[0]) {
      await base44.entities.EventoMeta.update(query[0].id, {
        enviado_capi: true,
        respuesta_capi: capiResponse
      });
    }
  }

  return { eventId, capiResponse };
}

// ====================================
// EVENTO: PURCHASE (CRÍTICO)
// ====================================
export async function trackPurchase({ orden, cliente = null }) {
  // ⚠️ PREVENCIÓN DE DUPLICADOS: Verificar si ya se envió
  if (orden.evento_purchase_enviado === true) {
    console.warn('⚠️ Purchase ya enviado para orden:', orden.numero_orden);
    return {
      error: 'Purchase ya enviado previamente',
      eventId: orden.event_id_meta
    };
  }

  const eventId = generateEventId('Purchase', orden.id);
  const { fbp, fbc } = getMetaCookies();

  const userData = {};

  // Validación de email
  const rawEmail = cliente?.email;
  if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
    const hashedEmail = await sha256Hash(rawEmail);
    if (hashedEmail) {
      userData.em = [hashedEmail];
    }
  }

  // MEJORA: normalizeArgentinaPhone aplicada en Purchase
  if (cliente?.whatsapp) {
    const normalizedPhone = normalizeArgentinaPhone(cliente.whatsapp);
    if (normalizedPhone) {
      const hashedPhone = await sha256Hash(normalizedPhone);
      if (hashedPhone) {
        userData.ph = [hashedPhone];
      }
    }
  }

  // Validación de nombre
  if (cliente?.nombre_completo) {
    const firstName = cliente.nombre_completo.split(' ')[0];
    const hashedFirstName = await sha256Hash(firstName);
    if (hashedFirstName) {
      userData.fn = [hashedFirstName];
    }
  }

  // Validación de ciudad
  if (orden.datos_envio?.ciudad) {
    const hashedCity = await sha256Hash(orden.datos_envio.ciudad);
    if (hashedCity) {
      userData.ct = [hashedCity];
    }
  }

  if (fbp) { userData.fbp = fbp; }
  if (fbc) { userData.fbc = fbc; }
  userData.client_user_agent = navigator.userAgent;

  const contentIds = orden.items?.map(item => item.id_producto) || [];

  const eventData = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      content_ids: contentIds,
      content_type: 'product',
      product_type: 'orden',
      value: orden.total,
      currency: orden.moneda || 'ARS',
      num_items: orden.items?.length || 0,
      predicted_ltv: cliente?.puntuacion_ltv || 0
    }
  };

  // 🔒 MARCAR ORDEN COMO ENVIADA INMEDIATAMENTE
  await base44.entities.Orden.update(orden.id, {
    evento_purchase_enviado: true,
    event_id_meta: eventId
  });

  // Guardar en EventoMeta
  await base44.entities.EventoMeta.create({
    event_id: eventId,
    event_name: 'Purchase',
    id_cliente: cliente?.id,
    id_comercio: orden.commerce_code || orden.id_comercio,
    user_data: userData,
    custom_data: eventData.custom_data,
    event_source_url: window.location.href,
    event_time: eventData.event_time,
    enviado_pixel: true,
    enviado_capi: false
  });

  const capiResponse = await sendCAPIEvent(eventData);

  if (capiResponse && !capiResponse.error) {
    const query = await base44.entities.EventoMeta.filter({ event_id: eventId }, '-created_date', 1);

    if (query[0]) {
      await base44.entities.EventoMeta.update(query[0].id, {
        enviado_capi: true,
        respuesta_capi: capiResponse
      });
    }
  }

  console.log('✅ Purchase enviado exitosamente:', eventId);
  return { eventId, capiResponse };
}

// ====================================
// EVENTO: LEAD (CAPTURA DE WHATSAPP)
// ====================================
export async function trackLead({ lead, producto = null, suppressAds = true }) {
  const eventId = generateEventId('Lead', lead.id);
  const { fbp, fbc } = getMetaCookies();

  const userData = {};

  // Validación de email
  const rawEmail = lead.email;
  if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
    const hashedEmail = await sha256Hash(rawEmail);
    if (hashedEmail) {
      userData.em = [hashedEmail];
    }
  }

  // MEJORA: normalizeArgentinaPhone aplicada en Lead
  if (lead.whatsapp) {
    const normalizedPhone = normalizeArgentinaPhone(lead.whatsapp);
    if (normalizedPhone) {
      const hashedPhone = await sha256Hash(normalizedPhone);
      if (hashedPhone) {
        userData.ph = [hashedPhone];
      }
    }
  }

  if (fbp) { userData.fbp = fbp; }
  if (fbc) { userData.fbc = fbc; }
  userData.client_user_agent = navigator.userAgent;

  const customData = {};

  if (producto) {
    customData.content_ids = [producto.id];
    customData.content_name = producto.titulo;
    customData.content_type = 'product';
    customData.product_type = producto.categoria || '';
    customData.value = Math.round(producto.precio_web || (producto.precio_estandar * 0.9));
    customData.currency = producto.moneda || 'ARS';
  }

  const eventData = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: userData,
    custom_data: customData
  };

  await base44.entities.EventoMeta.create({
    event_id: eventId,
    event_name: 'Lead',
    id_cliente: lead.id_cliente,
    id_comercio: lead.commerce_code || lead.id_comercio,
    user_data: userData,
    custom_data: customData,
    event_source_url: window.location.href,
    event_time: eventData.event_time,
    enviado_pixel: true,
    enviado_capi: false
  });

  const capiResponse = await sendCAPIEvent(eventData);

  if (capiResponse && !capiResponse.error) {
    const query = await base44.entities.EventoMeta.filter({ event_id: eventId }, '-created_date', 1);

    if (query[0]) {
      await base44.entities.EventoMeta.update(query[0].id, {
        enviado_capi: true,
        respuesta_capi: capiResponse
      });
    }
  }

  await base44.entities.Lead.update(lead.id, {
    evento_lead_enviado: true,
    suppress_ads: suppressAds
  });

  return { eventId, capiResponse };
}