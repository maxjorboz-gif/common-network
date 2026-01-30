
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Cupon";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: codigo, id_comercio, tipo, valor, minimo_compra, acumulable, origen, id_creador, usos_maximos, usos_actuales, fecha_inicio, fecha_fin, activo, es_referido, id_cliente_dueno
 */
export async function fetchCuponEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Cupon: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Cupon Entity
 */
export async function updateCuponEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Cupon: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
