import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

function generateIdComercio() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateSlug(nombre) {
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 40) + '-' + Math.random().toString(36).substring(2, 7);
}

Deno.serve(async (req) => {
    const client = createClientFromRequest(req);
    const payload = await req.json();

    try {
        const { user_id, nombre, email_negocio, whatsapp_negocio, password } = payload;

        // Generar id_comercio único
        const id_comercio = generateIdComercio();

        // Hashear contraseña con SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Generar slug único para la URL de la tienda
        const slug = generateSlug(nombre);

        // Crear Comercio con serviceRole
        const comercio = await client.asServiceRole.entities.Comercio.create({
            user_id,
            id_comercio,
            slug,
            nombre,
            email_negocio,
            whatsapp_negocio,
            password_hash,
            estado_registro: 'completado',
            plan: 'bronce',
            activo: true
        });

        // Crear ConfiguracionComercio automáticamente
        await client.asServiceRole.entities.ConfiguracionComercio.create({
            id_comercio,
            colores: {
                primario: '#f97316',
                secundario: '#ea580c',
                acento: '#fb923c'
            },
            habilitar_referidos: true,
            habilitar_popup_salida: true,
            envio_gratis_minimo: 0,
            costo_envio_default: 0,
            mostrar_stock: true,
            umbral_escasez: 5,
            descuento_base_transferencia: 10
        });

        return Response.json({
            success: true,
            id_comercio: comercio.id_comercio,
            slug: comercio.slug,
            url_tienda: `/tienda?slug=${comercio.slug}`
        });

    } catch (error) {
        console.error('Error en registrarComercio:', error);
        return Response.json({
            success: false,
            error: error.message || "Error al registrar comercio"
        }, { status: 500 });
    }
});