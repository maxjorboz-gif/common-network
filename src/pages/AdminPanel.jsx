import React, { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import AdminProductos from "@/components/admin/AdminProductos";
import AdminOrdenes from "@/components/admin/AdminOrdenes";
import AdminLeads from "@/components/admin/AdminLeads";
import AdminEstadisticas from "@/components/admin/AdminEstadisticas";
import AdminConfiguracion from "@/components/admin/AdminConfiguracion";
import AdminConversaciones from "@/components/admin/AdminConversaciones";

export default function AdminPanel() {
  const [comercio, setComercio] = useState(null);
  const [tab, setTab] = useState("estadisticas");

  useEffect(() => {
    const raw = localStorage.getItem("comercio_session");
    if (!raw) {
      window.location.href = "/";
      return;
    }

    try {
      setComercio(JSON.parse(raw));
    } catch {
      localStorage.removeItem("comercio_session");
      window.location.href = "/";
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("comercio_session");
    window.location.href = "/";
  };

  if (!comercio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-orange-600 font-medium">
              {comercio.nombre_comercio}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="estadisticas">
              <TrendingUp className="w-4 h-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="productos">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="ordenes">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Órdenes
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="w-4 h-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="chats">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Config
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

          <TabsContent value="chats">
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