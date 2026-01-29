
export interface User {
    id: string;
    email: string;
    role: 'admin' | 'merchant' | 'customer';
    commerceCode?: string; // Anteriormente tenantId / id_comercio
}

export interface Tenant {
    commerceCode: string;
    name: string;
    status: 'active' | 'pending' | 'suspended';
    planId?: string;
}

export interface AuthenticatedContext {
    user: User;
    tenant?: Tenant;
}
