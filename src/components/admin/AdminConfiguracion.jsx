import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, DollarSign, TrendingDown, Shield, Truck, Plus, Trash2, Zap, Sparkles, Upload, Eye, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminConfiguracion({ comercio }) {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['config', comercio.id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerConfiguracion', {
        id_comercio: comercio.id_comercio
      });
      return response.data?.config || response.config;
    }
  });

  const [formData, setFormData] = useState({
    descuento_1: 10,
    descuento_2: 10,
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
    lead_hook_titulo: '¡No te vayas sin tu regalo!',
    promo_flash_global_activa: false,
    promo_flash_global_product_id: '',
    promo_flash_global_descuento: 15,
    promo_flash_global_delay: 20,
    // Visual Identity & IA
    nombre_comercio_display: '',
    descripcion_negocio: '', // Context for AI
    logo_url: '',
    destacar_medios_pago: true,
    destacar_ofertas: true,
    brand_color_primary: '#000000'
  });

  React.useEffect(() => {
    if (config) {
      setFormData({
        descuento_1: config.descuento_1 || 10,
        descuento_2: config.descuento_2 || 10,
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
        lead_hook_titulo: config.lead_hook_titulo || '¡No te vayas sin tu regalo!',
        promo_flash_global_activa: config.promo_flash_global_activa || false,
        promo_flash_global_product_id: config.promo_flash_global_product_id || '',
        promo_flash_global_descuento: config.promo_flash_global_descuento || 15,
        promo_flash_global_delay: config.promo_flash_global_delay || 20,
        nombre_comercio_display: config.nombre_comercio_display || comercio.nombre_comercio || '',
        descripcion_negocio: config.descripcion_negocio || '',
        logo_url: config.logo_url || '',
        destacar_medios_pago: config.destacar_medios_pago !== false,
        destacar_ofertas: config.destacar_ofertas !== false,
        brand_color_primary: config.brand_color_primary || '#000000'
      });
    }
  }, [config]);

  const updateConfig = useMutation({
    mutationFn: async (data) => {
      // Uso de base44 client estándar
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

  const generarDiseno = useMutation({
    mutationFn: async (style = 'auto') => {
      if (!formData.descripcion_negocio && style === 'auto') throw new Error("Escribí una descripción primero para el modo automático");

      const res = await base44.functions.invoke('generarDisenoTienda', {
        descripcion_negocio: formData.descripcion_negocio,
        nombre_comercio: formData.nombre_comercio_display || comercio.nombre_comercio,
        estilo: style
      });

      if (res.error) throw new Error(res.error);
      return res.data;
    },

    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        brand_color_primary: data.brand_color_primary,
        lead_hook_titulo: data.lead_hook_titulo,
        // If we want to accept other suggestions:
        // nombre_comercio_display: prev.nombre_comercio_display || data.nombre_sugerido
      }));
      toast.success("¡Diseño generado! " + data.mensaje_agente, { duration: 5000 });
    },
    onError: (e) => toast.error(e.message)
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
              value={`${window.location.origin}/tienda/${comercio.id_comercio}`}
              className="bg-black/30 text-neutral-300 border-orange-900/30 font-mono"
            />
            <Button
              variant="outline"
              className="border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/tienda/${comercio.id_comercio}`);
                toast.success("URL copiada al portapapeles");
              }}
            >
              Copiar
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => window.open(`/tienda/${comercio.id_comercio}`, '_blank')}
            >
              Ver Tienda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Identidad Visual & IA */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Palette className="w-5 h-5 text-purple-600" />
            Identidad Visual & Contexto para IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-200 mb-4">
            <p className="text-sm text-purple-800">
              🤖 <b>El Agente Diseñador</b> usa esta información para armar tu tienda automáticamente.
              Explicarle bien de qué trata tu negocio ayuda a elegir mejores textos, iconos y distribución.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="font-semibold">Logo del Comercio</Label>
              <div className="flex items-center gap-4">
                {formData.logo_url ? (
                  <div className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
                    <img src={formData.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow-sm hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                    <span className="text-xs text-center">Sin Logo</span>
                  </div>
                )}

                <div className="flex-1">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm transition-colors w-max">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 font-medium">Subir Logo</span>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const toastId = toast.loading('Subiendo logo...');
                          const { file_url } = await base44.integrations.Core.UploadFile({ file });
                          setFormData(prev => ({ ...prev, logo_url: file_url }));
                          toast.dismiss(toastId);
                          toast.success('Logo subido');
                        } catch (err) {
                          console.error(err);
                          toast.error('Error al subir logo');
                        }
                      }}
                    />
                  </Label>
                  <p className="text-[10px] text-gray-500 mt-2">Recomendado: PNG sin fondo (Transparente).</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre_display">Nombre Visible del Comercio</Label>
                <Input
                  id="nombre_display"
                  value={formData.nombre_comercio_display}
                  onChange={(e) => setFormData({ ...formData, nombre_comercio_display: e.target.value })}
                  placeholder="Ej: La Parrilla de Maxi"
                  className="border-purple-200"
                />
              </div>

              <div>
                <Label htmlFor="brand_color">Color de Marca</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    id="brand_color_picker"
                    value={formData.brand_color_primary}
                    onChange={(e) => setFormData({ ...formData, brand_color_primary: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    id="brand_color"
                    value={formData.brand_color_primary}
                    onChange={(e) => setFormData({ ...formData, brand_color_primary: e.target.value })}
                    placeholder="#000000"
                    className="border-purple-200 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_pagos"
                    checked={formData.destacar_medios_pago}
                    onChange={(e) => setFormData({ ...formData, destacar_medios_pago: e.target.checked })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <Label htmlFor="chk_pagos" className="text-sm cursor-pointer">Destacar Medios de Pago</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_ofertas"
                    checked={formData.destacar_ofertas}
                    onChange={(e) => setFormData({ ...formData, destacar_ofertas: e.target.checked })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <Label htmlFor="chk_ofertas" className="text-sm cursor-pointer">Destacar Ofertas</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex flex-col gap-3">
              <Label htmlFor="contexto_ia" className="text-purple-900 font-bold">Contexto del Negocio (Input para la IA)</Label>
              <textarea
                id="contexto_ia"
                className="w-full min-h-[100px] p-3 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Ej: Somos una empresa familiar dedicada a la fabricación de parrillas y asadores de alta calidad. Nuestro público valora la durabilidad, el diseño rústico pero moderno. Queremos transmitir confianza y tradición argentina."
                value={formData.descripcion_negocio}
                onChange={(e) => setFormData({ ...formData, descripcion_negocio: e.target.value })}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-600 font-medium">
                  Cuanto más detalles des, mejor entenderá la IA qué priorizar en el diseño.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-500 text-purple-700 hover:bg-purple-50 hover:text-purple-900 gap-2"
                  onClick={() => generarDiseno.mutate()}
                  disabled={generarDiseno.isPending || !formData.descripcion_negocio}
                >
                  <Sparkles className="w-4 h-4" />
                  {generarDiseno.isPending ? 'Analizando...' : 'Generar Identidad con IA'}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 justify-end">
                <span className="text-xs font-bold text-purple-900 mr-2 flex items-center">O elegí un estilo directo:</span>
                <Button type="button" size="xs" variant="outline" onClick={() => generarDiseno.mutate('corporativo')} disabled={generarDiseno.isPending}>
                  👔 Serio
                </Button>
                <Button type="button" size="xs" variant="outline" onClick={() => generarDiseno.mutate('minimalista')} disabled={generarDiseno.isPending}>
                  ✨ Minimalista
                </Button>
                <Button type="button" size="xs" variant="outline" onClick={() => generarDiseno.mutate('llamativo')} disabled={generarDiseno.isPending} className="text-red-600 border-red-200 hover:bg-red-50">
                  🔥 Oferta
                </Button>
                <Button type="button" size="xs" variant="outline" onClick={() => generarDiseno.mutate('natural')} disabled={generarDiseno.isPending} className="text-green-600 border-green-200 hover:bg-green-50">
                  🌿 Natural
                </Button>
              </div>
            </div>
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


          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Sistema de oferta controlado por IA
            </h4>

            <div className="bg-blue-100 border border-blue-300 p-3 rounded-lg mb-4">
              <p className="text-xs text-blue-900 font-bold text-center">
                ⚠️ RECORDATORIO: Los descuentos son acumulables. Para máxima efectividad del sistema, se recomienda tener 3 programados en distintos valores.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="descuento_1" className="text-blue-900 font-bold">
                  Descuento 1 (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="descuento_1"
                    type="number"
                    value={formData.descuento_1}
                    onChange={(e) => setFormData({ ...formData, descuento_1: Number(e.target.value) })}
                    placeholder="10"
                    className="border-blue-200"
                  />
                  <span className="text-sm text-blue-700">Generalmente Transferencia</span>
                </div>
              </div>

              <div>
                <Label htmlFor="descuento_2" className="text-blue-900 font-bold">
                  Descuento 2 (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="descuento_2"
                    type="number"
                    value={formData.descuento_2}
                    onChange={(e) => setFormData({ ...formData, descuento_2: Number(e.target.value) })}
                    placeholder="10"
                    className="border-blue-200"
                  />
                  <span className="text-sm text-blue-700">Siguiente nivel de oferta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Flash Promo Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Estrategia Promoción Relámpago y IA
            </h4>
            <div className="bg-orange-100 p-3 rounded mb-4">
              <p className="text-xs text-orange-800 italic">
                Configurá aquí la "Oferta de Pánico" que aparecerá si la IA detecta dudas en el cliente.
                Podés sugerir un "Producto Estrella" (el más vendido), pero la IA decidirá si usar ese o el que convenga según el historial del cliente.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="promo_flash_activa" className="text-orange-900 font-bold">Activar Promoción Relámpago Global</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="promo_flash_activa"
                    checked={formData.promo_flash_global_activa}
                    onChange={(e) => setFormData({ ...formData, promo_flash_global_activa: e.target.checked })}
                    className="w-5 h-5 accent-orange-600"
                  />
                </div>
              </div>

              {formData.promo_flash_global_activa && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 border-t border-orange-200 pt-4">
                  <div className="md:col-span-2">
                    <Label className="text-sm font-bold text-orange-800">Producto Estrella Sugerido (ID / SKU)</Label>
                    <Input
                      value={formData.promo_flash_global_product_id}
                      onChange={(e) => setFormData({ ...formData, promo_flash_global_product_id: e.target.value })}
                      placeholder="Pegá aquí el ID del producto más vendido..."
                      className="bg-white border-orange-200"
                    />
                    <p className="text-[10px] text-orange-600 mt-1">* La IA usará este como referencia principal.</p>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-orange-800">Descuento Agresivo (%)</Label>
                    <Input
                      type="number"
                      value={formData.promo_flash_global_descuento}
                      onChange={(e) => setFormData({ ...formData, promo_flash_global_descuento: Number(e.target.value) })}
                      className="bg-white border-orange-200 font-bold text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-orange-800">Delay (segundos)</Label>
                    <Input
                      type="number"
                      value={formData.promo_flash_global_delay}
                      onChange={(e) => setFormData({ ...formData, promo_flash_global_delay: Number(e.target.value) })}
                      className="bg-white border-orange-200"
                    />
                  </div>
                </div>
              )}
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
    </div >
  );
}
