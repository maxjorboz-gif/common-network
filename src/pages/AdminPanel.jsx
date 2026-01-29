import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  TrendingUp, DollarSign, AlertCircle, MessageCircle
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Importación de sub-componentes administrativos (SOLO COMERCIO)
import AdminProductos from '@/components/admin/AdminProductos.jsx';
import AdminOrdenes from '@/components/admin/AdminOrdenes.jsx';
import AdminLeads from '@/components/admin/AdminLeads.jsx';
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.jsx';
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.jsx';
import AdminConversaciones from '../components/admin/AdminConversaciones';
import { ShieldAlert } from 'lucide-react';

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState('estadisticas');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // LEY DE MEMORIA: Verificación básica de sesión
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        setUser(currentUser);
      } catch (err) {
        console.error('Error de autenticación:', err);
        base44.auth.redirectToLogin(window.location.href);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // LEY DE MEMORIA: Obtención de datos del comercio
  const { data: comercio, isLoading: loadingComercio, error } = useQuery({
    queryKey: ['comercio-admin'],
    queryFn: async () => {
      // Backend resolves tenant from Auth Token
      const response = await base44.functions.invoke('obtenerDatosComercio', {});
      return response.data?.comercio || null;
    },
    enabled: !!user,
    retry: 0,
    staleTime: 0
  });

  // Caso: No tiene comercio activo
  if (!comercio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-gray-600">No se encontró un comercio activo asociado a tu cuenta.</p>
          <Button onClick={() => window.location.href = '/'} variant="outline">Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  // Caso 3: Comercio inactivo
  if (comercio && !comercio.activo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20">
            <ShieldAlert className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight">Cuenta en Revisión</h2>
          <p className="text-neutral-400">
            Tu tienda <span className="text-white font-bold">{comercio.nombre_comercio}</span> está esperando la aprobación del administrador supremo.
            <br /><br />
            Una vez validado tu pago (Operación #{comercio.numero_operacion}), recibirás acceso total a este panel.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-neutral-800 text-neutral-400 hover:text-white"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header del Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel de Administración</h1>
            <p className="text-orange-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
              {comercio.nombre_comercio} | Gestión de Ventas
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
            Admin: <span className="font-semibold text-gray-700">{user?.email}</span>
          </div>
        </div>

        {/* Sistema de Navegación por Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8 bg-white border h-auto p-1 shadow-sm">
            <TabsTrigger value="estadisticas" className="flex items-center gap-2 py-3">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger value="productos" className="flex items-center gap-2 py-3">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="ordenes" className="flex items-center gap-2 py-3">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Órdenes</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="conversaciones" className="flex items-center gap-2 py-3">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chats</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Contenidos de los Paneles */}
          <TabsContent value="estadisticas" className="mt-0 focus-visible:ring-0">
            <AdminEstadisticas comercio={comercio} />
          </TabsContent>

          <TabsContent value="productos" className="mt-0 focus-visible:ring-0">
            <AdminProductos comercio={comercio} />
          </TabsContent>

          <TabsContent value="ordenes" className="mt-0 focus-visible:ring-0">
            <AdminOrdenes comercio={comercio} />
          </TabsContent>

          <TabsContent value="leads" className="mt-0 focus-visible:ring-0">
            <AdminLeads comercio={comercio} />
          </TabsContent>

          <TabsContent value="conversaciones" className="mt-0 focus-visible:ring-0">
            <AdminConversaciones comercio={comercio} />
          </TabsContent>

          <TabsContent value="config" className="mt-0 focus-visible:ring-0">
            <AdminConfiguracion comercio={comercio} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
