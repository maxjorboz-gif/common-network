// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// CONSTANTES DE CONEXIÓN DIRECTA (Según Documentación Base44)
// Extraídas de tu panel:
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}`;

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

        // --- 1. CONFIGURAR CLIENTE DE AUTH (Solo para SignUp) ---
        // Usamos la API Key pública para intentar registrar el usuario en el sistema Auth
        const base44Auth = createClient("https://app.base44.com", API_KEY);

        if (action === 'create') {
            const { nombre_comercio, email, whatsapp, password, full_name } = data;

            // A) CREAR USUARIO (Auth Layer)
            // Intentamos crear el usuario. Si falla por duplicado, devolvemos error.
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
                    error: `Error de Autenticación: ${authError.message}. Si ya tienes cuenta, por favor inicia sesión.`
                }, { status: 400 });
            }

            const userId = authData.user?.id;
            if (!userId) {
                return Response.json({ success: false, error: "No se pudo generar el ID de usuario." }, { status: 500 });
            }

            // B) CREAR COMERCIO (Data Layer via FETCH DIRECTO)
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
                    source: "api_fetch_direct"
                }
            };

            // Llamada nativa según documentación Base44
            const response = await fetch(`${BASE_URL}/entities/Comercio`, {
                method: 'POST',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entityData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Entity Creation Error:", errorText);
                throw new Error(`Error al crear comercio en DB (${response.status}): ${errorText}`);
            }

            const result = await response.json();

            return Response.json({
                success: true,
                step: 'created',
                id_solicitud: result.id || result._id,
                commerce_code: commerce_code,
                message: "Comercio registrado exitosamente via API Nativa."
            });
        }

        if (action === 'update_payment') {
            const { id_solicitud, numero_operacion } = data;

            if (!id_solicitud) throw new Error("Falta ID de solicitud para actualizar");

            // Llamada nativa PUT para actualizar
            const response = await fetch(`${BASE_URL}/entities/Comercio/${id_solicitud}`, {
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
                throw new Error(`Error al actualizar pago (${response.status}): ${errorText}`);
            }

            return Response.json({
                success: true,
                step: 'payment_updated',
                message: "Pago registrado exitosamente"
            });
        }

        return Response.json({ error: "Acción no reconocida" }, { status: 400 });

    } catch (error) {
        console.error("Critical Function Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
