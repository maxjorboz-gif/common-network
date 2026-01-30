
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_producto, nombre_atributo, valor_atributo, tag_meta_mapping, ia_weight, orden, afecta_precio, variacion_precio
 */
export async function fetchAtributoProductoEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching AtributoProducto: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update AtributoProducto Entity
 */
export async function updateAtributoProductoEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating AtributoProducto: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
