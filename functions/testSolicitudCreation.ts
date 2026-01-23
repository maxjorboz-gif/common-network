// @ts-nocheck
import { createClient } from 'npm:@base44/sdk@0.8.6';

// Aseguramos que las variables de entorno sean strings (fallback a empty string si son undefined)
const base44 = createClient(
    Deno.env.get("BASE44_API_URL") ?? "",
    Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
);

console.log("TEST: Attempting to create SolicitudComercio entity...");

try {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const result = await base44.asServiceRole.entities.SolicitudComercio.create({
        nombre: `Test Commerce ${randomSuffix}`,
        email: `test${randomSuffix}@example.com`,
        whatsapp: "123456789",
        comprobante: "TEST_OP",
        user_id: "test_user_id",
        status: "pendiente",
        fecha: new Date().toISOString()
    });

    console.log("SUCCESS: Created entity!", result);
} catch (error) {
    console.error("FAILURE: Could not create entity.");
    // Casting seguro para error
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error Message:", msg);
    console.error("Full Error:", JSON.stringify(error, null, 2));
}
