// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// ==========================================
// REGISTRO DE COMERCIO - LÓGICA DIRECTA V2
// ==========================================
// Objetivo: Crear la entidad comercio sin dependencias de Auth obsoletas.
// Estrategia: Fetch directo a API Entities usando Key pública.

// CREDENCIALES FIJAS (Environment Vacío Bypass)
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const PROJECT_URL = "https://common-network-a32d56fd.base44.app"; // Tu dominio real
const ENTITIES_API_URL = `${PROJECT_URL}/api/apps/${APP_ID}/entities`;

// Helper: Generador de códigos únicos
function generateCommerceCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

Deno.serve(async (req) => {
    try {
        // Parseo seguro del Body
        let body = {};
        try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }

        const { action = 'create', ...data } = body;
        console.log(`Procesando acción: ${action}`);

        // ---------------------------------------------------------
        // CASO 1: CREAR NUEVO COMERCIO (Paso 1 del Formulario)
        // ---------------------------------------------------------
        if (action === 'create') {
            const { nombre_comercio, email, whatsapp, full_name } = data;

            // VALIDACIÓN BÁSICA
            if (!email || !nombre_comercio) {
                return Response.json({ success: false, error: "Faltan datos obligatorios (email o nombre)" }, { status: 400 });
            }

            // GENERACIÓN DE IDs
            const commerce_code = generateCommerceCode();
            // User ID Placeholder (Requisito DB): Usamos UUID aleatorio ya que Auth se gestiona post-registro
            const userIdPlaceholder = crypto.randomUUID();

            // CONSTRUCCIÓN DEL OBJETO ENTIDAD (Schema Strict Compliance)
            const entityData = {
                nombre: nombre_comercio,
                user_id: userIdPlaceholder,
                commerce_code: commerce_code,
                // Campos opcionales pero útiles
                email_negocio: email,
                whatsapp_negocio: whatsapp || "",
                // Estados iniciales
                estado_registro: "pendiente_pago",
                numero_operacion: "PENDIENTE",
                slug: commerce_code, // Slug inicial igual al código
                activo: false,       // Inactivo hasta que pague/aprueben
                plan: "bronce",
                // Metadata extra
                configuracion_avanzada: {
                    full_name_solicitante: full_name,
                    registro_fecha: new Date().toISOString(),
                    origen: "registro_web_directo"
                }
            };

            // INSERCIÓN EN BASE DE DATOS (API NATIVA BASE44)
            console.log(`Intentando crear comercio en: ${ENTITIES_API_URL}/Comercio`);

            const response = await fetch(`${ENTITIES_API_URL}/Comercio`, {
                method: 'POST',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entityData)
            });

            // MANEJO DE RESPUESTA DB
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error DB (${response.status}):`, errorText);
                return Response.json({
                    success: false,
                    error: `Error al guardar datos: ${errorText}`
                }, { status: 500 });
            }

            const result = await response.json();
            const idSolicitud = result.id || result._id;

            // ÉXITO
            return Response.json({
                success: true,
                step: 'created',
                id_solicitud: idSolicitud,
                commerce_code: commerce_code,
                message: "Comercio pre-registrado correctamente. Avance al pago."
            });
        }

        // ---------------------------------------------------------
        // CASO 2: ACTUALIZAR PAGO (Paso 2 del Formulario)
        // ---------------------------------------------------------
        if (action === 'update_payment') {
            const { id_solicitud, numero_operacion } = data;

            if (!id_solicitud) {
                return Response.json({ success: false, error: "Falta ID de solicitud para imputar pago" }, { status: 400 });
            }

            // Actualización vía API Nativa (PUT)
            const response = await fetch(`${ENTITIES_API_URL}/Comercio/${id_solicitud}`, {
                method: 'PUT',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_operacion: numero_operacion,
                    estado_registro: 'pendiente_aprobacion',
                    fecha_pago: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                return Response.json({ success: false, error: `Error impactando pago: ${errorText}` }, { status: 500 });
            }

            return Response.json({
                success: true,
                step: 'payment_updated',
                message: "Pago registrado. Su solicitud está en revisión."
            });
        }

        // ACCIÓN DESCONOCIDA
        return Response.json({ error: "Acción no reconocida por el servidor" }, { status: 400 });

    } catch (error) {
        // CATCH-ALL PARA CRASHES IMPREVISTOS
        console.error("Critical Function Crash:", error);
        return Response.json({ success: false, error: `Error Interno Crítico: ${error.message}` }, { status: 500 });
    }
});
