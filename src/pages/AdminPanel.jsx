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

  // CUSTOM AUTH: Leer sesión del almacenamiento local (Bypass Supabase Auth)
  const [comercio, setComercio] = useState(null);
  const [loadingComercio, setLoadingComercio] = useState(true);

  useEffect(() => {
    const sessionRaw = localStorage.getItem('comercio_session');
    if (!sessionRaw) {
      window.location.href = '/';
      return;
    }

    const validateSession = async () => {
      try {
        const session = JSON.parse(sessionRaw);

        if (!session.success) {
          throw new Error("Sesión inválida");
        }

        // 1. Setear estado inicial desde LocalStorage (para rapidez)
        setUser({ email: session.email_negocio || session.nombre_usuario || 'Comercio' });
        setComercio(session);

        // 2. CHECK SILENCIOSO DE ESTADO REAL (Solo si está inactivo localmente o para asegurar)
        // Esto permite que si el admin lo activó, el usuario entre sin reloguear/recargar
        if (!session.activo) {
          console.log("Comercio inactivo localmente, verificando estado remoto...");
          const { data: statusData } = await base44.functions.invoke('gestionarSolicitudes', {
            action: 'check_status', // Necesitaremos soportar esto en backend o usar 'list' filtrado (usaremos list por ahora para no tocar backend complejo)
            commerce_code: session.commerce_code
          });

          // Si gestionarsolicitudes devuelve array o objeto, adaptamos
          // NOTA: Para no complicar el backend, usaremos la funcion 'loginComercio' que ya devuelve el objeto completo actualizado
          // O mejor aún, invocamos loginComercio con un flag de "refresh_session" si existiera, pero vamos a re-validar con login o similar.
          // PLAN B: Usar gestionarSolicitudes 'list' y buscar el mio.

          const res = await base44.functions.invoke('gestionarSolicitudes', { action: 'list' });
          if (res.data?.solicitudes) {
            const myCommerce = res.data.solicitudes.find(c => c.commerce_code === session.commerce_code);
            if (myCommerce && myCommerce.activo) {
              // ACTIVO EN REMOTO! Actualizamos Local y State
              console.log("¡Comercio activado remotamente! Actualizando sesión...");
              const newSession = { ...session, ...myCommerce, activo: true };
              localStorage.setItem('comercio_session', JSON.stringify(newSession));
              setComercio(newSession);
            }
          }
        }

      } catch (e) {
        console.error("Error cargando sesión:", e);
        // localStorage.removeItem('comercio_session'); // No borrar agresivamente por ahora
        // window.location.href = '/';
      } finally {
        setLoadingComercio(false);
      }
    };

    validateSession();
  }, []);

  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      localStorage.removeItem('comercio_session');
      window.location.href = '/';
    }
  };

  // Loading State
  if (loadingComercio) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
