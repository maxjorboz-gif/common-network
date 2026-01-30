
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Cliente";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: google_id, email, email_hash, whatsapp, whatsapp_hash, telefono_entrega, telefono_entrega_hash, nombre_completo, nombre_hash, apellido_hash, ciudad, ciudad_hash, provincia_estado, provincia_hash, pais, pais_hash, direccion, codigo_postal, codigo_postal_hash, fbp, fbc, lead_source_original, referido_por, puntuacion_ltv, cross_store_trust_score, perfil_comprador, total_compras, total_gastado
 */
export async function fetchClienteEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Cliente: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Cliente Entity
 */
export async function updateClienteEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Cliente: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
