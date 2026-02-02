// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

// --- CONFIGURACIÓN ---
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_PAGO = `https://app.base44.com/api/apps/${APP_ID}/entities/PagoPublicidad`;
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

// Clave Secreta (Debe coincidir con loginSuperAdmin.ts)
const JWT_SECRET = "CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR_2026_CAMBIAME";

// --- HELPER DE SEGURIDAD ---
async function verifyAdminToken(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

        const token = authHeader.split(" ")[1];
        const decoded = atob(token);
        const [payload, signature] = decoded.split(':'); // payload=id:timestamp

        // Recrear firma
        const encoder = new TextEncoder();
        const data = encoder.encode(payload + JWT_SECRET);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        return signature === expectedSignature;
    } catch (e) {
        return false;
    }
}

// --- SERVIDOR ---
Deno.serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response("OK", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });
    }

    try {
        const body = await req.json();
        const { action, ...data } = body;

        // ---------------------------------------------------------
        // CASO 1: PÚBLICO (Reportar Pago - Acceso Comercio)
        // ---------------------------------------------------------
        if (action === 'reportar') {
            const { id_comercio, monto, comprobante, metodo_pago } = data;

            // Validación estricta de datos
            if (!id_comercio || !monto || Number(monto) <= 0 || !comprobante) {
                return Response.json({ error: "Datos inválidos para reporte." }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
            }

            // 1. Validar Comercio
            const respComercio = await fetch(`${URL_COMERCIO}/${id_comercio}`, { headers: { 'api_key': API_KEY } });
            const comercio = await respComercio.json();

            if (!comercio || comercio.error) {
                return Response.json({ error: "Comercio inexistente." }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
            }

            // 2. Crear Pago Pendiente
            const nuevoPago = {
                id_comercio: id_comercio,
                nombre_comercio: comercio.nombre_comercio || "Sin Nombre",
                commerce_code: comercio.commerce_code,
                monto: Number(monto),
                comprobante: String(comprobante).slice(0, 500), // Truncar por seguridad
                metodo_pago: metodo_pago || "transferencia",
                estado: "pendiente",
                fecha_reporte: new Date().toISOString()
            };

            const respCrear = await fetch(URL_PAGO, {
                method: 'POST',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoPago)
            });

            const resultado = await respCrear.json();
            return Response.json({ success: true, pago: resultado }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // ---------------------------------------------------------
        // CASO 2: PROTEGIDO (Admin Supremo - Listar y Aprobar)
        // ---------------------------------------------------------

        // VERIFICACIÓN DE SEGURIDAD
        const isAdmin = await verifyAdminToken(req);
        if (!isAdmin) {
            return Response.json({ error: "No autorizado. Token inválido o ausente." }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // A. LISTAR
        if (action === 'listar') {
            const { estado } = data;
            let urlQuery = URL_PAGO + "?sort=-fecha_reporte"; // Más recientes primero
            if (estado) urlQuery += `&estado=${estado}`;

            const resp = await fetch(urlQuery, { headers: { 'api_key': API_KEY } });
            const pagos = await resp.json();

            return Response.json({ success: true, pagos: Array.isArray(pagos) ? pagos : [] }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // B. APROBAR (Transacción Crítica)
        if (action === 'aprobar') {
            const { id_pago } = data;

            // 1. Obtener Pago
            const respPago = await fetch(`${URL_PAGO}/${id_pago}`, { headers: { 'api_key': API_KEY } });
            const pago = await respPago.json();

            if (!pago || pago.error) return Response.json({ error: "Pago no encontrado" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
            if (pago.estado === "aprobado") return Response.json({ error: "Ya fue aprobado previamente" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

            // 2. Actualizar Estado Pago
            await fetch(`${URL_PAGO}/${id_pago}`, {
                method: 'PATCH',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: "aprobado",
                    fecha_aprobacion: new Date().toISOString(),
                    aprobado_por: "SuperAdmin"
                })
            });

            // 3. Acreditar Saldo a Comercio
            const respComercio = await fetch(`${URL_COMERCIO}/${pago.id_comercio}`, { headers: { 'api_key': API_KEY } });
            const comercio = await respComercio.json();

            const saldoAnterior = Number(comercio.saldo_publicidad || 0);
            const nuevoSaldo = saldoAnterior + Number(pago.monto);

            await fetch(`${URL_COMERCIO}/${pago.id_comercio}`, {
                method: 'PATCH',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ saldo_publicidad: nuevoSaldo })
            });

            return Response.json({
                success: true,
                mensaje: "Pago aprobado y saldo acreditado.",
                nuevo_saldo: nuevoSaldo
            }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ error: "Acción no reconocida" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
