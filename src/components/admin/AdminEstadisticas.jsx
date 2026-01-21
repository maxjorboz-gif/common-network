import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, Users, AlertTriangle, Package, Eye, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export default function AdminEstadisticas({ comercio }) {
  const queryClient = useQueryClient();
  const [nuevoGasto, setNuevoGasto] = useState({ fecha: '', monto: '' });

  // Obtener todas las estadísticas desde el backend
  const { data: stats, isLoading } = useQuery({
    queryKey: ['estadisticas-admin', comercio.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerEstadisticas', {
        id_comercio: comercio.id
      });
      return response.data;
    }
  });

  const estadisticas = stats?.estadisticas || {};
  const gastos = stats?.gastos || [];

  const handleAgregarGasto = async () => {
    if (!nuevoGasto.fecha || !nuevoGasto.monto) {
      toast.error('Completá todos los campos');
      return;
    }

    try {
      await base44.functions.invoke('registrarGastoPublicitario', {
        id_comercio: comercio.id,
        fecha: nuevoGasto.fecha,
        monto: nuevoGasto.monto
      });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-admin'] });
      setNuevoGasto({ fecha: '', monto: '' });
      toast.success('Gasto registrado');
    } catch (err) {
      toast.error('Error registrando gasto');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ventas</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(estadisticas.totalVentas || 0).toLocaleString('es-AR')}</div>
            <p className="text-xs text-gray-500 mt-1">{estadisticas.totalOrdenes || 0} órdenes</p>
          </CardContent>
        </Card>

        <Card className={(estadisticas.roas || 0) >= 3 ? 'border-green-300 bg-green-50' : (estadisticas.roas || 0) >= 2 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ROAS</CardTitle>
            <TrendingUp className={`w-5 h-5 ${(estadisticas.roas || 0) >= 3 ? 'text-green-600' : (estadisticas.roas || 0) >= 2 ? 'text-yellow-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(estadisticas.roas || 0) >= 3 ? 'text-green-700' : (estadisticas.roas || 0) >= 2 ? 'text-yellow-700' : 'text-red-700'}`}>
              {estadisticas.roas || 0}x
            </div>
            <p className="text-xs text-gray-500 mt-1">Retorno de inversión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gasto Ads</CardTitle>
            <DollarSign className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${(estadisticas.totalGastoAds || 0).toLocaleString('es-AR')}</div>
            <p className="text-xs text-gray-500 mt-1">Meta Ads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tráfico Hoy</CardTitle>
            <Eye className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.traficoHoy || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Visitas PageView</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
            <Users className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.clientesUnicos || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Únicos compradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Control de Inversión Publicitaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Control de Inversión Publicitaria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={nuevoGasto.fecha}
                onChange={(e) => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="monto">Monto (ARS)</Label>
              <Input
                id="monto"
                type="number"
                placeholder="10000"
                value={nuevoGasto.monto}
                onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAgregarGasto} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Registrar Gasto
              </Button>
            </div>
          </div>

          {gastos.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Plataforma</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto) => (
                    <tr key={gasto.id} className="border-t">
                      <td className="px-4 py-2">{new Date(gasto.fecha).toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-2">Meta Ads</td>
                      <td className="px-4 py-2 text-right font-semibold">${gasto.monto.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="px-4 py-2" colSpan="2">Total Invertido</td>
                    <td className="px-4 py-2 text-right text-red-600">${(estadisticas.totalGastoAds || 0).toLocaleString('es-AR')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Interpretación ROAS:</strong> Un ROAS de 3x significa que por cada $1 invertido, recuperaste $3 en ventas.
              {(estadisticas.roas || 0) >= 3 && ' ✅ Excelente retorno'}
              {(estadisticas.roas || 0) >= 2 && (estadisticas.roas || 0) < 3 && ' ⚠️ Aceptable, pero podés mejorar'}
              {(estadisticas.roas || 0) < 2 && (estadisticas.roas || 0) > 0 && ' ❌ Estás perdiendo plata'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {((estadisticas.productosStockBajo || 0) > 0 || (estadisticas.productosSinStock || 0) > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(estadisticas.productosStockBajo || 0) > 0 && (
              <p className="text-sm text-orange-600">
                <span className="font-semibold">{estadisticas.productosStockBajo}</span> productos con stock bajo
              </p>
            )}
            {(estadisticas.productosSinStock || 0) > 0 && (
              <p className="text-sm text-red-600">
                <span className="font-semibold">{estadisticas.productosSinStock}</span> productos sin stock
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado de órdenes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pendientes de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{estadisticas.ordenesPendientes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{estadisticas.ordenesEnProceso || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entregadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{estadisticas.ordenesEntregadas || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top productos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Productos más vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(estadisticas.topProductos || []).map((prod, index) => (
              <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{prod.titulo}</p>
                  <p className="text-sm text-gray-500">{prod.cantidad} unidades vendidas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${prod.revenue.toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
