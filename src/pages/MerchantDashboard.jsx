import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Store, Package, ShoppingBag, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// HARDCODED SUPER ADMIN ID (To exclude from merchant dashboard)
const SUPER_ADMIN_ID = "14349463-549c-4bf9-b223-95b058a7493a";

export default function MerchantDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login'); // Redirect unauthenticated to login
            } else if (user.id === SUPER_ADMIN_ID) {
                navigate('/admin'); // Redirect super admin to their panel
            }
        }
    }, [user, loading, navigate]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <span className="text-orange-600 animate-pulse font-bold uppercase tracking-widest">
                    Cargando Tu Tienda...
                </span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <header className="mb-12 flex items-center justify-between border-b border-neutral-900 pb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                        <Store className="text-orange-600" size={32} />
                        Panel del Comercio
                    </h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">
                        Gestión de tu Tienda
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-white">{user.email}</p>
                        <p className="text-xs text-green-500 uppercase font-black tracking-widest">Comerciante Verificado</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Ir a la Tienda
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* PRODUCTOS */}
                <Card className="bg-neutral-900 border-neutral-800 hover:border-orange-600/50 transition-colors cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic group-hover:text-orange-500 transition-colors">
                            <Package className="text-orange-600" /> Productos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-950/50 group-hover:bg-neutral-900 transition-colors">
                            <p className="text-neutral-500 font-bold uppercase text-xs">
                                Gestionar Catálogo
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* ORDENES */}
                <Card className="bg-neutral-900 border-neutral-800 hover:border-orange-600/50 transition-colors cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic group-hover:text-orange-500 transition-colors">
                            <ShoppingBag className="text-blue-500" /> Órdenes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-950/50 group-hover:bg-neutral-900 transition-colors">
                            <p className="text-neutral-500 font-bold uppercase text-xs">
                                Ver Pedidos Recientes
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* CONFIGURACION */}
                <Card className="bg-neutral-900 border-neutral-800 hover:border-orange-600/50 transition-colors cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic group-hover:text-orange-500 transition-colors">
                            <Settings className="text-green-500" /> Configuración
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-950/50 group-hover:bg-neutral-900 transition-colors">
                            <p className="text-neutral-500 font-bold uppercase text-xs">
                                Datos del Comercio y Pagos
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
