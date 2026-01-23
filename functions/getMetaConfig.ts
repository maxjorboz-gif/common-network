// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // 1. AUTENTICACIÓN (Seguridad de Ley)
        // Solo el Admin o el sistema interno pueden pedir esta configuración completa
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'No autorizado para ver configuración sensible' }, { status: 403 });
        }

        // 2. EXTRACCIÓN DE CREDENCIALES (Infallible)
        const DATASET_ID = Deno.env.get('META_DATASET_ID');
        const ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
        const TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE');
        const PIXEL_ID = Deno.env.get('META_PIXEL_ID'); // Agregado para el Frontend (Parrillas Ads)

        // 3. VALIDACIÓN DE INTEGRIDAD
        // Si falta algo, lanzamos error 500 para que el Admin sepa que la publicidad no va a trackear
        if (!DATASET_ID || !ACCESS_TOKEN) {
            console.error('🚨 ALERTA LEY DE META: Faltan credenciales en el servidor.');
            return Response.json(
                {
                    status: 'error',
                    message: 'Falta configurar META_DATASET_ID o META_ACCESS_TOKEN en el entorno'
                },
                { status: 500 }
            );
        }

        // 4. RETORNO ESTRATÉGICO
        /**
         * Según la Ley de Meta, el Access Token nunca debe viajar al navegador (Frontend).
         * Solo lo usamos aquí para confirmar que "está presente".
         */
        return Response.json({
            success: true,
            config: {
                pixelId: PIXEL_ID || DATASET_ID, // Usado para el tracking del navegador
                datasetId: DATASET_ID,           // Usado para Conversions API (CAPI)
                testCode: TEST_EVENT_CODE || null,
                hasAccessToken: !!ACCESS_TOKEN,  // Confirmación booleana de seguridad
                environment: Deno.env.get('DENO_ENV') || 'production'
            },
            status: 'ready_for_ads'
        });

    } catch (error) {
        console.error('❌ Error en getMetaConfig:', error);
        return Response.json({ error: 'Error interno de servidor al recuperar llaves de Meta' }, { status: 500 });
    }
});