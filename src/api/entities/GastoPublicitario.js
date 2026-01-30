
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/GastoPublicitario";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_comercio, fecha, monto, plataforma, notas
 */
export async function fetchGastoPublicitarioEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching GastoPublicitario: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update GastoPublicitario Entity
 */
export async function updateGastoPublicitarioEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating GastoPublicitario: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
