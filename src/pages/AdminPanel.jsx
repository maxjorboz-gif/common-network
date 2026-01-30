import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ShoppingBag,
  Users,
  Settings,
  BarChart3,
  Plus,
  LogOut,
  Trophy,
  Zap,
  Wallet,
  ShieldAlert,
  MessageCircle,
  TrendingUp,
  Package
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Importación de sub-componentes administrativos (SOLO COMERCIO)
import AdminProductos from '@/components/admin/AdminProductos.jsx';
import AdminOrdenes from '@/components/admin/AdminOrdenes.jsx';
import AdminLeads from '@/components/admin/AdminLeads.jsx';
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.jsx';
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.jsx';
import AdminConversaciones from '@/components/admin/AdminConversaciones.jsx';
import AdminSorteos from '@/components/admin/AdminSorteos.jsx';
import AdminAdWallet from '@/components/admin/AdminAdWallet.jsx';

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState('estadisticas');
  const [comercio, setComercio] = useState(null);
  const [loadingComercio, setLoadingComercio] = useState(true);

  useEffect(() => {
    const sessionRaw = localStorage.getItem('comercio_session') || localStorage.getItem('comercio_admin');
    if (!sessionRaw) {
      window.location.href = '/';
      return;
    }

    try {
      const session = JSON.parse(sessionRaw);
      setComercio(session);
    } catch (e) {
      console.error("Error cargando sesión:", e);
    } finally {
      setLoadingComercio(false);
    }
  }, []);

  if (loadingComercio) return null;
  if (!comercio) return <div>Acceso no autorizado</div>;

  if (comercio && !comercio.activo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20">
            <ShieldAlert className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight">Cuenta en Revisión</h2>
          <p className="text-neutral-400">
            Tu tienda <span className="text-white font-bold">{comercio.nombre_comercio || comercio.nombre_tienda}</span> está esperando la aprobación.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="border-neutral-800 text-neutral-400 hover:text-white">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter uppercase italic">
                {comercio.nombre_tienda || comercio.nombre_comercio || 'Admin Panel'}
              </h1>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 font-bold text-[10px] uppercase">
                Activa
              </Badge>
            </div>
          </div>
          <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => {
            localStorage.removeItem('comercio_session');
            localStorage.removeItem('comercio_admin');
            window.location.href = '/';
          }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-8 bg-white border h-auto p-1 shadow-sm overflow-x-auto">
            <TabsTrigger value="estadisticas" className="flex items-center gap-2 py-3"><BarChart3 className="w-4 h-4" />Stat</TabsTrigger>
            <TabsTrigger value="productos" className="flex items-center gap-2 py-3"><Plus className="w-4 h-4" />Prod</TabsTrigger>
            <TabsTrigger value="ordenes" className="flex items-center gap-2 py-3"><ShoppingBag className="w-4 h-4" />Ventas</TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 py-3"><Users className="w-4 h-4" />Leads</TabsTrigger>
            <TabsTrigger value="conversaciones" className="flex items-center gap-2 py-3"><Zap className="w-4 h-4" />Chat</TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 py-3"><Settings className="w-4 h-4" />Config</TabsTrigger>
            <TabsTrigger value="sorteos" className="flex items-center gap-2 py-3"><Trophy className="w-4 h-4" />Sorteos</TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2 py-3"><Wallet className="w-4 h-4 text-purple-600" />Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas"><AdminEstadisticas comercio={comercio} /></TabsContent>
          <TabsContent value="productos"><AdminProductos comercio={comercio} /></TabsContent>
          <TabsContent value="ordenes"><AdminOrdenes comercio={comercio} /></TabsContent>
          <TabsContent value="leads"><AdminLeads comercio={comercio} /></TabsContent>
          <TabsContent value="conversaciones"><AdminConversaciones comercio={comercio} /></TabsContent>
          <TabsContent value="config"><AdminConfiguracion comercio={comercio} /></TabsContent>
          <TabsContent value="sorteos"><AdminSorteos comercio={comercio} /></TabsContent>
          <TabsContent value="ads"><AdminAdWallet comercio={comercio} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
