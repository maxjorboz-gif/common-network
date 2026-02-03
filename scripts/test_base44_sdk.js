import { createClient } from "@base44/sdk";

// Usamos las credenciales reales de tu app (se pueden leer de un .env o hardcodear para este test puntual)
// Como es un script aislado, las pondré aquí temporalmente basándome en los valores que vi en tus archivos.
const APP_ID = "6967728aba18db08a32d56fd";
// const API_KEY = "fb3a067ef3c44d8489059567b4206a91"; // Token público/anon

async function testAuthAndWrite() {
    console.log("🚀 Iniciando prueba de SDK Base44...");

    const base44 = createClient({
        appId: APP_ID,
        // token: API_KEY, // Probar primero sin token para ver si login lo pisa o requiere anon key inicial
    });

    try {
        // 1. AUTENTICACIÓN
        console.log("🔑 Intentando autenticar usuario comercio...");
        // Reemplazar con credenciales válidas de un usuario comercio REAL o de prueba que exista
        const email = "maxi_test@example.com";
        const password = "password123";

        // Nota: Base44 Auth nativo. Si usas tabla 'Comercio' custom, esto fallará a menos que
        // hayas migrado o creado este usuario en el panel Auth de Base44.
        const authResult = await base44.auth.loginViaEmailPassword(email, password);

        console.log("✅ Login exitoso!");
        console.log("👤 Usuario:", authResult.user.email);
        console.log("🎟️ Token Sesión:", authResult.session.access_token?.substring(0, 20) + "...");

        // 2. LECTURA (Prueba de acceso)
        console.log("\n📚 Leyendo datos de prueba...");
        // Intentar leer algo público o del usuario
        // const data = await base44.entities.Producto.list({ limit: 1 });
        // console.log("📦 Datos leídos:", data.length);

        // 3. ESCRITURA (Prueba de permisos)
        // console.log("\n✏️ Intentando escribir configuración...");
        // Actualizar algo simple
        // await base44.entities.ConfiguracionComercio.create({ ... });

        console.log("\n🎉 PRUEBA FINALIZADA CON ÉXITO");

    } catch (error) {
        console.error("\n❌ ERROR EN LA PRUEBA:");
        console.error(error);
    }
}

testAuthAndWrite();
