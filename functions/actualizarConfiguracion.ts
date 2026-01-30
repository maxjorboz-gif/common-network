
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response('OK');

        const { commerce_code, id_comercio: legacyId, configData } = await req.json();
        const id_comercio_final = commerce_code || legacyId;

        if (!id_comercio_final) return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });

        // 1. BUSCAR SI EXISTE (READ Entity Pattern)
        // Usamos el filtro por commerce_code en la URL query params si es soportado, o la URL base y filter logic
        const responseGet = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio?commerce_code=${encodeURIComponent(id_comercio_final)}`, {
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            }
        });

        if (!responseGet.ok) throw new Error(`Error fetching ConfiguracionComercio: ${responseGet.statusText}`);

        const configs = await responseGet.json();
        const existingConfig = (Array.isArray(configs) && configs.length > 0) ? configs[0] : null;

        if (existingConfig) {
            // 2. ACTUALIZAR (UPDATE Entity Pattern)
            const entityId = existingConfig._id || existingConfig.id;
            const responseUpdate = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio/${entityId}`, {
                method: 'PUT',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...configData,
                    updated_at: new Date().toISOString()
                })
            });
            if (!responseUpdate.ok) throw new Error(`Error updating ConfiguracionComercio`);
        } else {
            // 3. CREAR (CREATE Entity Pattern - similar structure)
            const responseCreate = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio`, {
                method: 'POST',
                headers: {
                    'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    commerce_code: id_comercio_final,
                    id_comercio: id_comercio_final,
                    ...configData,
                    created_at: new Date().toISOString()
                })
            });
            if (!responseCreate.ok) throw new Error(`Error creating ConfiguracionComercio`);
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
