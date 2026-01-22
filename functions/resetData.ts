// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // 1. Verificación de Autenticación
        let user;
        try {
            user = await base44.auth.me();
        } catch (e) {
            return Response.json({ error: 'Sesión no válida o expirada. Por favor, reingresá a la app.' }, { status: 401 });
        }

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No tenés permisos de administrador para realizar esta acción.' }, { status: 403 });
        }

        console.log("LOG: Iniciando Limpieza Nuclear...");

        let comerciosBorrados = 0;
        let solicitudesBorradas = 0;

        // 2. Limpieza de Tabla Comercio (Sin filtros ni orden para evitar errores 500)
        try {
            const listC = await base44.asServiceRole.entities.Comercio.list();
            for (const doc of listC) {
                try {
                    await base44.asServiceRole.entities.Comercio.delete(doc.id);
                    comerciosBorrados++;
                } catch (err) {
                    console.error(`Error borrando comercio ${doc.id}:`, err.message);
                }
            }
        } catch (e) {
            console.warn("La tabla Comercio ya estaba limpia o no existe aún.");
        }

        // 3. Limpieza de Tabla SolicitudComercio (La sala de espera)
        try {
            const listS = await base44.asServiceRole.entities.SolicitudComercio.list();
            for (const doc of listS) {
                try {
                    await base44.asServiceRole.entities.SolicitudComercio.delete(doc.id);
                    solicitudesBorradas++;
                } catch (err) {
                    console.error(`Error borrando solicitud ${doc.id}:`, err.message);
                }
            }
        } catch (e) {
            console.warn("La tabla SolicitudComercio ya estaba limpia o no existe aún.");
        }

        return Response.json({
            success: true,
            message: "Limpieza completada",
            stats: { comerciosBorrados, solicitudesBorradas }
        });

    } catch (error) {
        console.error("LOG: FALLA CRITICA EN RESET:", error.message);
        return Response.json({
            error: 'Error en el proceso de limpieza',
            details: error.message
        }, { status: 500 });
    }
});
