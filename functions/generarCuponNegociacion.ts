
// @ts-nocheck
Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { commerce_code, descuento, clienteId } = await req.json();

    const codigo = `OFF-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // PATRON CREATE
    const res = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Cupon`, {
      method: 'POST',
      headers: {
        'api_key': 'fb3a067ef3c44d8489059567b4206a91',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        codigo: codigo,
        tipo: 'porcentaje',
        valor: descuento,
        activo: true,
        commerce_code: commerce_code,
        uso_unico: true,
        asignado_a: clienteId
      })
    });

    if (!res.ok) throw new Error("Error creando cupón");
    const cupon = await res.json();

    return Response.json({ success: true, codigo: cupon.codigo });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
