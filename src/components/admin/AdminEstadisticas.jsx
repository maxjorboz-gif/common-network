import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, Users, AlertTriangle, Package, Eye, PlusCircle, CreditCard, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export default function AdminEstadisticas({ comercio }) {
  const queryClient = useQueryClient();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditForm, setCreditForm] = useState({ monto: '', transactionId: '', consumptionPref: '' });
  const requestMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.functions.invoke('solicitarCreditoPublicitario', {
        commerce_code: comercio.commerce_code,
        monto: data.monto,
        transaction_id: data.transactionId,
        consumo_preferencia: data.consumptionPref
      });
    },
    onSuccess: () => {
      toast.success('Solicitud enviada correctamente');
      setShowCreditModal(false);
      setCreditForm({ monto: '', transactionId: '', consumptionPref: '' });
    },
    onError: () => toast.error('Error al enviar solicitud')
  });

  // Obtener todas las estadísticas desde el backend
  const { data: stats, isLoading } = useQuery({
    queryKey: ['estadisticas-admin', comercio.commerce_code || comercio.id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerEstadisticas', {
        commerce_code: comercio.commerce_code,
        id_comercio: comercio.id_comercio // Legacy fallback
      });
      return response.data;
    }
  });

  const estadisticas = stats?.estadisticas || {};
  const gastos = stats?.gastos || [];

  const handleSolicitarCredito = () => {
    if (!creditForm.monto || !creditForm.transactionId || !creditForm.consumptionPref) {
      toast.error('Completá todos los campos');
      return;
    }
    requestMutation.mutate(creditForm);
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
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-2">

            {/* Display Total Invertido */}
            <div className="flex-1 bg-neutral-900 text-white p-6 rounded-2xl shadow-xl w-full md:w-auto relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp size={80} />
              </div>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Total Invertido</p>
              <div className="text-4xl font-black italic tracking-tighter">
                ${(estadisticas.totalGastoAds || 0).toLocaleString('es-AR')}
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 font-mono">Base Inicial + Créditos Aprobados</p>
            </div>

            {/* Action Button */}
            <div className="flex-1 w-full md:w-auto">
              <Button
                onClick={() => setShowCreditModal(true)}
                className="w-full h-20 text-lg font-black italic uppercase bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/20 rounded-2xl"
              >
                <PlusCircle className="w-6 h-6 mr-3" />
                Solicitar Créditos Publicitarios
              </Button>
              <p className="text-center text-xs text-neutral-500 mt-3 max-w-xs mx-auto">
                Cargá saldo para aumentar la visibilidad de tu tienda en nuestra red de socios.
              </p>
            </div>
          </div>

          {/* Modal de Solicitud */}
          {showCreditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b flex justify-between items-center bg-neutral-50">
                  <h3 className="text-lg font-black italic uppercase text-neutral-900 flex items-center gap-2">
                    <CreditCard className="text-orange-600 w-5 h-5" /> Cargar Crédito
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowCreditModal(false)} className="rounded-full hover:bg-neutral-200">
                    <X className="w-5 h-5 text-neutral-500" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  {/* CBU Info */}
                  <div className="bg-neutral-100 p-4 rounded-xl border border-dashed border-neutral-300">
                    <p className="text-[10px] font-bold uppercase text-neutral-500 mb-2 tracking-widest">Datos de Transferencia</p>
                    <div className="space-y-1 text-xs font-mono text-neutral-700">
                      <div className="flex justify-between"><span>CBU:</span> <span className="font-bold">0000003100000000000000</span></div>
                      <div className="flex justify-between"><span>Alias:</span> <span className="font-bold text-orange-600">red.common.network</span></div>
                      <div className="flex justify-between"><span>Titular:</span> <span className="font-bold">COMMON NETWORK S.A.</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="monto_credito" className="text-xs font-bold uppercase text-neutral-500">Monto a Cargar (ARS)</Label>
                      <Input
                        id="monto_credito"
                        type="number"
                        placeholder="Ej: 50000"
                        className="h-12 text-lg font-bold"
                        value={creditForm.monto}
                        onChange={(e) => setCreditForm({ ...creditForm, monto: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="comprobante" className="text-xs font-bold uppercase text-neutral-500">N° Comprobante / ID Tx</Label>
                      <Input
                        id="comprobante"
                        placeholder="Ej: 123456789"
                        className="h-12 font-mono"
                        value={creditForm.transactionId}
                        onChange={(e) => setCreditForm({ ...creditForm, transactionId: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="consumo" className="text-xs font-bold uppercase text-neutral-500">Preferencia de Consumo</Label>
                      <Input
                        id="consumo"
                        placeholder="Ej: $2000 por día / Lo más rápido posible"
                        className="h-12"
                        value={creditForm.consumptionPref}
                        onChange={(e) => setCreditForm({ ...creditForm, consumptionPref: e.target.value })}
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Indicanos cómo querés distribuir tu presupuesto.</p>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase text-lg rounded-xl shadow-lg shadow-orange-600/20"
                    onClick={handleSolicitarCredito}
                    disabled={requestMutation.isPending}
                  >
                    {requestMutation.isPending ? 'Enviando...' : 'Confirmar Pago'}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
