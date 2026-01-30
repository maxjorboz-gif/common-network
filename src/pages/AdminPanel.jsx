import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Package,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminProductos from "@/components/admin/AdminProductos.jsx";
import AdminOrdenes from "@/components/admin/AdminOrdenes.jsx";
import AdminLeads from "@/components/admin/AdminLeads.jsx";
import AdminEstadisticas from "@/components/admin/AdminEstadisticas.jsx";
import AdminConfiguracion from "@/components/admin/AdminConfiguracion.jsx";
import AdminConversaciones from "@/components/admin/AdminConversaciones.jsx";
import { Button } from "@/components/ui/button";

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("estadisticas");
  const [comercio, setComercio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComercio() {
      try {
        const sessionRaw = localStorage.getItem("comercio_session");

        if (!sessionRaw) {
          window.location.href = "/";
          return;
        }

        const session = JSON.parse(sessionRaw);

        // Backend debe validar y devolver un comercio real
        const { data, error } = await base44.functions.invoke("loginComercio", {
          session_token: session.session_token,
        });

        if (error || !data?.comercio) {
          window.location.href = "/";
          return;
        }

        setComercio(data.comercio);
      } catch (e) {
        console.error("Error cargando comercio:", e);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    }

    fetchComercio();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("comercio_session");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando panel...</p>
      </div>
    );
  }

  if (!comercio?.activo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="w-12 h-12 text-orange-600 mb-4" />
        <h2 className="text-2xl font-bold">Cuenta en Revisión</h2>
        <p className="mt-2 text-gray-600">
          Tu comercio está en revisión o inactivo. Contactá soporte.
        </p>
        <Button onClick={handleLogout} variant="outline">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <Button variant="destructive" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 gap-2">
            <TabsTrigger value="estadisticas">
              <TrendingUp className="w-4 h-4" /> Estadísticas
            </TabsTrigger>
            <TabsTrigger value="productos">
              <Package className="w-4 h-4" /> Productos
            </TabsTrigger>
            <TabsTrigger value="ordenes">
              <ShoppingBag class="w-4 h-4" /> Órdenes
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="w-4 h-4" /> Leads
            </TabsTrigger>
            <TabsTrigger value="conversaciones">
              <MessageCircle className="w-4 h-4" /> Chats
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4" /> Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas">
            <AdminEstadisticas comercio={comercio} />
          </TabsContent>
          <TabsContent value="productos">
            <AdminProductos comercio={comercio} />
          </TabsContent>
          <TabsContent value="ordenes">
            <AdminOrdenes comercio={comercio} />
          </TabsContent>
          <TabsContent value="leads">
            <AdminLeads comercio={comercio} />
          </TabsContent>
          <TabsContent value="conversaciones">
            <AdminConversaciones comercio={comercio} />
          </TabsContent>
          <TabsContent value="config">
            <AdminConfiguracion comercio={comercio} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
