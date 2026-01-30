
export const Comercio = {
    name: "Comercio",
    type: "object",
    properties: {
        nombre: {
            type: "string",
            description: "Nombre del comercio"
        },
        nombre_usuario: {
            type: "string",
            description: "Nombre completo del dueu00f1o/usuario"
        },
        user_id: {
            type: "string",
            description: "ID del Usuario (Auth) - Opcional"
        },
        password: {
            type: "string",
            description: "Contraseu00f1a de acceso del comercio"
        },
        commerce_code: {
            type: "string",
            description: "Cu00f3digo u00fanico de la tienda."
        },
        estado_registro: {
            type: "string",
            enum: [
                "borrador",
                "pendiente_pago",
                "pendiente_aprobacion",
                "activo",
                "rechazado"
            ],
            default: "borrador",
            description: "Estado del tru00e1mite de alta."
        },
        numero_operacion: {
            type: "string",
            description: "Nu00famero de comprobante."
        },
        slug: {
            type: "string",
            description: "URL amigable"
        },
        logo_url: {
            type: "string",
            description: "Logo"
        },
        descripcion: {
            type: "string",
            description: "Descripciu00f3n"
        },
        whatsapp_negocio: {
            type: "string",
            description: "WhatsApp"
        },
        email_negocio: {
            type: "string",
            description": "Email de contacto"
    },
        direccion: {
            type: "string",
            description: "Direcciu00f3n"
        },
        ciudad: {
            type: "string",
            description: "Ciudad"
        },
        plan: {
            type: "string",
            enum: [
                "bronce",
                "plata",
                "oro"
            ],
            default: "bronce",
            description: "Plan"
        },
        comision_porcentaje: {
            type: "number",
            default: 5,
            description: "Comisiu00f3n"
        },
        activo: {
            type: "boolean",
            default: false,
            description: "Visibilidad pu00fablica"
        },
        meta_pixel_id: {
            type: "string",
            description: "Meta Pixel ID"
        },
        meta_dataset_id: {
            type: "string",
            description: "Dataset ID"
        },
        meta_access_token: {
            type: "string",
            description: "Token CAPI"
        },
        meta_test_event_code: {
            type: "string",
            default: "",
            description: "Test Code"
        },
        total_ventas: {
            type: "number",
            default: 0,
            description: "Ventas totales"
        },
        total_ordenes: {
            type: "number",
            default: 0,
            description: "u00d3rdenes totales"
        },
        configuracion_avanzada: {
            type: "object",
            description: "Config adicional",
            properties: {
                usa_capi: {
                    type: "boolean",
                    default: true
                }
            }
        }
    },
    required: [
        "nombre",
        "commerce_code"
    ]
};
