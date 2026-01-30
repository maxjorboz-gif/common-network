import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Store, Package, ShoppingBag, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// HARDCODED SUPER ADMIN ID (To exclude from merchant dashboard)
const SUPER_ADMIN_ID = "14349463-549c-4bf9-b223-95b058a7493a";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
    Store,
    Package,
    ShoppingBag,
    Settings,
    BarChart3,
    Users,
    Zap,
    Trophy,
    Wallet,
    LogOut,
    ShieldAlert,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Importación de sub-componentes administrativos
import AdminProductos from '@/components/admin/AdminProductos.jsx';
import AdminOrdenes from '@/components/admin/AdminOrdenes.jsx';
import AdminLeads from '@/components/admin/AdminLeads.jsx';
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.jsx';
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.jsx';
import AdminConversaciones from '@/components/admin/AdminConversaciones.jsx';
import AdminSorteos from '@/components/admin/AdminSorteos.jsx';
import AdminAdWallet from '@/components/admin/AdminAdWallet.jsx';

// HARDCODED SUPER ADMIN ID
const SUPER_ADMIN_ID = "14349463-549c-4bf9-b223-95b058a7493a";

export default function MerchantDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('hub');
    const [comercio, setComercio] = useState(null);
    const [loadingComercio, setLoadingComercio] = useState(true);

    useEffect(() => {
        const sessionRaw = localStorage.getItem('comercio_session') || localStorage.getItem('comercio_admin');

        if (!loading) {
            if (!user && !sessionRaw) {
                navigate('/login');
                return;
            }
            if (user?.id === SUPER_ADMIN_ID) {
                navigate('/adminSupreme');
                return;
            }
        }

        if (sessionRaw) {
            try {
                const session = JSON.parse(sessionRaw);
                setComercio(session);
            } catch (e) {
                console.error("Error cargando sesión de comercio:", e);
            }
        }
        setLoadingComercio(false);
    }, [user, loading, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('comercio_session');
        localStorage.removeItem('comercio_admin');
        window.location.href = '/';
    };

    if (loading || loadingComercio) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <span className="text-orange-600 animate-pulse font-bold uppercase tracking-widest">
                    Cargando Panel...
                </span>
            </div>
        );
    }

    if (comercio && !comercio.activo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 text-white">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20">
                        <ShieldAlert className="w-10 h-10 text-orange-600 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Cuenta en Revisión</h2>
                    <p className="text-neutral-400">
                        Tu tienda <span className="text-white font-bold">{comercio.nombre_comercio || comercio.nombre_tienda}</span> está esperando la aprobación de un administrador.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/')} className="border-neutral-800 text-neutral-400 hover:text-white">
                        Volver al Inicio
                    </Button>
                </div>
            </div>
        );
    }

    if (!comercio) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4">
                <h2 className="text-2xl font-bold mb-4">No se encontró información del comercio</h2>
                <Button onClick={() => navigate('/registro')}>Registrar mi Comercio</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header Moderno */}
            <header className="border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                            <Store className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
                                {comercio.nombre_tienda || comercio.nombre_comercio}
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-black">Activo</Badge>
                            </h1>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Panel de Control</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-white hidden md:flex items-center gap-2"
                            onClick={() => window.open(`/tienda/${comercio.commerce_code}`, '_blank')}
                        >
                            Ver Tienda <ChevronRight size={14} />
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
                    <TabsList className="bg-neutral-900 border-neutral-800 p-1 h-auto grid grid-cols-4 lg:grid-cols-9 gap-1 overflow-x-auto">
                        <TabsTrigger value="hub" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <LayoutDashboard className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Inicio</span>
                        </TabsTrigger>
                        <TabsTrigger value="estadisticas" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <BarChart3 className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Stats</span>
                        </TabsTrigger>
                        <TabsTrigger value="productos" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <Package className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Prod</span>
                        </TabsTrigger>
                        <TabsTrigger value="ordenes" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <ShoppingBag className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Ventas</span>
                        </TabsTrigger>
                        <TabsTrigger value="leads" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <Users className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Leads</span>
                        </TabsTrigger>
                        <TabsTrigger value="conversaciones" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <Zap className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Chat</span>
                        </TabsTrigger>
                        <TabsTrigger value="sorteos" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <Trophy className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Sorteos</span>
                        </TabsTrigger>
                        <TabsTrigger value="ads" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <Wallet className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Ads</span>
                        </TabsTrigger>
                        <TabsTrigger value="config" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2 text-xs font-bold uppercase italic tracking-tighter">
                            <Settings className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Config</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* VISTA HUB (Resumen Visual) */}
                    <TabsContent value="hub" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card
                                onClick={() => setSelectedTab('productos')}
                                className="bg-neutral-900 border-neutral-800 hover:border-orange-600 transition-all cursor-pointer group overflow-hidden"
                            >
                                <CardHeader className="relative z-10">
                                    <div className="w-12 h-12 bg-orange-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Package className="text-orange-600" />
                                    </div>
                                    <CardTitle className="text-white font-black uppercase italic text-xl tracking-tighter">Catálogo</CardTitle>
                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Gestionar Productos</p>
                                </CardHeader>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-600/10 transition-colors"></div>
                            </Card>

                            <Card
                                onClick={() => setSelectedTab('ordenes')}
                                className="bg-neutral-900 border-neutral-800 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden"
                            >
                                <CardHeader className="relative z-10">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ShoppingBag className="text-blue-500" />
                                    </div>
                                    <CardTitle className="text-white font-black uppercase italic text-xl tracking-tighter">Órdenes</CardTitle>
                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Ventas y Pedidos</p>
                                </CardHeader>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>
                            </Card>

                            <Card
                                onClick={() => setSelectedTab('estadisticas')}
                                className="bg-neutral-900 border-neutral-800 hover:border-green-500 transition-all cursor-pointer group overflow-hidden"
                            >
                                <CardHeader className="relative z-10">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <BarChart3 className="text-green-500" />
                                    </div>
                                    <CardTitle className="text-white font-black uppercase italic text-xl tracking-tighter">Estadísticas</CardTitle>
                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Análisis de Rendimiento</p>
                                </CardHeader>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-600/10 transition-colors"></div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="estadisticas" className="bg-white rounded-2xl p-6 text-black">
                        <AdminEstadisticas comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="productos" className="bg-white rounded-2xl p-6 text-black">
                        <AdminProductos comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="ordenes" className="bg-white rounded-2xl p-6 text-black">
                        <AdminOrdenes comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="leads" className="bg-white rounded-2xl p-6 text-black">
                        <AdminLeads comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="conversaciones" className="bg-white rounded-2xl p-6 text-black">
                        <AdminConversaciones comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="config" className="bg-white rounded-2xl p-6 text-black">
                        <AdminConfiguracion comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="sorteos" className="bg-white rounded-2xl p-6 text-black">
                        <AdminSorteos comercio={comercio} />
                    </TabsContent>

                    <TabsContent value="ads" className="bg-white rounded-2xl p-6 text-black">
                        <AdminAdWallet comercio={comercio} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
