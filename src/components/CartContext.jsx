import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('carrito_local');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('carrito_local', JSON.stringify(cartItems));
  }, [cartItems]);

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
