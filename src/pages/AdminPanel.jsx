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

// Importación de sub-componentes administrativos
import AdminProductos from '@/components/admin/AdminProductos.jsx';
import AdminOrdenes from '@/components/admin/AdminOrdenes.jsx';
import AdminLeads from '@/components/admin/AdminLeads.jsx';
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.jsx';
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.jsx';
import AdminConversaciones from '../components/admin/AdminConversaciones';

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState('estadisticas');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // LEY DE MEMORIA: Verificación estricta de rol Admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await base44.auth.me();

        if (!currentUser || currentUser.role !== 'admin') {
          // Si no es admin, fuera.
          alert('Acceso denegado: No tenés permisos de administrador para la tienda de parrillas.');
          window.location.href = '/';
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

    checkAdminAccess();
  }, []);

  // LEY DE MEMORIA: Obtención de datos del comercio (incluye % de descuento transferencia en config)
  const { data: comercio, isLoading: loadingComercio, error } = useQuery({
    queryKey: ['comercio-admin'],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerDatosComercio', {});
      if (!response.data || !response.data.comercio) {
        throw new Error('No se pudo obtener la información del comercio.');
      }
      return response.data.comercio;
    },
    enabled: !!user,
    retry: 0, // No reintentar si es 404, queremos fallar rápido para redirigir
    staleTime: 0 // Siempre fresco para detectar si se acaba de registrar
  });

  useEffect(() => {
    // LEY DE TORTUGA: Manejo de errores de inicialización de comercio
    if (error) {
      const errorMsg = error.message || '';
      const isNotFound = errorMsg.includes('404') ||
        errorMsg.includes('Comercio no inicializado') ||
        errorMsg.includes('COMMERCE_NOT_FOUND');

      if (isNotFound) {
        console.warn('Comercio no encontrado, redirigiendo a registro...');
        window.location.href = '/registro';
      }
    }
  }, [error]);

  // Pantalla de carga unificada
  if (checkingAuth || (user && loadingComercio)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600 font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  // Manejo de errores de conexión o datos
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error en el Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full"
            >
              Reintentar Conexión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no hay comercio configurado (tienda vacía)
  if (!comercio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tienda de Parrillas no configurada</h2>
          <p className="text-gray-600">Contactá al soporte técnico de Base 44 para activar tu comercio.</p>
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
              {comercio.nombre} | Gestión de Ventas
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
            {/* Aquí es donde se gestionará la Ley de Stock y Precios Estándar */}
            <AdminProductos comercio={comercio} />
          </TabsContent>

          <TabsContent value="ordenes" className="mt-0 focus-visible:ring-0">
            <AdminOrdenes comercio={comercio} />
          </TabsContent>

          <TabsContent value="leads" className="mt-0 focus-visible:ring-0">
            <AdminLeads comercio={comercio} />
          </TabsContent>

          <TabsContent value="conversaciones" className="mt-0 focus-visible:ring-0">
            {/* LEY DE MEMORIA: Aquí actúa el experto vendedor de WhatsApp */}
            <AdminConversaciones comercio={comercio} />
          </TabsContent>

          <TabsContent value="config" className="mt-0 focus-visible:ring-0">
            {/* LEY DE MEMORIA: Aquí se configura el % de descuento para transferencia */}
            <AdminConfiguracion comercio={comercio} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
