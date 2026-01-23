import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Obtener ID del comercio actual de la URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const currentCommerceId = searchParams.get('id') || 'default';

  const STORAGE_KEY = `carrito_${currentCommerceId}`;

  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update storage whenever cart changes OR commerce ID changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, STORAGE_KEY]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addItem = (producto) => {
    setCartItems((prev) => {
      const idActual = producto.id; // STRICT ID
      const existe = prev.find(item => item.id === idActual);

      if (existe) {
        return prev.map(item =>
          item.id === idActual
            ? { ...item, cantidad: (item.cantidad || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map(item => item.id === id ? { ...item, cantidad } : item)
    );
  };

  const total = cartItems.reduce((acc, item) => {
    const precio = Number(item.precio_estandar || item.precio || 0);
    return acc + (precio * (item.cantidad || 1));
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addItem,
      removeItem,
      updateQuantity,
      total,
      isDrawerOpen,
      openDrawer,
      closeDrawer
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
