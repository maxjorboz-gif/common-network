import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
    const client = createClientFromRequest(req);
    const { email, password } = await req.json();

    try {
        // Hashear la contraseña ingresada
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Buscar comercio con email y password_hash
        const comercios = await client.asServiceRole.entities.Comercio.filter({
            email_negocio: email,
            password_hash: password_hash
        });

        if (comercios.length === 0) {
            return Response.json({
                success: false,
                error: "Credenciales incorrectas"
            }, { status: 401 });
        }

        const comercio = comercios[0];

        // Verificar que esté activo
        if (!comercio.activo) {
            return Response.json({
                success: false,
                error: "Comercio inactivo. Contactá a soporte."
            }, { status: 403 });
        }

        return Response.json({
            success: true,
            comercio: {
                id: comercio.id,
                id_comercio: comercio.id_comercio,
                slug: comercio.slug,
                user_id: comercio.user_id,
                nombre: comercio.nombre,
                email_negocio: comercio.email_negocio
            }
        });

    } catch (error) {
        console.error('Error en loginComercio:', error);
        return Response.json({
            success: false,
            error: "Error interno del servidor"
        }, { status: 500 });
    }
});