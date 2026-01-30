
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { user_id, email } = await req.json();

        if (!user_id && !email) {
            return Response.json({ success: true, comercio: null });
        }

        // PATRON FETCH: Buscar Comercio por user_id o email
        let query = "";
        if (email) query = `email_negocio=${encodeURIComponent(email)}`;
        else if (user_id) query = `user_id=${user_id}`; // Asumiendo que user_id se guarda en entity Comercio

        const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio?${query}`, {
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return Response.json({ success: true, comercio: null });

        const comercios = await response.json();

        if (comercios && comercios.length > 0) {
            const miComercio = comercios[0];
            return Response.json({
                success: true,
                commerce_code: miComercio.commerce_code,
                comercio: {
                    ...miComercio,
                    id: miComercio._id || miComercio.id,
                    activo: miComercio.activo
                }
            });
        }

        return Response.json({ success: true, commerce_code: null, comercio: null });

    } catch (error) {
        return Response.json({ success: true, comercio: null });
    }
});
