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
            // Necesario para crear usuario sin estar logueado
            const adminBase44 = createClient(
                Deno.env.get("BASE44_API_URL") ?? "",
                Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
            );

            let userId = null;

            // 2. Intentar Crear Usuario de Auth (Base44/Supabase)
            // Si el mail ya existe, esto fallará y el frontend lo sabrá.
            const { data: newUser, error: authError } = await adminBase44.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true, // Auto-confirmamos para evitar líos
                user_metadata: { full_name, commerce_registered: true }
            });

            if (authError) {
                // Si falla (ej: ya registrado), devolvemos error limpio
                return Response.json({ success: false, error: "El email ya está registrado o la contraseña es muy débil." }, { status: 400 });
            }

            userId = newUser.user.id;
            const commerce_code = generateCommerceCode();

            // 3. INSERT DB (Usando Service Role)
            // Guardamos directo en la tabla COMERCIO con estado 'pendiente_pago'
            const dbData = {
                nombre: nombre_comercio || "Comercio Sin Nombre",
                email_negocio: email,
                whatsapp_negocio: whatsapp || "",
                user_id: userId,
                estado_registro: "pendiente_pago", // Nuevo flujo unificado
                numero_operacion: "PENDIENTE",
                commerce_code: commerce_code,
                slug: commerce_code, // Slug temporal
                activo: false, // Importante: No visible aún
                plan: "bronce",
                // Datos Meta requeridos por schema (vacíos por ahora)
                meta_pixel_id: "",
                meta_dataset_id: "",
                meta_access_token: "",
                // Metadata interna para admin
                configuracion_avanzada: {
                    pass_backup: "PROTECTED",
                    full_name: full_name
                }
            };

            const result = await adminBase44.entities.Comercio.create(dbData);

            return Response.json({
                success: true,
                step: 'created',
                id_solicitud: result.id, // Usamos el ID del comercio como ID de solicitud
                commerce_code: commerce_code,
                message: "Usuario y Comercio creados exitosamente"
            });
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
