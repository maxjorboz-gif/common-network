// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

// DIAGNÓSTICO DE ENTORNO VIVO
Deno.serve(async (req) => {
    try {
        const envVars = Deno.env.toObject();
        const keys = Object.keys(envVars);

        // Buscamos variables sospechosas de ser URLs o Keys
        const relevantKeys = keys.filter(k =>
            k.includes('BASE44') ||
            k.includes('SUPABASE') ||
            k.includes('URL') ||
            k.includes('KEY') ||
            k.includes('SECRET')
        );

        const statusReport = {
            message: "Diagnóstico de Entorno Base44",
            total_vars: keys.length,
            relevant_vars_found: relevantKeys,
            config_check: {
                has_api_url: !!Deno.env.get("BASE44_API_URL"),
                has_service_key: !!Deno.env.get("BASE44_SERVICE_ROLE_KEY"),
                has_anon_key: !!Deno.env.get("BASE44_ANON_KEY")
            },
            values_masked: {}
        };

        // Mostramos los primeros 5 caracteres de las claves para verificar si están vacías o son correctas
        for (const key of relevantKeys) {
            const val = envVars[key] || "";
            statusReport.values_masked[key] = val.length > 10 ? `${val.substring(0, 5)}...xxxxx (${val.length} chars)` : val;
        }

        return Response.json(statusReport);

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});
