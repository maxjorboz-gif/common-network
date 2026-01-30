// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

// NUEVA LÓGICA V8: Obtener Datos Directo (Sin Middleware)
// El usuario pregunta "¿Quién soy y cuál es mi comercio?". Nosotros respondemos leyendo la base.

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // 1. Obtener Usuario (Auth Básico)
        const { data: { user }, error } = await base44.auth.getUser();

        if (error || !user) {
            // Usuario no logueado -> Retornamos null limpio.
            return Response.json({ success: true, comercio: null, commerce_code: null });
        }

        // 2. Buscar Comercio Activo vinculado a este usuario
        // Buscamos directo en tabla Comercio (la verdad absoluta).
        const { data: comercios } = await base44.entities.Comercio.filter({
            user_id: user.id
        });

        // Caso A: Tiene Comercio Aprobado/Activo
        if (comercios && comercios.length > 0) {
            const miComercio = comercios[0];
            return Response.json({
                success: true,
                commerce_code: miComercio.commerce_code,
                comercio: {
                    ...miComercio,
                    activo: miComercio.activo // true/false
                }
            });
        }

        // Caso B: No tiene comercio (quizás tiene solicitud pendiente, pero eso lo ve otra función)
        // Retornamos null para que el front sepa que no hay "Dashboard Activo".
        return Response.json({
            success: true,
            commerce_code: null,
            comercio: null
        });

    } catch (error) {
        // Error silencioso, devolvemos null para no romper front
        return Response.json({ success: true, comercio: null });
    }
});
