import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, TrendingUp } from 'lucide-react';

export default function PartnerNetworkAds({ anuncios }) {
    if (!anuncios || anuncios.length === 0) return null;

    // Dividimos en Izquierda y Derecha (3 y 3)
    const leftAds = anuncios.slice(0, 3);
    const rightAds = anuncios.slice(3, 6);

    const AdCard = ({ ad, side }) => {
        // Calculamos una URL de tienda basada en el commerce_code del producto
        const storeUrl = `/tienda/${ad.commerce_code || ad.id_comercio}`;

        return (
            <motion.div
                initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="group relative bg-neutral-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-3 mb-4 hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] overflow-hidden"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 overflow-hidden border border-white/10 shrink-0">
                        <img
                            src={ad.imagen_principal || ad.fotos?.[0]?.url || 'https://via.placeholder.com/150'}
                            alt={ad.titulo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-tighter truncate">
                            {ad.categoria_negocio || 'Socio Recomendado'}
                        </h4>
                        <p className="text-[11px] font-bold text-white truncate leading-tight">
                            {ad.titulo}
                        </p>
                        <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-neutral-500 hover:text-white flex items-center gap-1 mt-1 transition-colors"
                        >
                            Visitar Tienda <ExternalLink size={8} />
                        </a>
                    </div>
                </div>

                {/* Badge Sutil */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                </div>
            </motion.div>
        );
    };

    return (
        <>
            {/* Desktop Sidebars */}
            <div className="hidden xl:block">
                {/* Left Sidebar */}
                <div className="fixed left-6 top-1/2 -translate-y-1/2 w-56 z-40">
                    <div className="mb-4 flex items-center gap-2 px-2">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Nuestra Red</span>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    {leftAds.map((ad, i) => <AdCard key={i} ad={ad} side="left" />)}
                </div>

                {/* Right Sidebar */}
                <div className="fixed right-6 top-1/2 -translate-y-1/2 w-56 z-40">
                    <div className="mb-4 flex items-center gap-2 px-2">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Recomendados</span>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    {rightAds.map((ad, i) => <AdCard key={i} ad={ad} side="right" />)}
                </div>
            </div>

            {/* Mobile / Tablet: Floating Section at Bottom of main content instead of fixed sidebars */}
            <div className="xl:hidden max-w-7xl mx-auto px-6 mt-20 mb-10">
                <div className="flex items-center gap-4 mb-8">
                    <TrendingUp className="text-purple-500" size={24} />
                    <h2 className="text-xl font-black uppercase italic text-white">Socios de Confianza</h2>
                    <div className="h-px flex-1 bg-neutral-900"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {anuncios.slice(0, 4).map((ad, i) => (
                        <a
                            key={i}
                            href={`/tienda/${ad.commerce_code || ad.id_comercio}`}
                            className="flex items-center gap-4 bg-neutral-900 border border-white/5 p-4 rounded-3xl hover:border-purple-500 transition-all"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-neutral-800 overflow-hidden border border-white/10 shrink-0">
                                <img src={ad.imagen_principal || ad.fotos?.[0]?.url} alt={ad.titulo} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-purple-400 uppercase">{ad.categoria_negocio}</h4>
                                <p className="text-sm font-black text-white">{ad.titulo}</p>
                                <p className="text-[10px] text-neutral-500 mt-1">Hacer clic para ver más</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}
