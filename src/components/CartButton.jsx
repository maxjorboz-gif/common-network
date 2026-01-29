import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/CartContext';

export default function CartButton() {
  const { openDrawer, cartItems } = useCart();
  const itemCount = cartItems?.length || 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openDrawer}
      className="text-neutral-400 hover:text-white hover:bg-neutral-800 relative"
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}