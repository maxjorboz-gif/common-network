
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: numero_orden, id_cliente, id_comercio, items, subtotal, descuento, costo_envio, total, moneda, estado, metodo_pago, datos_envio, fbp, fbc, evento_purchase_enviado, event_id_meta, fecha_pago_confirmado, comision_plataforma, margen_vendedor
 */
export async function fetchOrdenEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Orden: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Orden Entity
 */
export async function updateOrdenEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Orden: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
