import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, DollarSign, TrendingDown, Shield, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminConfiguracion({ comercio }) {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['config', comercio.id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerConfiguracion', {
        id_comercio: comercio.id_comercio
      });
      return response.data.config;
    }
  });

  const [formData, setFormData] = useState({
    descuento_base_transferencia: 10,
    precio_minimo_piso_transferencia: 0,
    precio_minimo_piso_tarjeta: 30,
    costo_envio_default: 0,
    envio_gratis_minimo: 0,
    habilitar_envio_gratis_global: false,
    datos_transferencia: {
      banco: '',
      cbu: '',
      alias: '',
      titular: ''
    }
  });

  React.useEffect(() => {
    if (config) {
      setFormData({
        descuento_base_transferencia: config.descuento_base_transferencia || 10,
        precio_minimo_piso_transferencia: config.precio_minimo_piso_transferencia || 0,
        precio_minimo_piso_tarjeta: config.precio_minimo_piso_tarjeta || 30,
        costo_envio_default: config.costo_envio_default || 0,
        envio_gratis_minimo: config.envio_gratis_minimo || 0,
        habilitar_envio_gratis_global: config.habilitar_envio_gratis_global || false,
        datos_transferencia: config.datos_transferencia || {
          banco: '',
          cbu: '',
          alias: '',
          titular: ''
        }
      });
    }
  }, [config]);

  const updateConfig = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('actualizarConfiguracion', {
        id_comercio: comercio.id_comercio,
        configData: data
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('Configuración actualizada');
    }
  });

  const handleSave = () => {
    updateConfig.mutate(formData);
  };

  if (isLoading) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estrategia de Precios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Estrategia de Precios y Descuentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="descuento_base">Descuento Base Transferencia (%)</Label>
            <Input
              id="descuento_base"
              type="number"
              value={formData.descuento_base_transferencia}
              onChange={(e) => setFormData({ ...formData, descuento_base_transferencia: Number(e.target.value) })}
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Descuento inicial que verá el cliente al elegir transferencia
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Pisos de Negociación IA
            </h4>
            <p className="text-sm text-blue-800 mb-4">
              Límites que la IA NO puede superar al negociar descuentos con clientes
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="piso_transferencia" className="text-blue-900">
                  Piso Transferencia
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="piso_transferencia"
                    type="number"
                    value={formData.precio_minimo_piso_transferencia}
                    onChange={(e) => setFormData({ ...formData, precio_minimo_piso_transferencia: Number(e.target.value) })}
                    placeholder="0"
                    disabled
                  />
                  <span className="text-sm text-blue-700">= precio_minimo del producto</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  La IA puede dar hasta el precio_minimo en transferencia
                </p>
              </div>

              <div>
                <Label htmlFor="piso_tarjeta" className="text-blue-900">
                  Piso Tarjeta (% adicional sobre precio_minimo)
                </Label>
                <Input
                  id="piso_tarjeta"
                  type="number"
                  value={formData.precio_minimo_piso_tarjeta}
                  onChange={(e) => setFormData({ ...formData, precio_minimo_piso_tarjeta: Number(e.target.value) })}
                  placeholder="30"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Ej: 30% = precio_minimo + 30%. La IA puede dar hasta este límite con tarjeta.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Envío */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Configuración de Envío
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="costo_envio">Costo de Envío ($)</Label>
            <Input
              id="costo_envio"
              type="number"
              value={formData.costo_envio_default}
              onChange={(e) => setFormData({ ...formData, costo_envio_default: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="envio_gratis">Mínimo para Envío Gratis ($)</Label>
            <Input
              id="envio_gratis"
              type="number"
              value={formData.envio_gratis_minimo}
              onChange={(e) => setFormData({ ...formData, envio_gratis_minimo: Number(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = envío gratis deshabilitado
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="envio_gratis_global"
                checked={formData.habilitar_envio_gratis_global}
                onChange={(e) => setFormData({ ...formData, habilitar_envio_gratis_global: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded"
              />
              <div className="flex-1">
                <Label htmlFor="envio_gratis_global" className="text-green-900 font-semibold cursor-pointer">
                  🚚 Mostrar "Envío Gratis" en todos los productos
                </Label>
                <p className="text-xs text-green-700 mt-1">
                  Al activar esta opción, todos los productos de la tienda mostrarán un cartel de "Envío Gratis" independientemente de su precio.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos de Transferencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Datos para Transferencia Bancaria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="banco">Banco</Label>
            <Input
              id="banco"
              value={formData.datos_transferencia.banco}
              onChange={(e) => setFormData({
                ...formData,
                datos_transferencia: { ...formData.datos_transferencia, banco: e.target.value }
              })}
              placeholder="Banco Galicia"
            />
          </div>

          <div>
            <Label htmlFor="cbu">CBU</Label>
            <Input
              id="cbu"
              value={formData.datos_transferencia.cbu}
              onChange={(e) => setFormData({
                ...formData,
                datos_transferencia: { ...formData.datos_transferencia, cbu: e.target.value }
              })}
              placeholder="0070123456789012345678"
            />
          </div>

          <div>
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              value={formData.datos_transferencia.alias}
              onChange={(e) => setFormData({
                ...formData,
                datos_transferencia: { ...formData.datos_transferencia, alias: e.target.value }
              })}
              placeholder="mi.tienda.alias"
            />
          </div>

          <div>
            <Label htmlFor="titular">Titular</Label>
            <Input
              id="titular"
              value={formData.datos_transferencia.titular}
              onChange={(e) => setFormData({
                ...formData,
                datos_transferencia: { ...formData.datos_transferencia, titular: e.target.value }
              })}
              placeholder="Juan Pérez"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" disabled={updateConfig.isPending}>
        {updateConfig.isPending ? 'Guardando...' : 'Guardar Configuración'}
      </Button>
    </div>
  );
}
