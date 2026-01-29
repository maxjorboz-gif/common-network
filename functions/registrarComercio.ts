// @ts-nocheck
// Lógica Directa: Recibir datos -> Fetch a Base44 -> Responder
// Sin Auth, sin parches, sin lógica extra.

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK"); // CORS

        const body = await req.json();
        const { action, ...data } = body;

        // Generamos datos requeridos por la DB
        const commerceCode = Math.random().toString(36).substring(2, 12).toUpperCase();

        // Construimos el payload EXACTO para Base44
        const entityPayload = {
            nombre: data.nombre_comercio,
            email_negocio: data.email,
            whatsapp_negocio: data.whatsapp,

            // Campos requeridos por tu Schema (user_id eliminado bajo supuesto de que ya es opcional)
            commerce_code: commerceCode,

            // Valores por defecto
            estado_registro: "pendiente_pago",
            numero_operacion: "PENDIENTE",
            activo: false,
            plan: "bronce",
            configuracion_avanzada: {
                full_name: data.full_name
            }
        };

        // EL FETCH (Tal cual tu snippet, adaptado a POST)
        console.log("Enviando a Base44:", BASE44_URL);

        const response = await fetch(BASE44_URL, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entityPayload)
        });

        const result = await response.json();

        // Si Base44 devuelve error estructurado
        if (result.error || (result.code && result.message)) {
            throw new Error(result.message || result.error || "Error Base44");
        }

        // Respuesta limpia al Frontend
        return Response.json({
            success: true,
            id_solicitud: result.id || result._id,
            commerce_code: commerceCode
        });

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
