import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Check, X, Tag, Upload, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CategoriaFilter from './CategoriaFilter';

export default function AdminProductos({ comercio }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkPriceChange, setBulkPriceChange] = useState({ type: 'increase', value: 10, mode: 'percentage' });
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    descripcion_tecnica: '',
    precio_estandar: '',
    precio_minimo: '',
    costo_producto: '',
    sku_taller_interno: '',
    stock_actual: '',
    imagen_principal: '',
    activo: true,
    promo_flash_activa: false,
    promo_flash_descuento: 15,
    promo_flash_delay: 20
  });

  const [atributos, setAtributos] = useState([]);
  const [nuevoAtributo, setNuevoAtributo] = useState({
    nombre_atributo: '',
    magnitud: '',
    valor_numerico: '',
    unidad: '',
    ia_weight: 5
  });

  const [mediaTemp, setMediaTemp] = useState({
    fotoPrincipal: null,
    fotoDetalle1: null,
    fotoDetalle2: null,
    videoVenta: null,
    videoTecnico: null
  });

  const magnitudesConfig = {
    'Longitud': ['mm', 'cm', 'm'],
    'Masa/Peso': ['g', 'kg'],
    'Capacidad': ['ml', 'l'],
    'Moneda': ['ARS', 'USD']
  };

  const { data: productosData, isLoading } = useQuery({
    queryKey: ['productos-admin', comercio.commerce_code || comercio.id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerProductosAdmin', {
        commerce_code: comercio.commerce_code,
        id_comercio: comercio.id_comercio // Legacy fallback
      });
      return response.data;
    }
  });

  const productos = productosData?.productos || [];
  const todosAtributos = productosData?.atributos || [];

  const handleOpenDialog = async (producto = null) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        titulo: producto.titulo || '',
        descripcion: producto.descripcion || '',
        descripcion_tecnica: producto.descripcion_tecnica || '',
        precio_estandar: producto.precio_estandar || '',
        precio_minimo: producto.precio_minimo || '',
        costo_producto: producto.costo_producto || '',
        sku_taller_interno: producto.sku_taller_interno || '',
        stock_actual: producto.stock_actual || '',
        imagen_principal: producto.imagen_principal || '',
        categoria: producto.categoria || '',
        activo: producto.activo !== false,
        promo_flash_activa: producto.promo_flash_activa || false,
        promo_flash_descuento: producto.promo_flash_descuento || 15,
        promo_flash_delay: producto.promo_flash_delay || 20
      });

      const attrs = todosAtributos.filter(a => a.id_producto === producto.id);
      setAtributos(attrs.sort((a, b) => (a.orden || 0) - (b.orden || 0)));

      const fotos = producto.fotos || [];
      const videos = producto.videos || [];
      setMediaTemp({
        fotoPrincipal: fotos.find(f => f.tipo === 'principal') || null,
        fotoDetalle1: fotos.find(f => f.tipo === 'detalle' && fotos.indexOf(f) === 1) || null,
        fotoDetalle2: fotos.find(f => f.tipo === 'uso') || null,
        videoVenta: videos.find(v => v.tipo === 'uso') || null,
        videoTecnico: videos.find(v => v.tipo === 'review') || null
      });
    } else {
      setEditingProduct(null);
      setFormData({
        titulo: '',
        descripcion: '',
        descripcion_tecnica: '',
        precio_estandar: '',
        precio_minimo: '',
        costo_producto: '',
        sku_taller_interno: '',
        stock_actual: '',
        imagen_principal: '',
        categoria: '',
        activo: true,
        promo_flash_activa: false,
        promo_flash_descuento: 15,
        promo_flash_delay: 20
      });
      setAtributos([]);
      setMediaTemp({
        fotoPrincipal: null,
        fotoDetalle1: null,
        fotoDetalle2: null,
        videoVenta: null,
        videoTecnico: null
      });
    }
    setNuevoAtributo({ nombre_atributo: '', magnitud: '', valor_numerico: '', unidad: '', ia_weight: 5 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // FRONTEND TONTO: SOLO UPLOAD DE FOTOS/VIDEOS
      const fotosArray = [];
      const videosArray = [];

      if (mediaTemp.fotoPrincipal?.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaTemp.fotoPrincipal.file });
        fotosArray.push({ url: file_url, tipo: 'principal', orden: 0 });
      }
      if (mediaTemp.fotoDetalle1?.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaTemp.fotoDetalle1.file });
        fotosArray.push({ url: file_url, tipo: 'detalle', orden: 1 });
      }
      if (mediaTemp.fotoDetalle2?.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaTemp.fotoDetalle2.file });
        fotosArray.push({ url: file_url, tipo: 'uso', orden: 2 });
      }
      if (mediaTemp.videoVenta?.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaTemp.videoVenta.file });
        videosArray.push({ url: file_url, tipo: 'uso', orden: 0 });
      }
      if (mediaTemp.videoTecnico?.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaTemp.videoTecnico.file });
        videosArray.push({ url: file_url, tipo: 'review', orden: 1 });
      }

      const fotosFinales = fotosArray.length > 0 ? fotosArray : (editingProduct?.fotos || []);
      const videosFinales = videosArray.length > 0 ? videosArray : (editingProduct?.videos || []);

      // FRONTEND TONTO: ENVÍA DATOS AL BACKEND, TODO LO DEMÁS LO RESUELVE EL BACKEND
      const data = {
        ...formData,
        commerce_code: comercio.commerce_code, // Main identifier
        id_comercio: comercio.id_comercio,     // Legacy support
        costo_producto: parseFloat(formData.costo_producto || 0),
        sku_taller_interno: formData.sku_taller_interno || `SKU-${Date.now()}`,
        stock_actual: parseInt(formData.stock_actual || 0),
        fotos: fotosFinales,
        videos: videosFinales,
        imagen_principal: fotosFinales[0]?.url || formData.imagen_principal
      };

      if (editingProduct) {
        await base44.functions.invoke('actualizarProducto', {
          productoId: editingProduct.id,
          productoData: data,
          atributos
        });
      } else {
        await base44.functions.invoke('crearProducto', {
          productoData: data,
          atributos
        });
      }

      queryClient.invalidateQueries(['productos-admin']);
      setDialogOpen(false);
    } catch (err) {
      console.error('Error guardando producto:', err);
      alert('Error guardando producto');
    }
  };

  const handleAgregarAtributo = () => {
    if (!nuevoAtributo.nombre_atributo) {
      alert('Completá el nombre del atributo');
      return;
    }

    let valorFinal = '';
    if (nuevoAtributo.magnitud && nuevoAtributo.valor_numerico && nuevoAtributo.unidad) {
      valorFinal = `${nuevoAtributo.valor_numerico} ${nuevoAtributo.unidad}`;
    } else if (nuevoAtributo.valor_numerico) {
      valorFinal = nuevoAtributo.valor_numerico;
    } else {
      alert('Completá el valor del atributo');
      return;
    }

    setAtributos([...atributos, {
      nombre_atributo: nuevoAtributo.nombre_atributo,
      valor_atributo: valorFinal,
      ia_weight: nuevoAtributo.ia_weight
    }]);
    setNuevoAtributo({ nombre_atributo: '', magnitud: '', valor_numerico: '', unidad: '', ia_weight: 5 });
  };

  const handleEliminarAtributo = (index) => {
    setAtributos(atributos.filter((_, i) => i !== index));
  };

  const handleMediaSelect = (slot, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setMediaTemp(prev => ({
        ...prev,
        [slot]: {
          file: file,
          preview: reader.result,
          nombre: file.name
        }
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveMedia = (slot) => {
    setMediaTemp(prev => ({
      ...prev,
      [slot]: null
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      await base44.functions.invoke('eliminarProducto', { productoId: id });
      queryClient.invalidateQueries(['productos-admin']);
    } catch (err) {
      console.error('Error eliminando producto:', err);
    }
  };

  const handleToggleActivo = async (producto) => {
    try {
      await base44.functions.invoke('toggleActivoProducto', {
        productoId: producto.id,
        activo: !producto.activo
      });
      queryClient.invalidateQueries(['productos-admin']);
    } catch (err) {
      console.error('Error actualizando producto:', err);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const filteredProducts = selectedCategoria
      ? productos.filter(p => p.categoria === selectedCategoria)
      : productos;

    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`¿Seguro que deseas eliminar ${selectedProducts.length} productos?`)) return;

    try {
      for (const id of selectedProducts) {
        await base44.functions.invoke('eliminarProducto', { productoId: id });
      }
      queryClient.invalidateQueries(['productos-admin']);
      setSelectedProducts([]);
    } catch (err) {
      console.error('Error eliminando productos:', err);
      alert('Error eliminando algunos productos');
    }
  };

  const handleBulkPriceChange = async () => {
    try {
      const response = await base44.functions.invoke('cambioMasivoPrecio', {
        productosIds: selectedProducts,
        tipo: bulkPriceChange.type,
        valor: bulkPriceChange.value,
        modo: bulkPriceChange.mode
      });

      queryClient.invalidateQueries(['productos-admin']);
      setBulkActionDialogOpen(false);
      setSelectedProducts([]);
      alert(`${response.data.actualizados} productos actualizados`);
    } catch (err) {
      console.error('Error actualizando precios:', err);
      alert('Error actualizando precios');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const productosFiltrados = selectedCategoria
    ? productos.filter(p => p.categoria === selectedCategoria)
    : productos;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setBulkActionDialogOpen(true)}
                className="border-blue-600 text-blue-600"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Cambiar Precio ({selectedProducts.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                className="border-red-600 text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar ({selectedProducts.length})
              </Button>
            </>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {editingProduct && (
                  <div>
                    <Label htmlFor="id_producto">ID Único (UUID) - Solo Lectura</Label>
                    <Input
                      id="id_producto"
                      value={editingProduct.id}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">ID único de Base44 para rastreo de Meta</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion_tecnica">Especificaciones Técnicas</Label>
                  <Textarea
                    id="descripcion_tecnica"
                    value={formData.descripcion_tecnica}
                    onChange={(e) => setFormData({ ...formData, descripcion_tecnica: e.target.value })}
                    placeholder="Detalles técnicos"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku_taller_interno}
                      onChange={(e) => setFormData({ ...formData, sku_taller_interno: e.target.value })}
                      placeholder="Se generará automáticamente"
                    />
                    <p className="text-xs text-gray-500 mt-1">Identificador único para tracking de Meta Ads</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">💰 Estrategia de Precios</h4>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="precio_estandar" className="text-blue-900">Precio Estándar (Lista) *</Label>
                        <Input
                          id="precio_estandar"
                          type="number"
                          value={formData.precio_estandar}
                          onChange={(e) => setFormData({ ...formData, precio_estandar: e.target.value })}
                          placeholder="0"
                          className="border-blue-300"
                        />
                        <p className="text-xs text-blue-600 mt-1">Precio público mostrado en tienda</p>
                      </div>

                      <div>
                        <Label className="text-amber-900">Precio Mínimo (Piso IA) *</Label>
                        <Input
                          type="number"
                          value={formData.precio_estandar ? (parseFloat(formData.precio_estandar) * 0.60).toFixed(2) : '0'}
                          disabled
                          className="border-amber-400 bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-amber-700 mt-1">
                          🔒 CALCULADO EN BACKEND: 60% del Precio Estándar
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="costo_producto" className="text-gray-700">Costo Real (Opcional)</Label>
                        <Input
                          id="costo_producto"
                          type="number"
                          value={formData.costo_producto}
                          onChange={(e) => setFormData({ ...formData, costo_producto: e.target.value })}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tu costo para calcular margen real</p>
                      </div>
                    </div>

                    <div className="mt-3 bg-white rounded p-2 text-xs">
                      <p className="font-semibold text-gray-700">Rango de Negociación IA:</p>
                      <p className="text-gray-600">
                        ${formData.precio_estandar || '0'} → Oferta IA → ${formData.precio_minimo || '0'} (PISO)
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Promoción Relámpago (Carrito Directo)
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="promo_activa" className="text-orange-900">¿Activar Oferta Emergente?</Label>
                        <input
                          type="checkbox"
                          id="promo_activa"
                          checked={formData.promo_flash_activa}
                          onChange={(e) => setFormData({ ...formData, promo_flash_activa: e.target.checked })}
                          className="w-5 h-5 accent-orange-600"
                        />
                      </div>

                      {formData.promo_flash_activa && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Descuento (%)</Label>
                            <Input
                              type="number"
                              value={formData.promo_flash_descuento}
                              onChange={(e) => setFormData({ ...formData, promo_flash_descuento: parseInt(e.target.value) })}
                              placeholder="15"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aparece a los (seg)</Label>
                            <Input
                              type="number"
                              value={formData.promo_flash_delay}
                              onChange={(e) => setFormData({ ...formData, promo_flash_delay: parseInt(e.target.value) })}
                              placeholder="20"
                            />
                          </div>
                          <p className="col-span-2 text-[10px] text-orange-700 italic">
                            * El cartel aparecerá sutilmente después de los segundos marcados, ofreciendo el descuento y llevando al cliente directo al checkout.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Disponible</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría de Producto *</Label>
                  <select
                    id="categoria"
                    value={formData.categoria || ''}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm border-orange-300"
                    required
                  >
                    <option value="">Seleccionar categoría (OBLIGATORIO)</option>
                    <option value="Set Parrillero Completo">Set Parrillero Completo</option>
                    <option value="Parrillas con Brasero Uruguayo">Parrillas con Brasero Uruguayo</option>
                    <option value="Parrillas Combinadas Premium">Parrillas Combinadas Premium</option>
                    <option value="Accesorios de Cocción: Palita y Atizador">Accesorios de Cocción: Palita y Atizador</option>
                  </select>
                  <p className="text-xs text-orange-600 mt-1">⚠️ Campo obligatorio para estrategia de marketing</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold">Atributos del Producto (EAV)</Label>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Define atributos flexibles (Medida, Material, Accesorios, etc.) y su peso para la IA
                  </p>

                  {atributos.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {atributos.map((attr, index) => (
                        <div key={index} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{attr.nombre_atributo}:</span>{' '}
                            <span className="text-sm">{attr.valor_atributo}</span>
                            <span className="text-xs text-gray-500 ml-2">(Peso IA: {attr.ia_weight})</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarAtributo(index)}
                            className="text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                    <div>
                      <Label htmlFor="attr_nombre" className="text-xs">Nombre del Atributo *</Label>
                      <Input
                        id="attr_nombre"
                        value={nuevoAtributo.nombre_atributo}
                        onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, nombre_atributo: e.target.value })}
                        placeholder="Ej: Alto, Ancho, Peso, Material"
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="attr_magnitud" className="text-xs">Magnitud (opcional)</Label>
                        <select
                          id="attr_magnitud"
                          value={nuevoAtributo.magnitud}
                          onChange={(e) => setNuevoAtributo({
                            ...nuevoAtributo,
                            magnitud: e.target.value,
                            unidad: ''
                          })}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="">Sin magnitud</option>
                          <option value="Longitud">Longitud</option>
                          <option value="Masa/Peso">Masa/Peso</option>
                          <option value="Capacidad">Capacidad</option>
                          <option value="Moneda">Moneda</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="attr_valor" className="text-xs">Valor *</Label>
                        <Input
                          id="attr_valor"
                          type="text"
                          value={nuevoAtributo.valor_numerico}
                          onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, valor_numerico: e.target.value })}
                          placeholder="120"
                          className="h-9"
                        />
                      </div>

                      <div>
                        <Label htmlFor="attr_unidad" className="text-xs">Unidad</Label>
                        <select
                          id="attr_unidad"
                          value={nuevoAtributo.unidad}
                          onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, unidad: e.target.value })}
                          disabled={!nuevoAtributo.magnitud}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                        >
                          <option value="">-</option>
                          {nuevoAtributo.magnitud && magnitudesConfig[nuevoAtributo.magnitud]?.map(unidad => (
                            <option key={unidad} value={unidad}>{unidad}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="attr_weight" className="text-xs">Peso IA (1-10) *</Label>
                      <Input
                        id="attr_weight"
                        type="number"
                        min="1"
                        max="10"
                        value={nuevoAtributo.ia_weight}
                        onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, ia_weight: parseInt(e.target.value) || 5 })}
                        className="h-9"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1 = menos importante, 10 = característica clave para el cliente
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAgregarAtributo}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Atributo
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-4 block">📸 Carga de Multimedia (Meta-Ready)</Label>

                  <div className="space-y-3 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-sm">📷 Foto Principal (image_link)</Label>
                        {mediaTemp.fotoPrincipal && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia('fotoPrincipal')}
                            className="text-red-500 h-6"
                          >
                            <X className="w-4 h-4" /> Cambiar
                          </Button>
                        )}
                      </div>
                      {mediaTemp.fotoPrincipal ? (
                        <div className="w-20 h-20 rounded border border-blue-300 overflow-hidden">
                          <img src={mediaTemp.fotoPrincipal.preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-blue-300 rounded cursor-pointer hover:bg-blue-100">
                          <Upload className="w-5 h-5 text-blue-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaSelect('fotoPrincipal', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-sm">📷 Foto Detalle 1</Label>
                        {mediaTemp.fotoDetalle1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia('fotoDetalle1')}
                            className="text-red-500 h-6"
                          >
                            <X className="w-4 h-4" /> Cambiar
                          </Button>
                        )}
                      </div>
                      {mediaTemp.fotoDetalle1 ? (
                        <div className="w-20 h-20 rounded border border-blue-300 overflow-hidden">
                          <img src={mediaTemp.fotoDetalle1.preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-blue-300 rounded cursor-pointer hover:bg-blue-100">
                          <Upload className="w-5 h-5 text-blue-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaSelect('fotoDetalle1', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-sm">📷 Foto Detalle 2</Label>
                        {mediaTemp.fotoDetalle2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia('fotoDetalle2')}
                            className="text-red-500 h-6"
                          >
                            <X className="w-4 h-4" /> Cambiar
                          </Button>
                        )}
                      </div>
                      {mediaTemp.fotoDetalle2 ? (
                        <div className="w-20 h-20 rounded border border-blue-300 overflow-hidden">
                          <img src={mediaTemp.fotoDetalle2.preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-blue-300 rounded cursor-pointer hover:bg-blue-100">
                          <Upload className="w-5 h-5 text-blue-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaSelect('fotoDetalle2', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-sm">🎬 Video de Venta (video_url)</Label>
                        {mediaTemp.videoVenta && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia('videoVenta')}
                            className="text-red-500 h-6"
                          >
                            <X className="w-4 h-4" /> Cambiar
                          </Button>
                        )}
                      </div>
                      {mediaTemp.videoVenta ? (
                        <div className="w-20 h-12 bg-red-200 rounded border border-red-300 flex items-center justify-center">
                          <p className="text-xs text-center px-1 truncate">{mediaTemp.videoVenta.nombre}</p>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-12 border-2 border-dashed border-red-300 rounded cursor-pointer hover:bg-red-100">
                          <Upload className="w-5 h-5 text-red-400" />
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime"
                            onChange={(e) => handleMediaSelect('videoVenta', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-sm">🎬 Video Técnico (review)</Label>
                        {mediaTemp.videoTecnico && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia('videoTecnico')}
                            className="text-red-500 h-6"
                          >
                            <X className="w-4 h-4" /> Cambiar
                          </Button>
                        )}
                      </div>
                      {mediaTemp.videoTecnico ? (
                        <div className="w-20 h-12 bg-red-200 rounded border border-red-300 flex items-center justify-center">
                          <p className="text-xs text-center px-1 truncate">{mediaTemp.videoTecnico.nombre}</p>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-12 border-2 border-dashed border-red-300 rounded cursor-pointer hover:bg-red-100">
                          <Upload className="w-5 h-5 text-red-400" />
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime"
                            onChange={(e) => handleMediaSelect('videoTecnico', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="imagen">URL de Imagen (Legacy)</Label>
                  <Input
                    id="imagen"
                    value={formData.imagen_principal}
                    onChange={(e) => setFormData({ ...formData, imagen_principal: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Opcional - Usar los uploads de fotos arriba es recomendado</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Check className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <CategoriaFilter
        selectedCategoria={selectedCategoria}
        onFilterChange={setSelectedCategoria}
      />

      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Precio de {selectedProducts.length} Productos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo de Cambio</Label>
              <select
                value={bulkPriceChange.type}
                onChange={(e) => setBulkPriceChange({ ...bulkPriceChange, type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="increase">Aumentar</option>
                <option value="decrease">Disminuir</option>
              </select>
            </div>

            <div>
              <Label>Modo</Label>
              <select
                value={bulkPriceChange.mode}
                onChange={(e) => setBulkPriceChange({ ...bulkPriceChange, mode: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>

            <div>
              <Label>Valor</Label>
              <Input
                type="number"
                value={bulkPriceChange.value}
                onChange={(e) => setBulkPriceChange({ ...bulkPriceChange, value: parseFloat(e.target.value) || 0 })}
                placeholder={bulkPriceChange.mode === 'percentage' ? '10' : '5000'}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBulkPriceChange} className="flex-1">
                Aplicar Cambio
              </Button>
              <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {productos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos aún</h3>
          <p className="text-gray-600 mb-6">Creá tu primer producto para comenzar a vender</p>
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear mi primer producto
          </Button>
        </div>
      ) : (
        <div>
          {productos.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.length > 0 && selectedProducts.length === productosFiltrados.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">
                  {selectedProducts.length > 0
                    ? `${selectedProducts.length} producto(s) seleccionado(s)`
                    : 'Seleccionar todos'}
                </span>
              </div>
              {selectedProducts.length > 0 && (
                <span className="text-xs text-gray-500">
                  Usa los botones arriba para aplicar acciones masivas
                </span>
              )}
            </div>
          )}

          {[...new Set(productosFiltrados.map(p => p.categoria))].sort().map(categoria => {
            const productosCategoria = productosFiltrados.filter(p => p.categoria === categoria);
            return (
              <div key={categoria} className="mb-8">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-200">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {productosCategoria.length}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{categoria}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productosCategoria.map(producto => {
                    const stockBajo = producto.stock_actual <= (producto.stock_minimo_alerta || 5);
                    const sinStock = producto.stock_actual <= 0;
                    const margen = producto.costo_producto > 0
                      ? ((producto.precio_estandar - producto.costo_producto) / producto.precio_estandar * 100).toFixed(1)
                      : 0;

                    const atributosProducto = todosAtributos.filter(a => a.id_producto === producto.id);

                    return (
                      <Card key={producto.id} className={!producto.activo ? 'opacity-60' : ''}>
                        <div className="aspect-video bg-gray-100 relative">
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(producto.id)}
                              onChange={() => handleSelectProduct(producto.id)}
                              className="w-5 h-5 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <img
                            src={producto.imagen_principal || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400'}
                            alt={producto.titulo}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            {!producto.activo && (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                            {sinStock && (
                              <Badge className="bg-red-500">Sin stock</Badge>
                            )}
                            {stockBajo && !sinStock && (
                              <Badge className="bg-orange-500">Stock bajo</Badge>
                            )}
                          </div>
                          <div className="absolute top-2 left-12">
                            <Badge variant="outline" className="bg-white/90 text-xs">
                              ID: {producto.id.substring(0, 8)}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold line-clamp-1">{producto.titulo}</h3>
                          </div>

                          <div className="bg-gray-50 p-2 rounded mb-3 space-y-2 text-xs">
                            <div className="flex justify-between gap-2">
                              <span className="text-gray-600 font-medium">SKU:</span>
                              <span className="font-mono font-bold text-blue-700">{producto.sku_taller_interno || '-'}</span>
                            </div>
                            <div className="flex justify-between gap-2 border-t pt-2">
                              <span className="text-gray-600 font-medium">ID Meta:</span>
                              <span className="font-mono text-gray-500 text-xs">{producto.id.substring(0, 12)}...</span>
                            </div>
                          </div>

                          {atributosProducto.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {atributosProducto.slice(0, 3).map((attr, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {attr.nombre_atributo}: {attr.valor_atributo}
                                </Badge>
                              ))}
                              {atributosProducto.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{atributosProducto.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="space-y-1 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Precio Estándar:</span>
                              <span className="font-semibold">${producto.precio_estandar?.toLocaleString('es-AR')}</span>
                            </div>
                            {producto.precio_minimo && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mín. IA:</span>
                                <span className="font-medium text-amber-600">${producto.precio_minimo?.toLocaleString('es-AR')}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Stock:</span>
                              <span className={sinStock ? 'text-red-600 font-medium' : 'font-medium'}>
                                {producto.stock_actual}
                              </span>
                            </div>
                            {producto.costo_producto > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Margen:</span>
                                <span className="font-medium text-green-600">{margen}%</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Categoría:</span>
                              <span className="font-medium text-blue-600 text-xs">{producto.categoria || '-'}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActivo(producto)}
                              className="flex-1"
                            >
                              {producto.activo ? 'Desactivar' : 'Activar'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(producto)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(producto.id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
