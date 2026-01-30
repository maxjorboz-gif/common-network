
export const Carrito = {
    name: "Carrito",
    type: "object",
    properties: {
        id_cliente: {
            type: "string",
            description: "Referencia al cliente (vincula con email_hash y whatsapp_hash)"
        },
        id_comercio: {
            type: "string",
            description: "Referencia al comercio - OBLIGATORIO para cargar Pixel/CAPI"
        },
        session_id: {
            type: "string",
            description: "ID de sesiu00f3n u00fanico (vital para event_id de Meta en usuarios no logueados)"
        },
        items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id_producto: {
                        type: "string",
                        description: "SKU del taller que viaja como content_ids"
                    },
                    titulo: {
                        type: "string"
                    },
                    imagen: {
                        type: "string"
                    },
                    precio_unitario: {
                        type: "number",
                        description: "Precio estandar del producto + variacion por atributos"
                    },
                    cantidad: {
                        type: "number"
                    },
                    atributos_seleccionados: {
                        type: "object",
                        description: "Ej: {emparrillado: 'Inoxidable'}"
                    }
                }
            },
            description: "Items en el carrito"
        },
        subtotal: {
            type: "number",
            default: 0
        },
        cupon_aplicado: {
            type: "string",
            description: "Cu00f3digo de cupu00f3n"
        },
        descuento: {
            type: "number",
            default: 0
        },
        total: {
            type: "number",
            default: 0,
            description: "Valor final que se envu00eda a Meta como 'value'"
        },
        moneda: {
            type: "string",
            default: "ARS",
            description: "Requerido por Meta CAPI"
        },
        estado: {
            type: "string",
            enum: [
                "activo",
                "abandonado",
                "convertido"
            ],
            default: "activo"
        },
        fecha_ultimo_update: {
            type: "string",
            format: "date-time"
        },
        evento_abandono_enviado: {
            type: "boolean",
            default: false,
            description: "Flag para evitar duplicados en Retargeting de Meta"
        },
        email_recuperacion_enviado: {
            type: "boolean",
            default: false
        },
        whatsapp_recuperacion_enviado: {
            type: "boolean",
            default: false
        },
        external_id_meta: {
            type: "string",
            description: "ID persistente para mejorar el Match Quality de CAPI"
        }
    },
    required: [
        "id_comercio",
        "session_id"
    ]
};
