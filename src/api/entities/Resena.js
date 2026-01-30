
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Resena";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_producto, id_cliente, id_orden, id_comercio, nombre_cliente, estrellas, titulo, texto, foto_url, keywords_detectadas, destacada, aprobada
 */
export async function fetchResenaEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Resena: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Resena Entity
 */
export async function updateResenaEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Resena: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
