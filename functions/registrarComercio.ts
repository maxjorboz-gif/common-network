// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// CONSTANTES DE CONEXIÓN DIRECTA
// App: Common Network (a32d56fd)
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

// URL REAL DE TU PROYECTO (No la genérica)
const PROJECT_URL = "https://common-network-a32d56fd.base44.app";
const API_BASE_URL = `${PROJECT_URL}/api/apps/${APP_ID}`;

// Helper para generar códigos
function generateCommerceCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

Deno.serve(async (req) => {
    try {
        let body;
        try { body = await req.json(); } catch { body = {}; }
        const { action = 'create', ...data } = body;

        // --- 1. CONFIGURAR CLIENTE DE AUTH ---
        // Usamos la URL correcta del proyecto
        const base44Auth = createClient(PROJECT_URL, API_KEY);

        if (action === 'create') {
            const { nombre_comercio, email, whatsapp, password, full_name } = data;

            // A) CREAR USUARIO (Auth Layer)
            const { data: authData, error: authError } = await base44Auth.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: full_name, commerce_registered: true }
                }
            });

            if (authError) {
                console.error("Auth Register Error:", authError);
                return Response.json({
                    success: false,
                    error: `Error de Autenticación: ${authError.message}. Intenta iniciar sesión.`
                }, { status: 400 });
            }

            const userId = authData.user?.id;
            if (!userId) {
                // Si signUp no devuelve ID (ej: confirmación requerida), usamos un placeholder o fallamos
                // Depende de config. Por ahora fallamos seguro.
                return Response.json({ success: false, error: "Registro de usuario incompleto. Verifique su email." }, { status: 400 });
            }

            // B) CREAR COMERCIO (Fetch Directo a tu App URL)
            const commerce_code = generateCommerceCode();

            const entityData = {
                nombre: nombre_comercio,
                email_negocio: email,
                whatsapp_negocio: whatsapp,
                user_id: userId,
                estado_registro: "pendiente_pago",
                numero_operacion: "PENDIENTE",
                commerce_code: commerce_code,
                slug: commerce_code,
                activo: false,
                plan: "bronce",
                configuracion_avanzada: {
                    full_name: full_name,
                    source: "api_fetch_fixed_url"
                }
            };

            const response = await fetch(`${API_BASE_URL}/entities/Comercio`, {
                method: 'POST',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entityData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Si falla Entity pero Auth ya se creó, es un estado inconsistente.
                // Idealmente borraríamos el usuario, pero no tenemos Admin Key.
                console.error("Entity Creation Error:", errorText);
                throw new Error(`Error BD (${response.status}): ${errorText}`);
            }

            const result = await response.json();

            return Response.json({
                success: true,
                step: 'created',
                id_solicitud: result.id || result._id,
                commerce_code: commerce_code,
                message: "Cuenta creada exitosamente."
            });
        }

        if (action === 'update_payment') {
            const { id_solicitud, numero_operacion } = data;
            if (!id_solicitud) throw new Error("Falta ID");

            const response = await fetch(`${API_BASE_URL}/entities/Comercio/${id_solicitud}`, {
                method: 'PUT',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_operacion: numero_operacion,
                    estado_registro: 'pendiente_aprobacion'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error Actualización (${response.status}): ${errorText}`);
            }

            return Response.json({
                success: true,
                step: 'payment_updated',
                message: "Pago registrado"
            });
        }

        return Response.json({ error: "Acción desconocida" }, { status: 400 });

    } catch (error) {
        console.error("Critical Register Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
