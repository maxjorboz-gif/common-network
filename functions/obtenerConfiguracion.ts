
// @ts-nocheck
Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response("OK");

    const { commerce_code } = await req.json();

    // PATRON FETCH Single (Read List Filtered)
    const response = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio?commerce_code=${encodeURIComponent(commerceCode)}`, {
      headers: {
        'api_key': 'fb3a067ef3c44d8489059567b4206a91'
      }
    });

    if (!response.ok) throw new Error("Error fetching configuracion");

    const configs = await response.json();

    if (configs && configs.length > 0) {
      return Response.json({ success: true, config: configs[0] });
    } else {
      // Retornamos config default vacía si no existe, en vez de error 404
      return Response.json({ success: true, config: {} });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
