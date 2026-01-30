
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Lead";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_comercio, id_cliente, id_producto_interes, nombre, email, email_hash, whatsapp, whatsapp_hash, origen, trigger_activado, cupon_ofrecido, estado, suppress_ads, fbp, fbc, event_id_meta, notas, fecha_ultimo_contacto, evento_lead_enviado
 */
export async function fetchLeadEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Lead: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Lead Entity
 */
export async function updateLeadEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Lead: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
