// @ts-check
// CONFIGURACION SUPREMA HARDCODEADA (DATOS BANCARIOS)
// Edita estos valores directamente aquí.

Deno.serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response("OK", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    // DATOS BANCARIOS ESTATICOS
    // CAMBIALOS AQUI
    const config = {
        cbu: "0000003100000000000000",        // TU CBU
        alias: "ALIAS.DE.PRUEBA.MP",          // TU ALIAS
        banco: "Mercado Pago",                // TU BANCO
        titular: "COMMON NETWORK S.A."        // TU TITULAR
    };

    return Response.json({
        success: true,
        config: config
    }, {
        headers: { "Access-Control-Allow-Origin": "*" }
    });
});
