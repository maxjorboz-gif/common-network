import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from '@/components/CartContext';
import ReviewSlider from '@/components/store/ReviewSlider';

export default function Producto() {
  const urlParams = new URLSearchParams(window.location.search);
  const idProducto = urlParams.get('id');
  const { addItem, openDrawer } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['producto-detalle', idProducto],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerDetalleProducto', {
        productoId: idProducto
      });
      return response.data;
    },
    enabled: !!idProducto
  });

  // --- LÓGICA DE ARCHIVOS ESTANDARIZADA ---
  const getFileUrl = (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    // Si Base44 devuelve un objeto de archivo:
    return file.url || (file.id ? `${base44.config.baseUrl}/files/${file.id}` : null);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="text-orange-600 animate-spin mb-4" size={48} />
      <span className="text-orange-600 font-black uppercase italic tracking-widest">AVIVANDO EL FUEGO...</span>
    </div>
  );

  if (!data?.producto) return <div className="min-h-screen bg-black text-white flex items-center justify-center uppercase font-black">Producto no encontrado</div>;

  const { producto, resenas } = data;

  // Construcción de galería usando los nombres reales de las columnas
  const gallery = [];
  const principal = getFileUrl(producto.foto_principal_url) || getFileUrl(producto.foto_principal);
  if (principal) gallery.push(principal);

  if (Array.isArray(producto.fotos)) {
    producto.fotos.forEach(f => {
      const url = getFileUrl(f);
      if (url && url !== principal) gallery.push(url);
    });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 mb-8 text-neutral-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all"
        >
          <ArrowLeft size={14} /> VOLVER AL CATÁLOGO
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* GALERÍA */}
          <div className="space-y-6">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden border-2 border-neutral-900 bg-neutral-900 shadow-2xl">
              {gallery.length > 0 ? (
                <img
                  src={gallery[selectedImage]}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  alt={producto.titulo}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-800 font-black italic uppercase">Sin Imagen</div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-orange-600 scale-105' : 'border-neutral-800 opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* INFO PRODUCTO */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl lg:text-7xl font-black mb-4 uppercase italic tracking-tighter leading-none">
              {producto.titulo}
            </h1>
            <p className="text-neutral-400 text-lg lg:text-xl mb-10 italic leading-relaxed">
              {producto.descripcion_corta || "Calidad artesanal para tu quincho."}
            </p>

            <div className="bg-neutral-900/50 p-8 lg:p-12 rounded-[3rem] border border-neutral-800 mb-8 backdrop-blur-sm">
              <div className="mb-6">
                <span className="text-orange-600 font-black text-sm uppercase tracking-widest">Precio Especial Web</span>
                <div className="text-6xl font-black italic mt-2">
                  ${Number(producto.precio_estandar).toLocaleString('es-AR')}
                </div>
              </div>

              <Button
                onClick={() => {
                  addItem(producto); // Pasamos el objeto completo, el Context extrae el ID
                  openDrawer();
                }}
                className="w-full h-20 bg-orange-700 hover:bg-orange-600 text-xl font-black rounded-2xl transition-all shadow-xl shadow-orange-900/20"
              >
                <ShoppingCart className="mr-3" /> AÑADIR AL CARRITO
              </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="1" className="border-neutral-800">
                <AccordionTrigger className="uppercase font-black text-[10px] tracking-widest text-neutral-500 hover:text-white">
                  Especificaciones Técnicas
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-lg italic border-l-2 border-orange-900/40 pl-6 py-4">
                  {producto.descripcion_larga || "No hay detalles adicionales disponibles."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* RESEÑAS */}
        {resenas?.length > 0 && (
          <div className="mt-32 pt-20 border-t border-neutral-900">
            <h2 className="text-4xl font-black mb-12 uppercase italic tracking-tight">Voces de la Parrilla</h2>
            <ReviewSlider resenas={resenas} />
          </div>
        )}
      </div>
    </div>
  );
}
