
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { codigo, sessionId } = await req.json();

        // 1. Buscar Cupón
        const cuponRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Cupon?codigo=${encodeURIComponent(codigo)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!cuponRes.ok) throw new Error("Error buscando cupón");
        const cupones = await cuponRes.json();

        if (!cupones || cupones.length === 0) {
            return Response.json({ success: false, error: "Cupón no válido" });
        }

        const cupon = cupones[0];

        // Validar activo/fechas si aplica
        if (!cupon.activo) return Response.json({ success: false, error: "Cupón inactivo" });

        // Retornar info para que el front aplique el descuento (o guardarlo en sesión si tenemos entity Sesion)
        return Response.json({
            success: true,
            cupon: {
                codigo: cupon.codigo,
                tipo: cupon.tipo, // porcentaje o fijo
                valor: cupon.valor
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
