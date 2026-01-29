import React from 'react';
import { AlertTriangle, Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComponenteEscasez({ stock, umbral = 5 }) {
  if (!stock || stock > umbral) return null;
  
  const esUltimoStock = stock <= 2;
  const esStockBajo = stock <= umbral && stock > 2;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
        ${esUltimoStock 
          ? 'bg-red-50 border border-red-200 text-red-700' 
          : 'bg-orange-50 border border-orange-200 text-orange-700'
        }
      `}
    >
      {esUltimoStock ? (
        <>
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="font-bold">¡Últimas {stock} unidades!</span>
          <span className="text-xs ml-1">Se agotan rápido</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-5 h-5" />
          <span>Quedan solo {stock} en stock</span>
          <Clock className="w-4 h-4 ml-2" />
          <span className="text-xs">Alta demanda</span>
        </>
      )}
    </motion.div>
  );
}