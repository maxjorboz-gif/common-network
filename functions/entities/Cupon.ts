
export const Cupon = {
    name: "Cupon",
    type: "object",
    properties: {
        codigo: {
            type: "string",
            description: "Cu00f3digo del cupu00f3n (ej: PARRI10, AGENTE30)"
        },
        id_comercio: {
            type: "string"
        },
        tipo: {
            type: "string",
            enum: [
                "porcentaje",
                "monto_fijo",
                "envio_gratis"
            ],
            default: "porcentaje"
        },
        valor: {
            type: "number",
            description: "Valor del descuento (monto o %)"
        },
        minimo_compra: {
            type: "number",
            default: 0
        },
        acumulable: {
            type: "boolean",
            default: true,
            description: "Permite sumarse a la oferta por transferencia u otras promociones de pago"
        },
        origen: {
            type: "string",
            enum: [
                "popup_emergente",
                "agente_whatsapp",
                "sistema_referidos"
            ],
            description: "Determina si el cupu00f3n fue automu00e1tico o entregado por un humano"
        },
        id_creador: {
            type: "string",
            description: "ID del agente que emitiu00f3 el cupu00f3n para seguimiento de ventas"
        },
        usos_maximos: {
            type: "number",
            default: 1
        },
        usos_actuales: {
            type: "number",
            default: 0
        },
        fecha_inicio: {
            type: "string",
            format: "date"
        },
        fecha_fin: {
            type: "string",
            format: "date"
        },
        activo: {
            type: "boolean",
            default: true
        },
        es_referido: {
            type: "boolean",
            default: false
        },
        id_cliente_dueno: {
            type: "string",
            description: "Cliente dueu00f1o del cupu00f3n en caso de sistema de referidos"
        }
    },
    required: [
        "codigo",
        "id_comercio",
        "tipo",
        "valor",
        "origen"
    ]
};
