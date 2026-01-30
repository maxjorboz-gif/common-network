
export const EventoMeta = {
    name: "EventoMeta",
    type: "object",
    properties: {
        event_id: {
            type: "string",
            description: "ID u00fanico e igual para Pu00edxel y CAPI (Deduplicaciu00f3n infalible)"
        },
        event_name: {
            type: "string",
            enum: [
                "PageView",
                "ViewContent",
                "AddToCart",
                "InitiateCheckout",
                "Purchase",
                "Lead",
                "Contact",
                "Search"
            ],
            description: "Nombre del evento estu00e1ndar de Meta"
        },
        id_cliente: {
            type: "string",
            description: "Referencia interna para auditoru00eda de eventos"
        },
        id_comercio: {
            type: "string",
            description: "ID del comercio para seleccionar el Pixel ID y Access Token correcto"
        },
        user_data: {
            type: "object",
            properties: {
                em: {
                    type: "string",
                    description: "Email hasheado SHA256"
                },
                ph: {
                    type: "string",
                    description: "Telu00e9fono normalizado (549...) y hasheado SHA256"
                },
                fn: {
                    type: "string",
                    description: "Nombre hasheado SHA256"
                },
                ln: {
                    type: "string",
                    description: "Apellido hasheado SHA256"
                },
                ct: {
                    type: "string",
                    description: "Ciudad hasheada SHA256"
                },
                st: {
                    type: "string",
                    description: "Estado/Provincia hasheado SHA256"
                },
                zp: {
                    type: "string",
                    description: "Cu00f3digo Postal hasheado SHA256"
                },
                country: {
                    type: "string",
                    description: "Pau00eds hasheado SHA256"
                },
                fbp: {
                    type: "string",
                    description: "Cookie _fbp"
                },
                fbc: {
                    type: "string",
                    description: "Cookie _fbc (Click ID)"
                },
                client_ip_address: {
                    type: "string"
                },
                client_user_agent: {
                    type: "string"
                },
                external_id: {
                    type: "string",
                    description: "ID de cliente o session_id para hilvanar el recorrido del usuario"
                }
            }
        },
        custom_data: {
            type: "object",
            properties: {
                content_ids: {
                    type: "array",
                    items: {
                        type": "string"
          },
                    description: "SKUs de las parrillas o accesorios"
                },
                content_name: {
                    type: "string"
                },
                content_type: {
                    type: "string",
                    default: "product"
                },
                content_category: {
                    type: "string"
                },
                value: {
                    type: "number",
                    description: "Valor monetario real del evento"
                },
                currency: {
                    type": "string",
          default: "ARS"
                },
                num_items: {
                    type: "number"
                },
                predicted_ltv: {
                    type: "number"
                }
            }
        },
        action_source: {
            type: "string",
            default: "website"
        },
        event_source_url: {
            type: "string",
            description: "URL donde ocurriu00f3 el evento"
        },
        enviado_pixel: {
            type: "boolean",
            default: false
        },
        enviado_capi: {
            type: "boolean",
            default: false
        },
        respuesta_capi: {
            type: "object"
        },
        event_time: {
            type: "number",
            description: "Timestamp Unix (segundos)"
        },
        test_event_code: {
            type: "string",
            description: "Cu00f3digo de prueba para el gestor de eventos de Meta"
        }
    },
    required: [
        "event_id",
        "event_name",
        "event_time",
        "id_comercio"
    ]
};
