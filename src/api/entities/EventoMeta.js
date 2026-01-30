
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/EventoMeta";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: event_id, event_name, id_cliente, id_comercio, user_data, custom_data, action_source, event_source_url, enviado_pixel, enviado_capi, respuesta_capi, event_time, test_event_code
 */
export async function fetchEventoMetaEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching EventoMeta: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update EventoMeta Entity
 */
export async function updateEventoMetaEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating EventoMeta: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
