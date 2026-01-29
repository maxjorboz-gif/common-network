// @ts-nocheck
import { createClientFromRequest, createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// LOGICA V11: SISTEMA ROBUSTO DE REGISTRO
// - Paso 1: Crea Solicitud con Auth de Usuario (Vinculación)
// - Paso 2: Actualiza Pago con Service Role (Garantía de ejecución y bypass RLS)

Deno.serve(async (req) => {
    try {
        let body;
        try { body = await req.json(); } catch { body = {}; }
        const { action = 'create', ...data } = body;

        // Cliente estándar para Auth check inicial
        let userClient;
        try { userClient = createClientFromRequest(req); } catch (e) { /* ignore */ }

        // --- PASO 1: CREAR SOLICITUD (NATIVO - SIN GOOGLE PREVIO) ---
        if (action === 'create') {
            const { nombre_comercio, email, whatsapp, password, full_name } = data;

            // 1. Instanciar Cliente Admin (Service Role)
            const adminBase44 = createClient(
                Deno.env.get("BASE44_API_URL") ?? "",
                Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
            );

            let userId = null;
            let userCreatedNew = false;

            // 2. Intentar Crear Usuario de Auth (Base44/Supabase)
            const { data: newUser, error: authError } = await adminBase44.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: { full_name, commerce_registered: true }
            });

            if (authError) {
                // LÓGICA DE RECUPERACIÓN / REINTENTO ROBUSTO
                console.log("Usuario Auth ya existe o error:", authError.message);

                // Buscamos si ya tiene un comercio asociado a este email
                const { data: existingCommerce } = await adminBase44.entities.Comercio.filter({
                    email_negocio: email
                });

                if (existingCommerce && existingCommerce.length > 0) {
                    const comercio = existingCommerce[0];

                    if (comercio.activo) {
                        return Response.json({ success: false, error: "Ya tienes una tienda activa con este email. Inicia sesión." }, { status: 400 });
                    }

                    // Si existe pero no está activo (pendiente de pago o aprobación), permitimos continuar (Idempotencia)
                    // Actualizamos datos básicos por si corrigió el nombre o whatsapp
                    await adminBase44.entities.Comercio.update(comercio.id, {
                        nombre: nombre_comercio,
                        whatsapp_negocio: whatsapp,
                        user_id: comercio.user_id // Mantenemos el mismo user
                    });

                    return Response.json({
                        success: true,
                        step: 'created',
                        id_solicitud: comercio.id,
                        commerce_code: comercio.commerce_code,
                        message: "Solicitud existente recuperada. Continúa al pago."
                    });
                } else {
                    // El usuario Auth existe pero NO tiene comercio en la tabla (caso raro: creó cuenta pero falló insert DB previo)
                    // En este caso, no tenemos el ID del usuario fácilmente sin login. 
                    // Por seguridad y simplicidad, pedimos login o soporte, o asumimos que el email está ocupado por otra cosa.
                    return Response.json({ success: false, error: "El email ya está registrado en el sistema. Intenta iniciar sesión." }, { status: 400 });
                }
            } else {
                userId = newUser.user.id;
                userCreatedNew = true;
            }

            // ... Continuar creación solo si es usuario nuevo ...
            if (userCreatedNew) {
                const commerce_code = generateCommerceCode();

                // 3. INSERT DB (Usando Service Role)
                const dbData = {
                    nombre: nombre_comercio || "Comercio Sin Nombre",
                    email_negocio: email,
                    whatsapp_negocio: whatsapp || "",
                    user_id: userId,
                    estado_registro: "pendiente_pago",
                    numero_operacion: "PENDIENTE",
                    commerce_code: commerce_code,
                    slug: commerce_code,
                    activo: false,
                    plan: "bronce",
                    meta_pixel_id: "",
                    meta_dataset_id: "",
                    meta_access_token: "",
                    configuracion_avanzada: {
                        pass_backup: "PROTECTED",
                        full_name: full_name
                    }
                };

                const result = await adminBase44.entities.Comercio.create(dbData);

                return Response.json({
                    success: true,
                    step: 'created',
                    id_solicitud: result.id,
                    commerce_code: commerce_code,
                    message: "Usuario y Comercio creados exitosamente"
                });
            }
        }

        // --- PASO 2: ACTUALIZAR PAGO ---
        if (action === 'update_payment') {
            const { id_solicitud, numero_operacion } = data;

            if (!id_solicitud) throw new Error("Falta ID de solicitud");

            const adminBase44 = createClient(
                Deno.env.get("BASE44_API_URL") ?? "",
                Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
            );

            // Actualizamos la entidad COMERCIO
            await adminBase44.entities.Comercio.update(id_solicitud, {
                numero_operacion: numero_operacion,
                estado_registro: 'pendiente_aprobacion'
            });

            return Response.json({
                success: true,
                step: 'payment_updated',
                message: "Pago registrado exitosamente"
            });
        }

        return Response.json({ error: "Acción no válida" }, { status: 400 });

    } catch (error) {
        console.error("Critical Register Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});

function generateCommerceCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}
