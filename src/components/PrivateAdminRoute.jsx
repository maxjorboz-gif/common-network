import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const PrivateAdminRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(null); // null = checking

    useEffect(() => {
        const verifyToken = () => {
            const token = localStorage.getItem('super_admin_token');

            // Validación Básica (Existencia)
            // Nota: La validación fuerte criptográfica sucede en cada petición al BACKEND.
            // Aquí solo validamos "tenencia de boleto" para UX rápida.
            if (!token) {
                setIsAuthorized(false);
                return;
            }

            // Opcional: Decodificar base64 para ver expiración (timestamp)
            try {
                const decoded = atob(token);
                // Formato esperado: ID:Timestamp:Firma
                const parts = decoded.split(':');
                if (parts.length !== 3) throw new Error("Token malformado");

                // Check Expiración (ej. 12 horas)
                const timestamp = parseInt(parts[1]);
                const now = Date.now();
                const twelveHours = 12 * 60 * 60 * 1000;

                if (now - timestamp > twelveHours) {
                    // Expiró
                    localStorage.removeItem('super_admin_token');
                    setIsAuthorized(false);
                } else {
                    setIsAuthorized(true);
                }

            } catch (e) {
                console.error("Token corrupto", e);
                localStorage.removeItem('super_admin_token');
                setIsAuthorized(false);
            }
        };

        verifyToken();
    }, []);

    if (isAuthorized === null) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" />
            </div>
        );
    }

    return isAuthorized ? children : <Navigate to="/admin/login" replace />;
};
