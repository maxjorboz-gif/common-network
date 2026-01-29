// @ts-nocheck
import { createClient } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClient(
            Deno.env.get("BASE44_API_URL") ?? "",
            Deno.env.get("BASE44_SERVICE_ROLE_KEY") ?? ""
        );

        // Introspección del objeto cliente
        const keysRoot = Object.keys(base44);
        const hasAuth = !!base44.auth;
        const keysAuth = hasAuth ? Object.keys(base44.auth) : [];
        const hasAdminInAuth = hasAuth && !!base44.auth.admin;

        const hasServiceRole = !!base44.asServiceRole;
        const keysServiceRole = hasServiceRole ? Object.keys(base44.asServiceRole) : [];
        const hasAuthInService = hasServiceRole && !!base44.asServiceRole.auth;

        return Response.json({
            debug: "Structure Introspection",
            root_keys: keysRoot,
            has_auth_on_root: hasAuth,
            auth_keys_on_root: keysAuth,
            has_admin_on_root_auth: hasAdminInAuth,

            has_asServiceRole: hasServiceRole,
            service_role_keys: keysServiceRole,
            has_auth_in_service: hasAuthInService,

            env_url_set: !!Deno.env.get("BASE44_API_URL"),
            env_key_set: !!Deno.env.get("BASE44_SERVICE_ROLE_KEY")
        });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});
