// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_CLIENTE = `https://app.base44.com/api/apps/${APP_ID}/entities/Cliente`;

/**
 * REGISTRAR INTERÉS DE CLIENTE
 * Agrega categorías o etiquetas de interés al perfil del cliente.
 * Si el cliente existe, actualiza su lista de intereses de forma acumulativa y sin duplicados.
 */
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { id_cliente, interes, commerce_code } = body;

        if (!id_cliente || !interes) {
            return Response.json({ error: 'Faltan parámetros (id_cliente, interes)' }, { status: 400 });
        }

        // 1. Obtener datos actuales del cliente
        const responseCliente = await fetch(`${URL_CLIENTE}/${id_cliente}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseCliente.ok) {
            return Response.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        const cliente = await responseCliente.json();

        // 2. Procesar intereses existentes
        // Los intereses se guardan como un string separado por comas para compatibilidad simple
        let interesesActuales = cliente.intereses ? cliente.intereses.split(',').map(i => i.trim()) : [];

        // 3. Agregar el nuevo interés si no existe (Case Insensitive)
        const interesNuevo = interes.trim();
        if (!interesesActuales.some(i => i.toLowerCase() === interesNuevo.toLowerCase())) {
            interesesActuales.push(interesNuevo);
        }

        // 4. Limitar a los últimos 20 intereses para no saturar el campo
        if (interesesActuales.length > 20) {
            interesesActuales = interesesActuales.slice(-20);
        }

        const interesesString = interesesActuales.join(', ');

        // 5. Actualizar el cliente
        const updateResponse = await fetch(`${URL_CLIENTE}/${id_cliente}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intereses: interesesString,
                ultimo_interes: interesNuevo,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Error al actualizar intereses del cliente");
        }

        return Response.json({
            success: true,
            mensaje: 'Interés registrado',
            intereses: interesesString
        });

    } catch (error) {
        console.error("Error en registrarInteres:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
