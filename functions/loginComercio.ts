
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { email, password } = await req.json();

        // 1. Fetch User (READ Pattern with Filter)
        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio?email_negocio=${encodeURIComponent(email)}`, {
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return Response.json({ success: false, error: "Error de conexión" }, { status: 500 });
        const users = await response.json();

        if (!users || users.length === 0) {
            return Response.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
        }

        const comercio = users[0];

        // 2. Validate Password
        if (comercio.password !== password) {
            return Response.json({ success: false, error: "Contraseña incorrecta" }, { status: 401 });
        }

        // 3. Validate Status
        if (comercio.estado_registro !== 'aprobado' || comercio.activo === false) {
            return Response.json({
                success: false,
                error: "Cuenta no activa o pendiente de aprobación",
                estado: comercio.estado_registro
            }, { status: 403 });
        }

        return Response.json({
            success: true,
            comercio: {
                id: comercio.id || comercio._id,
                commerce_code: comercio.commerce_code,
                nombre_comercio: comercio.nombre_comercio,
                plan: comercio.plan,
                role: 'admin'
            },
            token: "mock-token-" + Date.now()
        });

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
