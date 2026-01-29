import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ReviewSlider({ resenas = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-slide cada 5 segundos
  useEffect(() => {
    if (resenas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resenas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [resenas.length]);
  
  if (!resenas || resenas.length === 0) return null;
  
  const resenaActual = resenas[currentIndex];
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % resenas.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + resenas.length) % resenas.length);
  };
  
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
      {/* Quote icon */}
      <Quote className="absolute top-6 left-6 w-12 h-12 text-blue-200" />
      
      <div className="max-w-3xl mx-auto text-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Estrellas */}
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${
                    i < resenaActual.estrellas 
                      ? 'text-amber-400 fill-current' 
                      : 'text-gray-200'
                  }`} 
                />
              ))}
            </div>
            
            {/* Texto */}
            <p className="text-xl md:text-2xl text-gray-700 font-medium mb-6 leading-relaxed">
              "{resenaActual.texto}"
            </p>
            
            {/* Foto si existe */}
            {resenaActual.foto_url && (
              <div className="mb-6">
                <img 
                  src={resenaActual.foto_url} 
                  alt="Reseña" 
                  className="w-24 h-24 object-cover rounded-xl mx-auto shadow-lg"
                />
              </div>
            )}
            
            {/* Autor */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {resenaActual.nombre_cliente?.charAt(0) || 'C'}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  {resenaActual.nombre_cliente || 'Cliente verificado'}
                </p>
                <p className="text-sm text-gray-500">Compra verificada</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navegación */}
        {resenas.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white shadow-lg border-0"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-white shadow-lg border-0"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {resenas.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex 
                      ? 'w-6 bg-blue-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}