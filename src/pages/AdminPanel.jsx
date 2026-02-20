import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Check } from 'lucide-react';

// Importación de sub-componentes administrativos
import AdminProductos from '@/components/admin/AdminProductos.jsx';
import AdminOrdenes from '@/components/admin/AdminOrdenes.jsx';
import AdminLeads from '@/components/admin/AdminLeads.jsx';
import AdminEstadisticas from '@/components/admin/AdminEstadisticas.jsx';
import AdminConfiguracion from '@/components/admin/AdminConfiguracion.jsx';
import AdminConversaciones from '@/components/admin/AdminConversaciones.jsx';
import AdminSorteos from '@/components/admin/AdminSorteos.jsx';


export default function AdminPanel() {
  const { commerce, isCommerceAuthenticated, isLoadingCommerce, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState('estadisticas');
  const [copied, setCopied] = useState(false);

  const urlTienda = commerce?.slug
    ? `${window.location.origin}/tienda?slug=${commerce.slug}`
    : null;

  const copyUrl = () => {
    if (!urlTienda) return;
    navigator.clipboard.writeText(urlTienda);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Protection Check
  useEffect(() => {
    if (!isLoadingCommerce && !isCommerceAuthenticated) {
      window.location.href = '/';
    }
  }, [isLoadingCommerce, isCommerceAuthenticated]);

  if (isLoadingCommerce) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Double check to prevent flash of content
  if (!commerce) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              {commerce.logo ? (
                <img src={commerce.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-white font-bold">{commerce.nombre?.[0] || 'A'}</span>
              )}
            </div>
            <div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase italic">
                  {commerce.nombre || 'Admin Panel'}
                </h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 font-bold text-[10px] uppercase">
                  {commerce.estado_registro || 'Activo'}
                </Badge>
              </div>
            </div>
          </div>

          <Button variant="ghost" className="text-red-600 hover:text-red-700 font-bold" onClick={logout}>
            Salir
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-8 bg-white border h-auto p-1 shadow-sm overflow-x-auto">
            <TabsTrigger value="estadisticas" className="flex items-center gap-2 py-3">Estadísticas</TabsTrigger>
            <TabsTrigger value="productos" className="flex items-center gap-2 py-3">Productos</TabsTrigger>
            <TabsTrigger value="ordenes" className="flex items-center gap-2 py-3">Ventas</TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 py-3">Clientes</TabsTrigger>
            <TabsTrigger value="conversaciones" className="flex items-center gap-2 py-3">Chat</TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 py-3">Configuración</TabsTrigger>
            <TabsTrigger value="sorteos" className="flex items-center gap-2 py-3">Sorteos</TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas"><AdminEstadisticas comercio={commerce} /></TabsContent>
          <TabsContent value="productos"><AdminProductos comercio={commerce} /></TabsContent>
          <TabsContent value="ordenes"><AdminOrdenes comercio={commerce} /></TabsContent>
          <TabsContent value="leads"><AdminLeads comercio={commerce} /></TabsContent>
          <TabsContent value="conversaciones"><AdminConversaciones comercio={commerce} /></TabsContent>
          <TabsContent value="config"><AdminConfiguracion comercio={commerce} /></TabsContent>
          <TabsContent value="sorteos"><AdminSorteos comercio={commerce} /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
}