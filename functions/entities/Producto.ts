
export const Producto = {
    name: "Producto",
    type: "object",
    properties: {
        id_comercio: {
            type: "string",
            description: "Referencia al comercio - OBLIGATORIO"
        },
        sku_taller_interno: {
            type: "string",
            description": "SKU interno de logu00edstica - ID u00fanico para Meta(content_ids)"
    },
    titulo: {
        type: "string",
        description": "Tu00edtulo del producto para SEO"
    },
    descripcion: {
        type: "string",
        description": "Descripciu00f3n completa"
    },
    descripcion_tecnica: {
        type: "string",
        description": "Especificaciones tu00e9cnicas"
    },
    precio_estandar: {
        type: "number",
        description": "PRECIO REAL: u00danico valor que ve el cliente y se usa para el checkout"
    },
    precio_meta_referencia: {
        type: "number",
        description": "Variable tu00e9cnica exclusiva para Meta(no visible en el frontend)",
      default: 0
    },
    costo_producto: {
        type: "number",
        description": "Costo interno para cu00e1lculo de margen"
    },
    moneda: {
        type: "string",
        default: "ARS",
        description": "Cu00f3digo de moneda requerido por Meta"
    },
    categoria: {
        type: "string",
        description": "Categoru00eda principal"
    },
    subcategoria: {
        type: "string"
    },
    meta_product_category: {
        type: "string",
        description": "Categoru00eda estu00e1ndar de Meta para DPA"
    },
    fotos: {
        type: "array",
        items: {
            type: "object",
            properties: {
                url: {
                    type: "string"
                },
                tipo: {
                    type: "string",
                    enum: [
                        "principal",
                        "detalle",
                        "uso"
                    ]
                },
                orden: {
                    type: "number"
                }
            }
        }
    },
    videos: {
        type: "array",
        items: {
            type: "object",
            properties: {
                url: {
                    type: "string"
                },
                tipo: {
                    type: "string",
                    enum: [
                        "uso",
                        "review",
                        "demo"
                    ]
                },
                orden: {
                    type: "number"
                }
            }
        }
    },
    imagen_principal: {
        type: "string",
        description": "URL imagen principal(sincronizada con catu00e1logo)"
    },
    stock_actual: {
        type: "number",
        default: 0
    },
    stock_minimo_alerta: {
        type: "number",
        default: 5
    },
    activo: {
        type: "boolean",
        default: true
    },
    destacado: {
        type: "boolean",
        default: false
    },
    total_vendidos: {
        type: "number",
        default: 0
    },
    promedio_estrellas: {
        type: "number",
        default: 0
    },
    total_resenas: {
        type: "number",
        default: 0
    },
    vistas_totales: {
        type: "number",
        default: 0
    }
},
    required: [
        "id_comercio",
        "titulo",
        "precio_estandar",
        "sku_taller_interno",
        "moneda"
    ]
};
