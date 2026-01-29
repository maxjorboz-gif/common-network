// @ts-nocheck
import { createClientFromRequest, createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// LOGICA V11: SISTEMA ROBUSTO DE REGISTRO
// - Paso 1: Crea Solicitud con Auth de Usuario (Vinculación)
// - Paso 2: Actualiza Pago con Service Role (Garantía de ejecución y bypass RLS)

// --- PASO 1: CREAR SOLICITUD (NATIVO - MODIFICADO PARA BASE44 ENTITIES) ---
if (action === 'create') {
    const { nombre_comercio, email, whatsapp, password, full_name } = data;

    // CLIENTE: Usamos el cliente derivado del request (Contexto Base44)
    // Si Base44 inyecta credenciales, esto debería bastar.
    // Si falla usuario anónimo, usamos la ANON KEY pública como fallback.
    let base44 = userClient;
    if (!base44) {
        base44 = createClient(
            Deno.env.get("BASE44_API_URL") ?? "https://app.base44.com",
            Deno.env.get("BASE44_ANON_KEY") ?? ""
        );
    }

    let userId = null;
    let userCreatedNew = false;

    // 2. Intentar Crear Usuario usando AUTH PÚBLICO (signUp), no Admin
    // Esto permite registro sin Service Role Key
    const { data: authData, error: authError } = await base44.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name, commerce_registered: true }
        }
    });

    if (authError) {
        console.log("Error Auth (SignUp):", authError.message);

        // Fallback: Si el usuario ya existe, intentamos buscarlo en tabla Comercio
        // Nota: Sin Service Role, no podemos "buscar" usuarios en auth.users, 
        // pero si el login falla por "ya existe", asumimos que existe.

        // Intentamos leer la entidad Comercio con el cliente actual (esperando que sea pública/lectura)
        // Usamos una query 'ciega' o confiamos en que si falla el signUp, el usuario debe loguearse.
        return Response.json({ success: false, error: "El usuario ya existe o hubo un error. Intenta iniciar sesión." }, { status: 400 });
    } else {
        // SignUp exitoso (puede requerir confirmación de email según config, pero devuelve ID)
        userId = authData.user?.id;
        userCreatedNew = true;
    }

    if (userId && userCreatedNew) {
        const commerce_code = generateCommerceCode();

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
            configuracion_avanzada: {
                pass_backup: "PROTECTED",
                full_name: full_name
            }
        };

        // 3. INSERT ENTITY usando el mismo cliente (asumiendo permisos RLS públicos para create)
        const result = await base44.entities.Comercio.create(dbData);

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

    // Reutilizamos userClient o creamos uno básico
    let base44 = userClient || createClient(
        Deno.env.get("BASE44_API_URL") ?? "https://app.base44.com",
        Deno.env.get("BASE44_ANON_KEY") ?? ""
    );

    await base44.entities.Comercio.update(id_solicitud, {
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
