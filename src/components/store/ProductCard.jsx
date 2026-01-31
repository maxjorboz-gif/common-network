import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function ProductCard(props) {
  const { producto, onAddToCart } = props;
  const precio = Number(producto.precio_estandar || producto.precio || 0);
  const tieneDescuento = producto.precio_oferta && producto.precio_oferta < precio;

  return (
    <div className="group relative bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden transition-all hover:border-orange-600/50 hover:shadow-[0_0_40px_rgba(234,88,12,0.1)]">
      {/* Badge de Stock / Oferta */}
      {producto.stock <= 3 && producto.stock > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
          Últimas {producto.stock} unidades
        </div>
      )}

      {/* Imagen con Overlay de acciones */}
      <div className="relative aspect-square overflow-hidden bg-neutral-800">
        <img
          src={producto.imagen_principal || producto.imagen || '/placeholder-grill.jpg'}
          alt={producto.titulo}
          className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link to={`${createPageUrl('producto')}?id=${producto.id}`}>
            <Button size="icon" className="rounded-full bg-white text-black hover:bg-orange-600 hover:text-white">
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            size="icon"
            onClick={() => onAddToCart(producto)}
            className="rounded-full bg-orange-600 text-white hover:bg-white hover:text-black"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Info del Producto */}
      <div className="p-6 space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
          <Flame size={12} fill="currentColor" />
          {producto.categoria || 'Herrería Premium'}
        </div>

        <h3 className="font-black text-xl uppercase italic leading-none truncate">
          {producto.titulo}
        </h3>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-black text-white">
            ${(tieneDescuento ? producto.precio_oferta : precio).toLocaleString('es-AR')}
          </span>
          {tieneDescuento && (
            <span className="text-sm text-neutral-600 line-through">
              ${precio.toLocaleString('es-AR')}
            </span>
          )}
        </div>

        <Button
          onClick={() => onAddToCart(producto)}
          variant="outline"
          className="w-full mt-4 border-neutral-800 text-neutral-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 font-bold rounded-xl transition-all"
        >
          AÑADIR AL CARRITO
        </Button>
      </div>
    </div>
  );
}