import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * Componente para proteger rutas de Comercio
 * Redirige a /ingreso si el usuario no está autenticado como comercio
 */
export function ProtectedCommerceRoute({ children }) {
    const { isCommerceAuthenticated, isLoadingCommerce } = useAuth();

    // Mostrar loading mientras se valida la sesión
    if (isLoadingCommerce) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Validando sesión...</p>
                </div>
            </div>
        );
    }

    // Redirigir a login si no está autenticado
    if (!isCommerceAuthenticated) {
        return <Navigate to="/ingreso" replace />;
    }

    // Renderizar contenido protegido
    return children;
}

/**
 * Componente para proteger rutas de Super Admin
 * Redirige a /admin-login si el usuario no está autenticado como super admin
 */
export function ProtectedSuperAdminRoute({ children }) {
    const { isSuperAdminAuthenticated, isLoadingSuperAdmin } = useAuth();

    // Mostrar loading mientras se valida la sesión
    if (isLoadingSuperAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-700 font-medium">Validando sesión de administrador...</p>
                </div>
            </div>
        );
    }

    // Redirigir a login de admin si no está autenticado
    if (!isSuperAdminAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    // Renderizar contenido protegido
    return children;
}

/**
 * Componente para proteger rutas de usuarios estándar (Base44)
 * Redirige a login de Base44 si el usuario no está autenticado
 */
export function ProtectedUserRoute({ children }) {
    const { isAuthenticated, isLoadingAuth } = useAuth();

    // Mostrar loading mientras se valida la sesión
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Validando usuario...</p>
                </div>
            </div>
        );
    }

    // Redirigir a login de Base44 si no está autenticado
    if (!isAuthenticated) {
        // Base44 maneja su propio login
        window.location.href = '/login';
        return null;
    }

    // Renderizar contenido protegido
    return children;
}
