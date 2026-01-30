// @ts-nocheck
Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { ordenId, paymentId, status } = await req.json();

    if (!ordenId) return Response.json({ error: "Falta ID de orden" }, { status: 400 });

    // Solo marcamos como pagado si el status es 'approved'
    const nuevoEstado = status === 'approved' ? 'pagado' : 'error_pago';

    const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden/${ordenId}`, {
      method: 'PUT',
      headers: {
        'api_key': 'fb3a067ef3c44d8489059567b4206a91',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estado_orden: nuevoEstado,
        payment_id_mp: paymentId,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error("Error actualizando orden desde MercadoPago");

    return Response.json({ success: true, estado: nuevoEstado });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});