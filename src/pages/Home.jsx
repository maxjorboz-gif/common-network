import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, ShoppingCart, Sparkles, TrendingUp, Package, MessageCircle, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/store/ProductCard';
import ReviewSlider from '@/components/store/ReviewSlider';
import CartDrawerNew from '@/components/store/CartDrawerNew';
import PopupLeadHook from '@/components/ui/PopupLeadHook';
import PartnerNetworkAds from '@/components/ui/PartnerNetworkAds';
import { motion } from 'framer-motion';
import { useCart } from '@/components/CartContext';

import { useSearchParams, useParams } from 'react-router-dom';
import LandingPage from './LandingPage'; // Importación de Landing Pública

export default function Home() {
  const [searchParams] = useSearchParams();
  const { id_comercio: paramId } = useParams();

  // LÓGICA STRICTA: Prioridad a ruta dinámica, luego query params
  const id_comercio = paramId || searchParams.get('id_comercio') || searchParams.get('id');
  const { openDrawer, addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);

  // Si no hay ID de comercio, mostramos la Landing Page de la plataforma
  // Esto evita pantallas rotas o defaults hardcodeados en preview/dev
  if (!id_comercio) {
    return <LandingPage />;
  }

  // 1. Carga unificada (Reflejo de DB)
  const { data: paginaData, isLoading } = useQuery({
    queryKey: ['pagina-inicio', id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerPaginaInicio', {
        id_comercio
      });
      return response.data?.data || response.data; // Manejo de diferentes estructuras de respuesta
    },
    enabled: !!id_comercio, // Solo ejecutar si hay ID
  });

  const { comercio, combos, destacados, productosPorCategoria, resenasDestacadas, sorteo, identidad, anunciosRed } = paginaData || {};

  // Persistencia de Identidad para Tracking de Intereses
  useEffect(() => {
    if (identidad?.cliente?.id) {
      localStorage.setItem('cliente_id', identidad.cliente.id);
    }
  }, [identidad]);

  // 2. Exit Intent mejorado
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitIntentTriggered) {
        setPopupOpen(true);
        setExitIntentTriggered(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntentTriggered]);

  // 3. Filtrado seguro
  const productosFiltrados = productosPorCategoria ? Object.entries(productosPorCategoria).reduce((acc, [categoria, productos]) => {
    const filtered = productos.filter(p =>
      p.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) acc[categoria] = filtered;
    return acc;
  }, {}) : {};

  if (isLoading) return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
      <Flame className="text-orange-600 animate-pulse mb-4" size={50} />
      <h2 className="text-orange-500 font-black tracking-tighter italic uppercase">Encendiendo los carbones...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-orange-600/50">
      <PartnerNetworkAds anuncios={anunciosRed} />

      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-30 scale-110 grayscale-[0.3]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-orange-500 font-black text-xs uppercase tracking-[0.4em] mb-4 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
              Herrería de Autor • Rosario
            </span>
            <h1 className="text-7xl md:text-[10rem] font-black leading-[0.8] mb-8 tracking-tighter italic uppercase">
              Pasión <br /> <span className="text-orange-600">Fierrera</span>
            </h1>

            <div className="max-w-2xl mx-auto relative mt-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input
                type="text"
                placeholder="BUSCAR PARRILLAS, FOCORES O ACCESORIOS..."
                className="w-full h-20 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl pl-16 pr-8 text-xl font-bold uppercase italic focus:border-orange-600 outline-none transition-all placeholder:text-neutral-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CUERPO DE LA TIENDA */}
      <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">

        {/* COMBOS DESTACADOS */}
        {combos?.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-1 bg-neutral-900"></div>
              <h2 className="text-3xl font-black italic uppercase text-orange-600 flex items-center gap-3">
                <Package size={32} /> Combos Listos
              </h2>
              <div className="h-px flex-1 bg-neutral-900"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {combos.map((prod) => (
                <ProductCard
                  key={prod.id}
                  producto={prod}
                  onAddToCart={() => { addItem(prod); openDrawer(); }}
                />
              ))}
            </div>
          </section>
        )}

        {/* REPETIR PARA OTRAS CATEGORÍAS */}
        {Object.entries(productosFiltrados).map(([categoria, productos]) => (
          <section key={categoria}>
            <h2 className="text-2xl font-black uppercase italic mb-10 border-l-4 border-orange-600 pl-6">
              {categoria}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {productos.map((prod) => (
                <ProductCard
                  key={prod.id}
                  producto={prod}
                  onAddToCart={() => { addItem(prod); openDrawer(); }}
                />
              ))}
            </div>
          </section>
        ))}

        {/* RESEÑAS REALES (Reflejo de DB) */}
        {resenasDestacadas?.length > 0 && (
          <section className="bg-neutral-900/30 rounded-[3rem] p-12 border border-neutral-800">
            <ReviewSlider resenas={resenasDestacadas} />
          </section>
        )}
      </main>

      <CartDrawerNew />
      <PopupLeadHook
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        comercio={comercio}
        sorteo={sorteo}
      />

      {/* Floating CTA */}
      <a
        href={`https://wa.me/${comercio?.whatsapp || '5493410000000'}`}
        className="fixed bottom-10 right-10 bg-green-600 hover:bg-green-500 p-5 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-110 z-50 group"
      >
        <MessageCircle fill="white" className="text-green-600" size={28} />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          ¿DUDAS CON TU PARRILLA?
        </span>
      </a>


    </div>
  );
}
