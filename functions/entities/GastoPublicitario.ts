
export const GastoPublicitario = {
    name: "GastoPublicitario",
    type: "object",
    properties: {
        id_comercio: {
            type: "string",
            description: "Referencia al comercio"
        },
        fecha: {
            type: "string",
            format: "date",
            description: "Fecha del gasto"
        },
        monto: {
            type: "number",
            description: "Monto invertido en ARS"
        },
        plataforma: {
            type: "string",
            enum: [
                "meta_ads",
                "google_ads",
                "otro"
            ],
            default: "meta_ads",
            description: "Plataforma publicitaria"
        },
        notas: {
            type: "string",
            description: "Notas sobre la inversiu00f3n (ej: Campau00f1a Liquidaciu00f3n Invierno)"
        }
    },
    required: [
        "id_comercio",
        "fecha",
        "monto"
    ]
};
