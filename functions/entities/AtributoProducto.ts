
export const AtributoProducto = {
    name: "AtributoProducto",
    type: "object",
    properties: {
        id_producto: {
            type: "string",
            description: "Referencia al producto padre - OBLIGATORIO"
        },
        nombre_atributo: {
            type: "string",
            description: "Nombre del atributo (ej: Material, Tipo de Emparrillado, Color, Tamau00f1o)"
        },
        valor_atributo: {
            type: "string",
            description: "Valor especu00edfico (ej: Acero Inoxidable, Enlozado, Hierro Redondo)"
        },
        tag_meta_mapping: {
            type: "string",
            enum: [
                "material",
                "size",
                "color",
                "pattern",
                "custom_label_0",
                "custom_label_1"
            ],
            description: "Mapeo con campos estu00e1ndar de Meta para anuncios dinu00e1micos y personalizaciu00f3n"
        },
        ia_weight: {
            type: "number",
            default: 0,
            description: "Peso de importancia para recomendaciones de la IA segu00fan perfil de asador"
        },
        orden: {
            type: "number",
            default: 0,
            description: "Prioridad de visualizaciu00f3n en la ficha tu00e9cnica"
        },
        afecta_precio: {
            type: "boolean",
            default: false,
            description: "Define si este atributo modifica el precio_estandar (ej: emparrillado inoxidable vs hierro)"
        },
        variacion_precio: {
            type: "number",
            default: 0,
            description: "Monto que se suma o resta al precio base"
        }
    },
    required: [
        "id_producto",
        "nombre_atributo",
        "valor_atributo"
    ]
};
