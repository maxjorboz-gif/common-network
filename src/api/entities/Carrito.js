
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Carrito";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_cliente, id_comercio, session_id, items, subtotal, cupon_aplicado, descuento, total, moneda, estado, fecha_ultimo_update, evento_abandono_enviado, email_recuperacion_enviado, whatsapp_recuperacion_enviado, external_id_meta
 */
export async function fetchCarritoEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Carrito: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Carrito Entity
 */
export async function updateCarritoEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Carrito: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
