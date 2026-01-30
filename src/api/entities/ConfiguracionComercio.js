
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/ConfiguracionComercio";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_comercio, colores, whatsapp_alertas_stock, whatsapp_alertas_ventas, habilitar_referidos, porcentaje_cupon_referido, habilitar_popup_salida, texto_popup_salida, envio_gratis_minimo, habilitar_envio_gratis_global, costo_envio_default, datos_transferencia, mostrar_stock, umbral_escasez, descuento_base_transferencia
 */
export async function fetchConfiguracionComercioEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching ConfiguracionComercio: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update ConfiguracionComercio Entity
 */
export async function updateConfiguracionComercioEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating ConfiguracionComercio: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
