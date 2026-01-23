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
import SuperAdminSolicitudes from '@/components/admin/SuperAdminSolicitudes';
import { ShieldAlert } from 'lucide-react';

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState(''); // Empezar vacío para decidir según rol
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isSupremo = user?.role === 'admin';

  // LEY DE MEMORIA: Verificación estricta de rol Admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await base44.auth.me();

        if (!currentUser) {
          // Si no está logueado, al login.
          base44.auth.redirectToLogin(window.location.href);
          return;
        }


        setUser(currentUser);
        // LEY DE MEMORIA: Si es supremo, el tab por defecto es solicitudes
        if (currentUser.role === 'admin') {
          setSelectedTab('solicitudes');
        } else {
          setSelectedTab('estadisticas');
        }
      } catch (err) {
        console.error('Error de autenticación:', err);
        base44.auth.redirectToLogin(window.location.href);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, []);

  // Si es Supremo, por defecto mostrar solicitudes
  // Eliminamos el anterior useEffect que duplicaba lógica

  // LEY DE MEMORIA: Obtención de datos del comercio (incluye % de descuento transferencia en config)
  // SOLO se ejecuta si el usuario NO es supremo
  const { data: comercio, isLoading: loadingComercio, error } = useQuery({
    queryKey: ['comercio-admin'],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerDatosComercio', {});
      if (!response.data || !response.data.comercio) {
        throw new Error('No se pudo obtener la información del comercio.');
      }
      return response.data.comercio;
    },
    enabled: !!user, // Cargar siempre si hay usuario (incluso si es supremo, para que pueda gestionar SU tienda)
    retry: 0,
    staleTime: 0
  });

  // Verificar si tiene solicitud pendiente (solo si no es supremo y no tiene comercio)
  const { data: solicitudPendiente, isLoading: loadingSolicitud } = useQuery({
    queryKey: ['solicitud-pendiente'],
    queryFn: async () => {
      const response = await base44.functions.invoke('verificarSolicitudPendiente', {});
      return response.data;
    },
    enabled: !!user && !isSupremo && !comercio && !loadingComercio,
    retry: 0
  });

  // ELIMINADO: El redirect automático impedía mostrar la pantalla "Cuenta en Revisión"
  // Ahora dejamos que el render maneje los diferentes estados

  // Pantalla de carga unificada
  if (checkingAuth || (user && !isSupremo && loadingComercio)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600 font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  // Manejo de errores de conexión o datos
  if (error && !isSupremo) {
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

  // Si no hay comercio configurado - Verificar si tiene solicitud pendiente
  if (!comercio && !isSupremo) {
    // Caso 1: Tiene solicitud pendiente (esperando aprobación)
    if (solicitudPendiente?.tiene_solicitud) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 text-white">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20">
              <ShieldAlert className="w-10 h-10 text-orange-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight">Cuenta en Revisión</h2>
            <p className="text-neutral-400">
              Tu tienda <span className="text-white font-bold">{solicitudPendiente.solicitud.nombre_comercio}</span> está esperando la aprobación del administrador.
              <br /><br />
              Una vez validado tu pago (Operación #{solicitudPendiente.solicitud.numero_operacion}), recibirás acceso total a este panel en las próximas <span className="text-orange-500 font-bold">24 horas</span>.
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

    // Caso 2: No tiene solicitud ni comercio (nunca se registró)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center flex flex-col items-center gap-4">
              <Package className="w-16 h-16 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">Registrá tu Comercio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Para acceder al panel de administración, primero necesitás registrar tu comercio.
            </p>
            <Button
              onClick={() => window.location.href = '/registro'}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full font-bold"
            >
              Ir a Registro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el comercio existe pero no está activo (bloqueado o pendiente de pago)
  if (comercio && !comercio.activo && !isSupremo) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{isSupremo ? "Panel Supremo" : "Panel de Administración"}</h1>
            <p className="text-orange-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
              {isSupremo ? "Common Network" : (comercio?.nombre_comercio || "Mi Tienda")} | Gestión de Ventas
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
            Admin: <span className="font-semibold text-gray-700">{user?.email}</span>
          </div>
        </div>

        {/* Sistema de Navegación por Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className={`grid ${isSupremo ? 'grid-cols-4 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-6'} mb-8 bg-white border h-auto p-1 shadow-sm`}>
            {isSupremo && (
              <TabsTrigger value="solicitudes" className="flex items-center gap-2 py-3">
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">Solicitudes</span>
              </TabsTrigger>
            )}
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
          {isSupremo && (
            <TabsContent value="solicitudes" className="mt-0 focus-visible:ring-0">
              <SuperAdminSolicitudes />
            </TabsContent>
          )}

          {/* LEY DE MEMORIA: Renderizamos tabs de tienda si hay comercio (sea admin o no) */}
          {comercio && (
            <>
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
            </>
          )}

          {/* Fallback para el Supremo si por alguna razón hace clic en Tabs de tienda sin tener una */}
          {isSupremo && !comercio && selectedTab !== 'solicitudes' && (
            <div className="py-20 text-center bg-white border rounded-2xl">
              <ShieldAlert className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-black italic uppercase">Modo Administrador de Red</h3>
              <p className="text-neutral-500">Como Administrador Supremo, gestionas la red desde la pestaña <span className="text-orange-600 font-bold">Solicitudes</span>.</p>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
