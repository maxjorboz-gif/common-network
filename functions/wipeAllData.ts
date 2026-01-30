// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL_API = `https://app.base44.com/api/apps/${APP_ID}/entities`;

const ENTITIES = [
    "AtributoProducto",
    "Carrito",
    "Cliente",
    "Comercio",
    "ConfiguracionComercio",
    "Cupon",
    "EventoMeta",
    "GastoPublicitario",
    "Lead",
    "Logs_Configuracion",
    "Orden",
    "Producto",
    "Resena",
    "SolicitudComercio",
    "Conversacion"
];

Deno.serve(async (req) => {
    console.log("LOG: WIPE ALL DATA INICIADO (Bypass Auth - Comunicación Directa)");

    let stats = {};

    for (const entityName of ENTITIES) {
        try {
            const entityUrl = `${BASE_URL_API}/${entityName}`;

            // 1. Listar registros
            const responseList = await fetch(entityUrl, {
                headers: { 'api_key': API_KEY }
            });

            if (!responseList.ok) {
                stats[entityName] = `Error: No se pudo listar`;
                continue;
            }

            const items = await responseList.json();
            let count = 0;

            if (Array.isArray(items)) {
                for (const item of items) {
                    const itemId = item.id || item._id;
                    const responseDelete = await fetch(`${entityUrl}/${itemId}`, {
                        method: 'DELETE',
                        headers: { 'api_key': API_KEY }
                    });

                    if (responseDelete.ok) count++;
                }
            }

            stats[entityName] = count;
            console.log(`Tabla ${entityName}: ${count} eliminados.`);
        } catch (e) {
            stats[entityName] = `Error: ${e.message}`;
        }
    }

    return Response.json({
        success: true,
        message: "Wipe de todas las entidades completado",
        stats
    });
});
