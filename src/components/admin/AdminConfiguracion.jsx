import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, DollarSign, TrendingDown, Shield, Truck, Plus, Trash2, Zap, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminConfiguracion({ comercio }) {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['config', comercio.commerce_code || comercio.id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerConfiguracion', {
        commerce_code: comercio.commerce_code,
        id_comercio: comercio.id_comercio // Legacy fallback
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
    },
    marketing_red_activo: false,
    metodos_envio: [],
    mercadopago_activo: false,
    mercadopago_token: '',
    lead_hook_activo: true,
    lead_hook_titulo: '¡No te vayas sin tu regalo!'
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
        },
        marketing_red_activo: config.marketing_red_activo || false,
        metodos_envio: config.metodos_envio || [],
        mercadopago_activo: config.mercadopago_activo || false,
        mercadopago_token: config.mercadopago_token || '',
        lead_hook_activo: config.lead_hook_activo !== undefined ? config.lead_hook_activo : true,
        lead_hook_titulo: config.lead_hook_titulo || '¡No te vayas sin tu regalo!'
      });
    }
  }, [config]);

  const updateConfig = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('actualizarConfiguracion', {
        commerce_code: comercio.commerce_code, // PRIORITIZE
        id_comercio: comercio.id_comercio,     // LEGACY
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
      {/* URL de la Tienda */}
      <Card className="border-orange-600/30 bg-orange-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500">
            <Settings className="w-5 h-5" />
            Tu Tienda Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>URL Pública de tu Comercio</Label>
          <div className="flex gap-2 mt-2">
            <Input
              readOnly
              value={`${window.location.origin}/tienda/${comercio.commerce_code}`}
              className="bg-black/30 text-neutral-300 border-orange-900/30 font-mono"
            />
            <Button
              variant="outline"
              className="border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/tienda/${comercio.commerce_code}`);
                toast.success("URL copiada al portapapeles");
              }}
            >
              Copiar
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => window.open(`/tienda/${comercio.commerce_code}`, '_blank')}
            >
              Ver Tienda
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Configuración de Envíos - MATRIZ DE LOGÍSTICA */}
      <Card className="overflow-hidden border-2 border-blue-100 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="bg-blue-50/50 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Truck className="w-5 h-5" />
            Matriz de Logística Personalizada
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold"
            onClick={() => {
              const nuevosMetodos = [...(formData.metodos_envio || [])];
              nuevosMetodos.push({ id: Date.now(), nombre: 'Nuevo Método', costo: 0, minimo_gratis: 0 });
              setFormData({ ...formData, metodos_envio: nuevosMetodos });
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Añadir Método
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl mb-4">
            <p className="text-xs text-orange-900 italic font-medium">
              💡 <b>Flexibilidad Total:</b> Definí tus propios medios de entrega. Podés cobrar un fijo para motos, otro para correo, o dejar el "Retiro en Local" gratis.
            </p>
          </div>

          <div className="space-y-4">
            {(formData.metodos_envio || []).length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-neutral-100 rounded-3xl">
                <p className="text-neutral-400 text-sm italic">No tenés métodos configurados. Agregá uno para que tus clientes puedan elegir.</p>
              </div>
            )}

            {(formData.metodos_envio || []).map((metodo, index) => (
              <div key={metodo.id} className="p-5 bg-white border border-neutral-200 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-[10px] font-black uppercase text-neutral-400 italic">Nombre del Medio</Label>
                  <Input
                    value={metodo.nombre}
                    className="h-12 rounded-xl"
                    placeholder="Ej: Correo Argentino / Moto Local"
                    onChange={(e) => {
                      const list = [...formData.metodos_envio];
                      list[index].nombre = e.target.value;
                      setFormData({ ...formData, metodos_envio: list });
                    }}
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400 italic">Costo ($)</Label>
                  <Input
                    type="number"
                    value={metodo.costo}
                    className="h-12 rounded-xl"
                    onChange={(e) => {
                      const list = [...formData.metodos_envio];
                      list[index].costo = Number(e.target.value);
                      setFormData({ ...formData, metodos_envio: list });
                    }}
                  />
                </div>
                <div className="w-full md:w-40 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400 italic">Gratis desde ($)</Label>
                  <Input
                    type="number"
                    value={metodo.minimo_gratis}
                    className="h-12 rounded-xl bg-green-50 border-green-200 text-green-700 font-bold"
                    placeholder="Ej: 80000"
                    onChange={(e) => {
                      const list = [...formData.metodos_envio];
                      list[index].minimo_gratis = Number(e.target.value);
                      setFormData({ ...formData, metodos_envio: list });
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  className="h-12 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 rounded-xl"
                  onClick={() => {
                    const list = formData.metodos_envio.filter((_, i) => i !== index);
                    setFormData({ ...formData, metodos_envio: list });
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <div className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer ${formData.habilitar_envio_gratis_global ? 'border-green-500 bg-green-50' : 'border-neutral-100 bg-neutral-50 opacity-60'}`}
              onClick={() => setFormData({ ...formData, habilitar_envio_gratis_global: !formData.habilitar_envio_gratis_global })}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black italic uppercase text-sm text-green-800">Modo Full: Envío Gratis en TODO</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.habilitar_envio_gratis_global ? 'bg-green-500' : 'bg-neutral-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.habilitar_envio_gratis_global ? 'left-5.5' : 'left-0.5'}`} />
                </div>
              </div>
              <p className="text-xs text-green-700 leading-relaxed font-bold italic">
                Sobrescribí todos los costos y ofrecé "ENVÍO GRATIS" en cada producto de tu tienda. Es la táctica número 1 para forzar la decisión de compra.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pasarelas de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Pagos Online (Mercado Pago)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.mercadopago_activo ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 bg-neutral-50 opacity-60'}`}
            onClick={() => setFormData({ ...formData, mercadopago_activo: !formData.mercadopago_activo })}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black italic uppercase text-xs text-blue-800">Habilitar Mercado Pago</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.mercadopago_activo ? 'bg-blue-500' : 'bg-neutral-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.mercadopago_activo ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </div>
            <p className="text-[10px] text-blue-700 leading-relaxed font-medium">Permití que tus clientes paguen con tarjeta de crédito, débito o saldo en cuenta.</p>
          </div>

          <div>
            <Label htmlFor="mp_token">Access Token de Mercado Pago</Label>
            <Input
              id="mp_token"
              type="password"
              value={formData.mercadopago_token}
              onChange={(e) => setFormData({ ...formData, mercadopago_token: e.target.value })}
              placeholder="APP_USR-..."
              className="mt-1"
            />
            <p className="text-[10px] text-neutral-400 mt-1 italic">Obtenelo en el panel de desarrolladores de Mercado Pago.</p>
          </div>
        </CardContent>
      </Card>

      {/* Marketing y Conversión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            Herramientas de Captura (Lead Hook)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.lead_hook_activo ? 'border-orange-500 bg-orange-50' : 'border-neutral-100 bg-neutral-50 opacity-60'}`}
            onClick={() => setFormData({ ...formData, lead_hook_activo: !formData.lead_hook_activo })}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black italic uppercase text-xs text-orange-800">Pop-up de Salida (Exit Intent)</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.lead_hook_activo ? 'bg-orange-500' : 'bg-neutral-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.lead_hook_activo ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </div>
            <p className="text-[10px] text-orange-700 leading-relaxed font-medium">Muestra un sorteo o cupón cuando el usuario intenta cerrar la pestaña.</p>
          </div>

          <div>
            <Label htmlFor="hook_title">Título del Gancho</Label>
            <Input
              id="hook_title"
              value={formData.lead_hook_titulo}
              onChange={(e) => setFormData({ ...formData, lead_hook_titulo: e.target.value })}
              placeholder="¡No te vayas sin tu regalo!"
              className="mt-1"
            />
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
