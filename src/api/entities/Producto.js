
const API_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

/**
 * Filterable fields: id_comercio, sku_taller_interno, titulo, descripcion, descripcion_tecnica, precio_estandar, precio_meta_referencia, costo_producto, moneda, categoria, subcategoria, meta_product_category, fotos, videos, imagen_principal, stock_actual, stock_minimo_alerta, activo, destacado, total_vendidos, promedio_estrellas, total_resenas, vistas_totales
 */
export async function fetchProductoEntities() {
    const response = await fetch(API_URL, {
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching Producto: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Update Producto Entity
 */
export async function updateProductoEntity(entityId, updateData) {
    const response = await fetch(`${API_URL}/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error(`Error updating Producto: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}
