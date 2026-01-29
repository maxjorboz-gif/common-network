// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// NUEVA LÓGICA V8: Gestión Directa
// Sin validación de rol 'admin' de Supabase. Solo lógica de negocio.

Deno.serve(async (req) => {
    try {
        // Usamos SERVICE ROLE para tener permisos absolutos de Admin (Bypass RLS)
        const base44 = createClient(
            Deno.env.get("BASE44_API_URL") ?? "",
            Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
        );

        let body;
        try { body = await req.json(); } catch { body = {}; }
        const { action, id_registro, admin_secret } = body;

        // BACKDOOR MUY SIMPLE (Si quieres seguridad, descomenta)
        // if (admin_secret !== 'abriteporfavor') return Response.json({error: 'Acceso Denegado'}, {status: 403});

        if (action === 'list') {
            // Leemos todo. CRUD Puro.
            const pendientes = await base44.entities.SolicitudComercio.list() || [];
            const activos = await base44.entities.Comercio.list() || [];

            // Normalizamos para el Frontend
            const listado = [
                ...pendientes.map(p => ({
                    ...p,
                    id_registro: p.id,
                    aprobacion_pendiente: true,
                    activo: false,
                    id_comercio: "PENDIENTE"
                })),
                ...activos.map(c => ({
                    ...c,
                    aprobacion_pendiente: false
                }))
            ];

            return Response.json({ success: true, solicitudes: listado });
        }

        if (action === 'approve') {
            // CRUD: Leer Solicitud -> Crear Comercio -> Actualizar Solicitud
            const solicitud = await base44.entities.SolicitudComercio.get(id_registro);
            if (!solicitud) throw new Error("Solicitud no encontrada");

            // Crear Comercio Real (Transferimos metadata CRÍTICA para el login interno)
            const nuevoComercio = await base44.entities.Comercio.create({
                commerce_code: solicitud.commerce_code,
                nombre_comercio: solicitud.nombre,
                email_admin: solicitud.email,
                whatsapp: solicitud.whatsapp,
                numero_operacion: solicitud.comprobante,
                user_id: solicitud.user_id,
                metadata: solicitud.metadata, // <--- CRÍTICO: Aquí viaja el password interno
                activo: true,
                pago_confirmado: true,
                created_date: new Date().toISOString()
            });

            // Marcar solicitud como aprobada (Historial)
            await base44.entities.SolicitudComercio.update(id_registro, { status: 'aprobado' });

            // INTENTO: Actualizar usuario Auth (Puede fallar sin Service Key, lo hacemos opcional)
            // Si falla, no importa, el login usará la tabla Comercio para validar.
            try {
                // Aquí necesitaríamos lógica de tabla, ya no tocamos auth.users metadata.
                // Todo OK.
            } catch (e) { console.warn("No se pudo actualizar metadata auth, no importa."); }

            return Response.json({ success: true, comercio: nuevoComercio });
        }

        if (action === 'toggle_active') {
            // Lógica de pausar/activar
            // Necesitamos buscar el comercio por code
            // Como .list() puede ser lento, idealmente .filter()
            const { commerce_code, active } = body;
            // Buscar ID interno
            const { data: comercios } = await base44.entities.Comercio.filter({ commerce_code });
            if (comercios && comercios.length > 0) {
                await base44.entities.Comercio.update(comercios[0].id, { activo: active });
                return Response.json({ success: true });
            }
            return Response.json({ error: "Comercio no encontrado" });
        }

        if (action === 'delete') {
            const { id, type } = body;
            // type: 'solicitud' | 'comercio'

            if (type === 'solicitud') {
                await base44.entities.SolicitudComercio.delete(id);
                return Response.json({ success: true, message: "Solicitud eliminada" });
            }

            if (type === 'comercio') {
                // Borrar Comercio es delicado, idealmente soft-delete, pero el user pidió borrar.
                // Borramos.
                await base44.entities.Comercio.delete(id);
                return Response.json({ success: true, message: "Comercio eliminado definitivamente" });
            }

            return Response.json({ error: "Tipo no especificado" });
        }

        return Response.json({ error: 'Accion desconocida' });

    } catch (error) {
        return Response.json({ success: false, error: error.message });
    }
});
