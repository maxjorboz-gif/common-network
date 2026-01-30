
export const Cliente = {
    name: "Cliente",
    type: "object",
    properties: {
        google_id: {
            type: "string",
            description: "ID de Google para cross-device tracking y audiencias de Google Ads"
        },
        email: {
            type: "string",
            description: "Email del cliente (dato crudo para envu00edo de correos)"
        },
        email_hash: {
            type: "string",
            description: "Email normalizado y hasheado con SHA256 para Meta CAPI (em)"
        },
        whatsapp: {
            type: "string",
            description: "Nu00famero de contacto principal (dato crudo)"
        },
        whatsapp_hash: {
            type: "string",
            description: "WhatsApp de contacto hasheado SHA256"
        },
        telefono_entrega: {
            type: "string",
            description: "Telu00e9fono de quien recibe (dato crudo)"
        },
        telefono_entrega_hash: {
            type: "string",
            description: "Telu00e9fono de entrega hasheado SHA256 para Meta"
        },
        nombre_completo: {
            type: "string",
            description: "Nombre para personalizaciu00f3n y envu00edo a Meta (fn/ln)"
        },
        nombre_hash: {
            type: "string",
            description: "Nombre hasheado SHA256 para Meta CAPI"
        },
        apellido_hash: {
            type: "string",
            description: "Apellido hasheado SHA256 para Meta CAPI"
        },
        ciudad: {
            type: "string",
            description: "Ciudad del cliente (ct)"
        },
        ciudad_hash: {
            type: "string",
            description: "Ciudad hasheada SHA256 para Meta CAPI"
        },
        provincia_estado: {
            type: "string",
            description: "Provincia (Argentina) / Estado (st)"
        },
        provincia_hash: {
            type: "string",
            description: "Provincia hasheada SHA256 para Meta CAPI"
        },
        pais: {
            type: "string",
            default: "AR",
            description: "Cu00f3digo de pau00eds ISO (country - siempre AR para normalizaciu00f3n local)"
        },
        pais_hash: {
            type: "string",
            description: "Pau00eds hasheado SHA256 para Meta CAPI"
        },
        direccion: {
            type: "string",
            description: "Direcciu00f3n de envu00edo"
        },
        codigo_postal: {
            type: "string",
            description: "Cu00f3digo postal (zp)"
        },
        codigo_postal_hash: {
            type: "string",
            description: "CP hasheado SHA256 para Meta CAPI"
        },
        fbp: {
            type: "string",
            description: "Facebook Browser ID (cookie _fbp)"
        },
        fbc: {
            type: "string",
            description: "Facebook Click ID (paru00e1metro fbclid)"
        },
        lead_source_original: {
            type: "string",
            enum: [
                "google_ads",
                "meta_ads",
                "organico",
                "referido",
                "directo"
            ],
            description: "Origen del lead para atribuciu00f3n"
        },
        referido_por: {
            type: "string",
            description: "ID del cliente que lo refiriu00f3"
        },
        puntuacion_ltv: {
            type: "number",
            default: 0,
            description: "Lifetime Value calculado (ayuda a Meta a buscar clientes similares de alto valor)"
        },
        cross_store_trust_score: {
            type: "number",
            default: 50,
            description: "u00cdndice de confianza 1-100"
        },
        perfil_comprador: {
            type: "string",
            enum: [
                "visual_emocional",
                "tecnico_racional",
                "buscador_precio",
                "indefinido"
            ],
            default: "indefinido",
            description: "Perfil detectado por IA para anuncios personalizados"
        },
        total_compras: {
            type: "number",
            default: 0
        },
        total_gastado: {
            type: "number",
            default: 0
        }
    },
    required: [
        "email",
        "whatsapp",
        "nombre_completo"
    ]
};
