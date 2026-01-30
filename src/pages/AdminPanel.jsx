import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext'; // Hook de Autenticación
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
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importación de sub-componentes administrativos
import AdminProductos from '@/components/admin/AdminProductos.jsx';
import AdminOrdenes from '@/components/admin/AdminOrdenes.jsx';
import AdminLeads from '@/components/admin/AdminLeads.jsx';
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.jsx';
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.jsx';
import AdminConversaciones from '@/components/admin/AdminConversaciones.jsx';
import AdminSorteos from '@/components/admin/AdminSorteos.jsx';
import AdminAdWallet from '@/components/admin/AdminAdWallet.jsx';

export default function AdminPanel() {
  const { user, isLoadingAuth, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState('estadisticas');
  const [comercio, setComercio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommerceData() {
      // Si no hay usuario (y ya terminó de cargar auth), no hacemos nada (el render redirige)
      if (!user) return;

      try {
        // Consultamos la DATA FRESCA a la base de datos usando el código del usuario autenticado
        const commerceCode = user.commerceCode || user.user_metadata?.commerce_code;

        if (commerceCode) {
          const response = await base44.functions.invoke('obtenerDatosComercio', {
            commerce_code: commerceCode
          });

          if (response.data && response.data.comercio) {
            setComercio(response.data.comercio);
          } else {
            // Fallback: Usamos los metadatos que ya tiene el usuario
            setComercio(user.user_metadata || {});
          }
        }
      } catch (e) {
        console.error("Error cargando datos frescos:", e);
      } finally {
        setLoading(false);
      }
    }

    if (!isLoadingAuth) {
      if (!user) {
        window.location.href = '/'; // Redirección si no hay sesión
      } else {
        loadCommerceData();
      }
    }
  }, [user, isLoadingAuth]);

  if (isLoadingAuth || loading) return null;
  if (!comercio) return <div>Acceso no autorizado</div>;

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 hover:bg-transparent font-black text-xl tracking-tighter uppercase italic flex items-center gap-2 text-neutral-900">
                    {comercio.nombre_tienda || comercio.nombre_comercio || 'Admin Panel'}
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-2">
                  <DropdownMenuLabel className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Cambiar Vista</DropdownMenuLabel>

                  <DropdownMenuItem className="p-3 mb-1 bg-orange-50 focus:bg-orange-100 cursor-default rounded-md border border-orange-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-orange-900">Admin Panel</span>
                      <span className="text-xs text-orange-700">Gestión Operativa (Actual)</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 cursor-pointer focus:bg-neutral-100 rounded-md" onClick={() => window.location.href = '/merchant'}>
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-700">Merchant Dashboard</span>
                      <span className="text-xs text-neutral-500">Visión Estratégica</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 hover:bg-green-100 font-bold text-[10px] uppercase">
                Activa
              </Badge>
            </div>
          </div>

          <Button variant="ghost" className="text-red-600 hover:text-red-700 font-bold" onClick={() => {
            localStorage.removeItem('comercio_session');
            localStorage.removeItem('comercio_admin');
            logout();
          }}>
            <LogOut className="w-4 h-4 mr-2" /> Salir
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

