// @ts-nocheck
import { crypto } from "jsr:@std/crypto";
import { createClientFromRequest } from "npm:@base44/sdk";

// SECRETO SUPER ADMIN (Diferente al de Comercios, máxima seguridad)
const JWT_SECRET_SUPERADMIN = "CLAVE_SECRETA_SUPERADMIN_2026_ULTRA_BLINDADA_#XYZ999";
const PASSWORD_SALT = "v4_SUPER_SECRET_SALT_2026_PROTECT_BASE44_SYSTEM_#99282";

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: "Email y contraseña requeridos" }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Buscar Super Admin
        const superAdmins = await adminClient.entities.SuperAdmin.filter({
            email: email
        });

        if (!Array.isArray(superAdmins) || superAdmins.length === 0) {
            await new Promise(r => setTimeout(r, 500)); // Anti-timing attack
            return Response.json({
                success: false,
                error: "Credenciales inválidas"
            }, { status: 401 });
        }

        const superAdmin = superAdmins[0];

        // 2. Verificar Estado
        if (superAdmin.estado === 'inactivo' || superAdmin.estado === 'suspendido') {
            return Response.json({
                success: false,
                error: "Cuenta inactiva. Contacte al administrador del sistema."
            }, { status: 403 });
        }

        // 3. Verificación de Contraseña
        let isValid = false;
        let needsMigration = false;

        if (superAdmin.password_hash) {
            // Verificación con hash
            const inputHash = await hashPassword(password);
            isValid = (inputHash === superAdmin.password_hash);
        } else if (superAdmin.password) {
            // Legacy fallback (texto plano)
            if (password === superAdmin.password) {
                isValid = true;
                needsMigration = true;
            }
        }

        if (!isValid) {
            await new Promise(r => setTimeout(r, 500));
            return Response.json({
                success: false,
                error: "Credenciales inválidas"
            }, { status: 401 });
        }

        // 4. AUTO-MIGRACIÓN (Si aplica)
        if (needsMigration) {
            try {
                const newSecureHash = await hashPassword(password);
                const superAdminId = superAdmin.id || superAdmin._id;

                adminClient.entities.SuperAdmin.update(superAdminId, {
                    password_hash: newSecureHash,
                    password: null, // Eliminar contraseña en texto plano
                    migracion_seguridad: new Date().toISOString()
                }).catch(err => console.error("Error en auto-migración:", err));

                console.log(`[SECURITY] Super Admin ${superAdminId} migrado a SHA-256.`);
            } catch (e) {
                console.error("Fallo intento de migración:", e);
            }
        }

        // 5. Generar Token Firmado
        const payloadStr = `superadmin:${superAdmin.id}:${Date.now()}`;
        const firmaData = new TextEncoder().encode(payloadStr + JWT_SECRET_SUPERADMIN);
        const firmaBuffer = await crypto.subtle.digest("SHA-256", firmaData);
        const firmaArray = Array.from(new Uint8Array(firmaBuffer));
        const firmaHex = firmaArray.map(b => b.toString(16).padStart(2, "0")).join("");

        const token = btoa(`${payloadStr}:${firmaHex}`);

        // 6. Actualizar último acceso
        try {
            await adminClient.entities.SuperAdmin.update(superAdmin.id, {
                ultimo_acceso: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error actualizando último acceso:", e);
        }

        // 7. Respuesta Exitosa
        return Response.json({
            success: true,
            session: {
                token: token
            },
            superAdmin: {
                id: superAdmin.id,
                email: superAdmin.email,
                nombre: superAdmin.nombre || 'Super Admin',
                permisos: superAdmin.permisos || ['all']
            }
        });

    } catch (error) {
        console.error("Login Super Admin Error:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});
