// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        let user;
        try {
            user = await base44.auth.me();
        } catch (e) {
            return Response.json({ error: 'Auth fail' }, { status: 401 });
        }

        if (!user) return Response.json({ error: 'No user' }, { status: 401 });

        const userEmail = (user.email || "").toLowerCase().trim();

        // FAILSAFE: If DB is broken or empty, we just say "No Commerce" (null)
        // This allows the frontend to show the "Register Now" screen instead of a Red Error.
        let miComercio = null;

        try {
            const comercios = await base44.asServiceRole.entities.Comercio.filter({
                email_admin: userEmail
            }, '-created_date', 1);

            if (comercios && comercios.length > 0) {
                miComercio = comercios[0];
            }
        } catch (dbErr) {
            console.warn("Comercio lookup failed (likely empty table), returning null.", dbErr.message);
        }

        // Return logic: 
        // If Commerce exists and is active -> Return it.
        // If Commerce exists but inactive -> Return it (Frontend handles "Pending" UI).
        // If NO Commerce -> Return null (Frontend handles "Register" UI).

        return Response.json({
            success: true,
            id_comercio: miComercio ? miComercio.id_comercio : null,
            comercio: miComercio // Can be null
        });

    } catch (globalErr) {
        return Response.json({ error: globalErr.message }, { status: 500 });
    }
});
