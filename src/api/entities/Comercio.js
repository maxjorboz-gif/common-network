
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91"; // Consider moving this to an env variable or app-params

/**
 * Filterable fields: nombre, nombre_usuario, user_id, password, commerce_code, estado_registro, numero_operacion, slug, logo_url, descripcion, whatsapp_negocio, email_negocio, direccion, ciudad, plan, comision_porcentaje, activo, meta_pixel_id, meta_dataset_id, meta_access_token, meta_test_event_code, total_ventas, total_ordenes, configuracion_avanzada
 */
export async function fetchComercioEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Comercio: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Returning data instead of console.log
}

/**
 * Update Comercio Entity
 */
export async function updateComercioEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Comercio: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
