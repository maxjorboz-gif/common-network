
export const Logs_Configuracion = {
    name: "Logs_Configuracion",
    type: "object",
    properties: {
        id_comercio: {
            type: "string",
            description: "Referencia al comercio"
        },
        id_admin: {
            type: "string",
            description: "Email del admin que realizu00f3 el cambio"
        },
        campos_modificados: {
            type: "object",
            description: "Objeto con {campo: {valor_anterior, valor_nuevo}}"
        },
        descripcion: {
            type: "string",
            description: "Descripciu00f3n legible del cambio"
        },
        timestamp: {
            type: "string",
            format: "date-time",
            description: "Fecha y hora del cambio"
        },
        ip_address: {
            type: "string",
            description: "IP del administrador"
        }
    },
    required: [
        "id_comercio",
        "id_admin",
        "campos_modificados"
    ]
};
