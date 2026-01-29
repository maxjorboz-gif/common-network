
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

console.log("--- SIMULACIÓN DE CLIENTE ---");

// 1. Simulamos crear cliente SIN clave (como si la variable de entorno faltara)
try {
    const clientNoKey = createClient("https://simulated.url", "");
    console.log("Cliente creado (SIN REVENTAR).");

    // PRUEBA A: Forma VIEJA/ROTA
    try {
        console.log("Intentando leer clientNoKey.asServiceRole.auth.admin...");
        const adminViaService = clientNoKey.asServiceRole.auth.admin;
        console.log("-> ÉXITO: Existe.");
    } catch (e) {
        console.log("-> FALLO ESPERADO (VIEJA):", e.message);
    }

    // PRUEBA B: Forma NUEVA/CORREGIDA
    try {
        console.log("Intentando leer clientNoKey.auth.admin...");
        const adminDirect = clientNoKey.auth.admin;
        if (adminDirect) {
            console.log("-> ÉXITO: Existe clientNoKey.auth.admin");
        } else {
            console.log("-> FALLO: clientNoKey.auth.admin es undefined");
        }
    } catch (e) {
        console.log("-> FALLO CRÍTICO (NUEVA):", e.message);
    }

} catch (e) {
    console.log("Error creando cliente:", e.message);
}
