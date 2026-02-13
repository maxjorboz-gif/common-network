import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ShoppingCart, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/components/CartContext';

export default function MarketingPromoToast({ producto, comercio }) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
    const navigate = useNavigate();
    const { addItem, openDrawer } = useCart();

    useEffect(() => {
        if (!producto || !producto.promo_flash_activa) return;

        // Timer para que aparezca después del delay configurado
        const appearanceTimer = setTimeout(() => {
            setIsVisible(true);
        }, (producto.promo_flash_delay || 20) * 1000);

        return () => clearTimeout(appearanceTimer);
    }, [producto]);

    useEffect(() => {
        if (!isVisible) return;

        // Timer de cuenta regresiva de la oferta (5 min)
        const countdown = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(countdown);
    }, [isVisible]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAprovechar = () => {
        // 1. Agregar al carrito
        addItem(producto);
        // 2. Ir directo al checkout
        const checkoutUrl = `/checkout/${comercio.commerce_code || comercio.id_comercio}?id=${producto.id || producto._id}`;
        navigate(checkoutUrl);
    };

    return (
        <AnimatePresence>
            {isVisible && timeLeft > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                    className="fixed bottom-24 right-6 z-[100] max-w-[320px] w-full"
                >
                    <div className="bg-neutral-900 border-2 border-orange-600 rounded-3xl shadow-[0_0_40px_rgba(234,88,12,0.3)] overflow-hidden relative">
                        {/* Header / Barra de tiempo */}
                        <div className="bg-orange-600 h-1.5 w-full">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 300, ease: "linear" }}
                                className="bg-white h-full"
                            />
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-600/20 p-2 rounded-xl border border-orange-500/30">
                                    <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black uppercase italic text-sm leading-tight">
                                        ¡OFERTA RELÁMPAGO!
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                                        <Timer size={10} /> Expira en {formatTime(timeLeft)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-neutral-400 text-xs font-medium leading-relaxed">
                                    Llevate este <span className="text-white font-bold">{producto.titulo}</span> con un:
                                </p>
                                <div className="text-3xl font-black text-white italic">
                                    {producto.promo_flash_descuento}% OFF <span className="text-orange-500 underline underline-offset-4 Decoration-2">SOLO POR HOY</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleAprovechar}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-xl h-12 shadow-lg shadow-orange-600/20"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                LO QUIERO AHORA
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
