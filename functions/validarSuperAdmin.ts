// @ts-nocheck
import { crypto } from "jsr:@std/crypto";
import { createClientFromRequest } from "npm:@base44/sdk";

const JWT_SECRET_SUPERADMIN = "CLAVE_SECRETA_SUPERADMIN_2026_ULTRA_BLINDADA_#XYZ999";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { token } = await req.json();

        if (!token) {
            return Response.json({
                success: false,
                error: "Token requerido"
            }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Decodificar Token
        let decoded;
        try {
            decoded = atob(token);
        } catch (e) {
            return Response.json({
                success: false,
                error: "Token inválido"
            }, { status: 401 });
        }

        const parts = decoded.split(":");
        if (parts.length !== 4) {
            return Response.json({
                success: false,
                error: "Token malformado"
            }, { status: 401 });
        }

        const [prefix, superAdminId, timestamp, firmaRecibida] = parts;

        // 2. Validar Prefijo
        if (prefix !== "superadmin") {
            return Response.json({
                success: false,
                error: "Token no es de Super Admin"
            }, { status: 401 });
        }

        // 3. Validar Expiración (24 horas)
        const tokenAge = Date.now() - parseInt(timestamp);
        const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas

        if (tokenAge > MAX_AGE) {
            return Response.json({
                success: false,
                error: "Token expirado"
            }, { status: 401 });
        }

        // 4. Verificar Firma
        const payloadStr = `${prefix}:${superAdminId}:${timestamp}`;
        const firmaData = new TextEncoder().encode(payloadStr + JWT_SECRET_SUPERADMIN);
        const firmaBuffer = await crypto.subtle.digest("SHA-256", firmaData);
        const firmaArray = Array.from(new Uint8Array(firmaBuffer));
        const firmaEsperada = firmaArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (firmaRecibida !== firmaEsperada) {
            return Response.json({
                success: false,
                error: "Token inválido (firma incorrecta)"
            }, { status: 401 });
        }

        // 5. Obtener Datos del Super Admin
        let superAdmin;
        try {
            superAdmin = await adminClient.entities.SuperAdmin.get(superAdminId);
        } catch (e) {
            return Response.json({
                success: false,
                error: "Super Admin no encontrado"
            }, { status: 404 });
        }

        // 6. Verificar Estado
        if (superAdmin.estado === 'inactivo' || superAdmin.estado === 'suspendido') {
            return Response.json({
                success: false,
                error: "Cuenta inactiva"
            }, { status: 403 });
        }

        // 7. Respuesta Exitosa
        return Response.json({
            success: true,
            valid: true,
            superAdmin: {
                id: superAdmin.id,
                email: superAdmin.email,
                nombre: superAdmin.nombre || 'Super Admin',
                permisos: superAdmin.permisos || ['all'],
                ultimo_acceso: superAdmin.ultimo_acceso
            }
        });

    } catch (error) {
        console.error("Validar Super Admin Error:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});
