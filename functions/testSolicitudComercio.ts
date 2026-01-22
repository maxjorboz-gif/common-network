// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // TEST: Crear entidad SolicitudComercio con un registro de prueba
        console.log("TEST: Intentando crear SolicitudComercio...");
        const res = await base44.asServiceRole.entities.SolicitudComercio.create({
            nombre: "TEST_SOLICITUD_" + Date.now(),
            email: "test@example.com",
            whatsapp: "1234567890",
            comprobante: "TEST123",
            user_id: "test_user",
            status: "pendiente",
            fecha: new Date().toISOString()
        });

        console.log("SUCCESS: SolicitudComercio creada:", res.id);

        // Borrar el registro de prueba
        await base44.asServiceRole.entities.SolicitudComercio.delete(res.id);
        console.log("SUCCESS: Registro de prueba eliminado");

        return Response.json({
            success: true,
            message: "Entidad SolicitudComercio inicializada correctamente",
            data: res
        });
    } catch (e) {
        console.error("TEST FAILED:", e.message);
        return Response.json({
            success: false,
            error: e.message,
            stack: e.stack,
            hint: "La entidad SolicitudComercio se creará automáticamente en Base44"
        }, { status: 500 });
    }
});
