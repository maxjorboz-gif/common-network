
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';
import { User, Tenant, AuthenticatedContext } from './types.ts';

// Simulated Middleware for Base44 Functions
// In a real edge environment, this would verify JWTs.
// Here validamos la sesión de Base44 y enriquecemos el contexto con el Tenant.

export async function withAuth(req: Request, handler: (ctx: AuthenticatedContext, req: Request) => Promise<Response>, requiredRole?: 'admin' | 'merchant'): Promise<Response> {
    try {
        const base44 = createClientFromRequest(req);

        // 1. Verify Auth
        const { data: { user }, error } = await base44.auth.getUser();
        if (error || !user) {
            return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
        }

        // 2. Map User & Role
        // Assuming metadata contains role/tenant, or we fetch it.
        // For this architecture, we check the 'SolicitudComercio' or explicit metadata

        const userRole = user.user_metadata?.role || 'merchant'; // Default to merchant for now if undefined

        if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
            return Response.json({ error: 'Forbidden', code: 'insufficient_permissions' }, { status: 403 });
        }

        // 3. Resolve Tenant (The "SaaS" part)
        // Verify if user is linked to a commerce
        let tenant: Tenant | undefined;

        // Optimización: Si el usuario tiene commerce_code en metadata, lo usamos.
        let storedCode = user.user_metadata?.commerce_code;

        if (storedCode) {
            tenant = { commerceCode: storedCode, name: 'Cache', status: 'active' }; // Placeholder name
        } else {
            // Fallback: Buscar solicitud aprobada
            // Usamos el cliente del usuario, que debe tener permiso de leer su propia solicitud.
            const { data: solicitudes } = await base44.entities.SolicitudComercio.filter({
                user_id: user.id
            });

            if (solicitudes && solicitudes.length > 0) {
                const solicitud = solicitudes[0];
                // CRITICAL: Use commerce_code, not ID.
                // If legacy data missing commerce_code, this might be undefined.
                // We assume commerce_code exists as per new requirements.
                if (solicitud.commerce_code) {
                    tenant = {
                        commerceCode: solicitud.commerce_code,
                        name: solicitud.nombre,
                        status: solicitud.status === 'aprobado' ? 'active' : 'pending'
                    };
                }
            }
        }

        // Block inactive tenants if strict mode (optional)
        if (tenant && tenant.status !== 'active' && requiredRole === 'merchant') {
            // Allow read-only or limited access? Or block?
            // For now, we allow but warn.
        }

        const context: AuthenticatedContext = {
            user: {
                id: user.id,
                email: user.email || '',
                role: userRole,
                commerceCode: tenant?.commerceCode
            },
            tenant
        };

        return await handler(context, req);

    } catch (err) {
        console.error("Middleware Auth Error:", err);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
