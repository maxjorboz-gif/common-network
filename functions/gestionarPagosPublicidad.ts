// @ts-check
// Gestiona el ciclo de vida de los pagos de publicidad: Reporte (Comercio) -> Aprobación (Admin)

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

// Entidades Base44
const ENTITY_PAGO = "PagoPublicidad";
const ENTITY_COMERCIO = "Comercio";

const URL_PAGO = `https://app.base44.com/api/apps/${APP_ID}/entities/${ENTITY_PAGO}`;
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/${ENTITY_COMERCIO}`;

// Headers estándar
const headers = {
    "Content-Type": "application/json",
    "api_key": API_KEY
};

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const { action, ...data } = body;

        // ---------------------------------------------------------
        // ACCIÓN 1: REPORTAR PAGO (Lo hace el Comercio)
        // ---------------------------------------------------------
        if (action === 'reportar') {
            const { id_comercio, monto, comprobante, metodo_pago } = data;

            if (!id_comercio || !monto || !comprobante) {
                return Response.json({ error: "Faltan datos obligatorios (id, monto, comprobante)" }, { status: 400 });
            }

            // 1. Buscamos el comercio para tener nombre/código
            const respComercio = await fetch(`${URL_COMERCIO}/${id_comercio}`, { headers });
            const comercio = await respComercio.json();

            if (!comercio || comercio.error) {
                return Response.json({ error: "Comercio no encontrado" }, { status: 404 });
            }

            // 2. Creamos el registro de Pago Pendiente
            const nuevoPago = {
                id_comercio,
                nombre_comercio: comercio.nombre_comercio || "Desconocido",
                commerce_code: comercio.commerce_code,
                monto: Number(monto),
                comprobante: String(comprobante),
                metodo_pago: metodo_pago || "transferencia",
                estado: "pendiente", // pendiente, aprobado, rechazado
                fecha_reporte: new Date().toISOString()
            };

            const respCrear = await fetch(URL_PAGO, {
                method: 'POST',
                headers,
                body: JSON.stringify(nuevoPago)
            });

            const resultado = await respCrear.json();
            return Response.json({ success: true, pago: resultado });
        }

        // ---------------------------------------------------------
        // ACCIÓN 2: APROBAR PAGO (Lo hace el Super Admin)
        // ---------------------------------------------------------
        if (action === 'aprobar') {
            const { id_pago, admin_secret } = data;

            // Validación de seguridad simple (BYPASS TEMPORAL)
            // if (admin_secret !== "abriteporfavor") {
            //    return Response.json({ error: "Acceso denegado" }, { status: 403 });
            // }

            // 1. Obtener el pago
            const respPago = await fetch(`${URL_PAGO}/${id_pago}`, { headers });
            const pago = await respPago.json();

            if (!pago || pago.error) return Response.json({ error: "Pago no encontrado" }, { status: 404 });
            if (pago.estado === "aprobado") return Response.json({ error: "Este pago ya fue aprobado" }, { status: 400 });

            // 2. Actualizar estado del pago a APROBADO
            await fetch(`${URL_PAGO}/${id_pago}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    estado: "aprobado",
                    fecha_aprobacion: new Date().toISOString()
                })
            });

            // 3. ACREDITAR SALDO AL COMERCIO
            // Primero obtenemos saldo actual
            const respComercio = await fetch(`${URL_COMERCIO}/${pago.id_comercio}`, { headers });
            const comercio = await respComercio.json();

            const saldoActual = Number(comercio.saldo_publicidad || 0);
            const nuevoSaldo = saldoActual + Number(pago.monto);

            await fetch(`${URL_COMERCIO}/${pago.id_comercio}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    saldo_publicidad: nuevoSaldo
                })
            });

            return Response.json({
                success: true,
                mensaje: "Pago aprobado y saldo acreditado",
                nuevo_saldo: nuevoSaldo
            });
        }

        // ---------------------------------------------------------
        // ACCIÓN 3: LISTAR PAGOS (Para Admin Panel)
        // ---------------------------------------------------------
        if (action === 'listar') {
            const { admin_secret, estado } = data;

            // if (admin_secret !== "abriteporfavor") {
            //    return Response.json({ error: "Acceso denegado" }, { status: 403 });
            // }

            let urlBusqueda = URL_PAGO;
            if (estado) {
                urlBusqueda += `?estado=${estado}`;
            } else {
                // Ordenar por fecha reciente (simulado, depende de API Base44 sort)
                urlBusqueda += `?sort=-fecha_reporte`;
            }

            const resp = await fetch(urlBusqueda, { headers });
            const pagos = await resp.json();

            return Response.json({
                success: true,
                pagos: Array.isArray(pagos) ? pagos : []
            });
        }

        return Response.json({ error: "Acción no válida" }, { status: 400 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return Response.json({ error: errorMessage }, { status: 500 });
    }
});
