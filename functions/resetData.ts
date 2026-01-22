// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        console.log("NUCLEAR RESET: Iniciando limpieza de datos legacy...");

        // 1. Intentamos listar y borrar todo lo que huela a Comercio viejo
        let comerciosBorrados = 0;
        try {
            const legacyComercios = await base44.asServiceRole.entities.Comercio.list('-created_date', 1000);
            for (const c of legacyComercios) {
                await base44.asServiceRole.entities.Comercio.delete(c.id);
                comerciosBorrados++;
            }
        } catch (e) {
            console.warn("Falla al limpiar tabla Comercio (quizás ya está vacía o dañada):", e.message);
        }

        // 2. Limpiamos también la nueva sala de espera para empezar de cero absoluto
        let solicitudesBorradas = 0;
        try {
            const legacySolicitudes = await base44.asServiceRole.entities.SolicitudVenta.list('-fecha', 1000);
            for (const s of legacySolicitudes) {
                await base44.asServiceRole.entities.SolicitudVenta.delete(s.id);
                solicitudesBorradas++;
            }
        } catch (e) {
            console.warn("Falla al limpiar tabla SolicitudVenta:", e.message);
        }

        console.log(`NUCLEAR RESET: Exito. Borrados ${comerciosBorrados} registros antiguos.`);

        return Response.json({
            success: true,
            message: "Base de datos reseteada exitosamente. El sistema está limpio para nuevos registros.",
            stats: { comerciosBorrados, solicitudesBorradas }
        });

    } catch (error) {
        console.error("FATAL NUCLEAR RESET:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
