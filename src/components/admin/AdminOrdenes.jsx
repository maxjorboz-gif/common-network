import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { commerceClient } from '@/api/commerceApiClient';
import { Package, CheckCircle, Truck, Eye, Clock, XCircle, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function AdminOrdenes({ comercio }) {
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ordenes = [], isLoading } = useQuery({
    queryKey: ['ordenes-admin', comercio.commerce_code || comercio.id_comercio],
    queryFn: async () => {
      queryFn: async () => {
        const response = await commerceClient.post('obtenerOrdenes', {
          commerce_code: comercio.commerce_code, // Use code
          id_comercio: comercio.id_comercio // Legacy fallback
        });
        return response.ordenes;
      }
    }
  });

  const handleConfirmarPagoManual = async (orden) => {
    try {
      toast.loading('Confirmando pago...');

      const response = await commerceClient.post('confirmarPago', {
        ordenId: orden.id
      });

      if (response.success) {
        queryClient.invalidateQueries(['ordenes-admin']);
        queryClient.invalidateQueries(['estadisticas-admin']);
        toast.dismiss();
        toast.success('✅ Pago confirmado y Purchase enviado a Meta vía CAPI');
      }
    } catch (err) {
      console.error('Error confirmando pago manual:', err);
      toast.dismiss();
      toast.error('Error al confirmar el pago');
    }
  };

  const handleChangeEstado = async (ordenId, nuevoEstado) => {
    try {
      await commerceClient.post('cambiarEstadoOrden', {
        ordenId,
        nuevoEstado
      });
      queryClient.invalidateQueries(['ordenes-admin']);
      toast.success('Estado actualizado');
    } catch (err) {
      console.error('Error actualizando estado:', err);
      toast.error('Error al actualizar estado');
    }
  };

  const handleViewDetails = (orden) => {
    setSelectedOrden(orden);
    setDialogOpen(true);
  };

  const getEstadoBadge = (estadoRaw) => {
    const estado = estadoRaw?.toUpperCase() || 'PAGO_PENDIENTE';

    const estados = {
      'PAGO_PENDIENTE': { label: 'Pendiente pago', color: 'bg-yellow-100 text-yellow-800' },
      'PENDIENTE_PAGO': { label: 'Pendiente pago', color: 'bg-yellow-100 text-yellow-800' },
      'PAGADA': { label: 'Pagada', color: 'bg-blue-100 text-blue-800' },
      'PAGO_CONFIRMADO': { label: 'Pago confirmado', color: 'bg-blue-100 text-blue-800' },
      'EN_PREPARACION': { label: 'En preparación', color: 'bg-purple-100 text-purple-800' },
      'ENVIADA': { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
      'ENTREGADA': { label: 'Entregado', color: 'bg-green-100 text-green-800' },
      'CANCELADA': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };

    const { label, color } = estados[estado] || estados['PAGO_PENDIENTE'];
    return <Badge className={color}>{label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando órdenes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{ordenes.length}</span> órdenes
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="space-y-4">
        {(Array.isArray(ordenes) ? ordenes : []).map(orden => (
          <Card key={orden.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Info básica */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{orden.numero_orden}</h3>
                    {getEstadoBadge(orden.estado)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cliente:</span> {orden.cliente?.nombre || orden.datos_envio?.nombre || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ${(orden.total || orden.total_final || 0).toLocaleString('es-AR')}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>{' '}
                      {orden.created_date ? format(new Date(orden.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                    </div>
                    <div>
                      <span className="font-medium">Método:</span>{' '}
                      {orden.metodo_pago === 'transferencia' ? 'Transferencia' : orden.metodo_pago}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 md:w-64">
                  {(orden.estado === 'PAGO_PENDIENTE' || orden.estado === 'pendiente_pago') && (
                    <Button
                      size="sm"
                      onClick={() => handleConfirmarPagoManual(orden)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Confirmar Pago Manual
                    </Button>
                  )}

                  <Select
                    value={orden.estado?.toUpperCase()}
                    onValueChange={(value) => handleChangeEstado(orden.id, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAGO_PENDIENTE">Pendiente pago</SelectItem>
                      <SelectItem value="PAGADA">Pagada (Confirmado)</SelectItem>
                      <SelectItem value="EN_PREPARACION">En preparación</SelectItem>
                      <SelectItem value="ENVIADA">Enviada</SelectItem>
                      <SelectItem value="ENTREGADA">Entregada</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(orden)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {ordenes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No hay órdenes todavía</p>
          </div>
        )}
      </div>

      {/* Dialog de detalles */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Orden {selectedOrden?.numero_orden}
            </DialogTitle>
          </DialogHeader>

          {selectedOrden && (
            <div className="space-y-6 mt-4">
              {/* Estado */}
              <div>
                <h4 className="font-semibold mb-2">Estado actual</h4>
                {getEstadoBadge(selectedOrden.estado)}
              </div>

              {/* Datos de envío */}
              <div>
                <h4 className="font-semibold mb-2">Datos de envío</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                  {/* Fallback a datos_envio legacy o logistica nueva */}
                  <p><span className="font-medium">Calle:</span> {selectedOrden.envio?.calle || selectedOrden.datos_envio?.calle}</p>
                  <p><span className="font-medium">Ciudad:</span> {selectedOrden.envio?.ciudad || selectedOrden.datos_envio?.ciudad}</p>
                  <p><span className="font-medium">CP:</span> {selectedOrden.envio?.cp || selectedOrden.datos_envio?.cp}</p>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-3">
                  {selectedOrden.items?.map((item, index) => (
                    <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.titulo}</p>
                        <p className="text-sm text-gray-600">
                          {item.cantidad} x ${item.precio_unitario?.toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div>
                <h4 className="font-semibold mb-2">Resumen</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedOrden.total?.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
