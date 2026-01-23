import React from 'react';
import { useCart } from '@/components/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function CartDrawerNew() {
  const {
    cartItems, removeItem, updateQuantity, total,
    isDrawerOpen, closeDrawer
  } = useCart();
  const navigate = useNavigate();

  const handleIrACheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
      <SheetContent className="w-full sm:max-w-md bg-neutral-950 border-neutral-800 text-white p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-neutral-900">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-2xl font-black uppercase italic flex items-center gap-2 text-white">
              <ShoppingBag className="text-orange-600" /> Tu Pedido
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeDrawer} className="text-neutral-500 hover:text-white">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          {cartItems.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center">
                <Flame className="w-10 h-10 text-neutral-800" />
              </div>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">El carrito está vacío</p>
              <Button onClick={closeDrawer} variant="link" className="text-orange-600 font-black">
                EMPEZÁ A COMPRAR
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative w-24 h-24 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                    <img
                      src={item.imagen_principal || item.imagen || '/placeholder-grill.jpg'}
                      alt={item.titulo}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-black uppercase text-sm leading-tight">{item.titulo}</h4>
                      <p className="text-orange-500 font-black mt-1">
                        ${Number(item.precio_estandar || item.precio).toLocaleString('es-AR')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="p-1 hover:text-orange-500 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="p-1 hover:text-orange-500 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <SheetFooter className="p-6 bg-neutral-900 border-t border-neutral-800 flex-col sm:flex-col space-y-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <Separator className="bg-neutral-800" />
              <div className="flex justify-between items-end">
                <span className="font-black uppercase italic text-lg">Total</span>
                <span className="text-3xl font-black text-orange-600">${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <Button
              onClick={handleIrACheckout}
              className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black text-xl rounded-2xl group"
            >
              INICIAR COMPRA
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-[10px] text-center text-neutral-500 uppercase font-bold tracking-tighter">
              Los descuentos por transferencia se aplican en el siguiente paso
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}