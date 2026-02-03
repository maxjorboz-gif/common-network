import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackEvent } from '@/lib/tracking';
import { useParams } from 'react-router-dom';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Obtener ID del comercio actual de la URL
  // En Next.js o Router modernos usariamos useParams, pero esto es Context global. 
  // Intentamos sacar commerce_code de la URL si es posible para el tracking preciso
  const getIdComercio = () => {
    if (typeof window === 'undefined') return null;
    const pathParts = window.location.pathname.split('/');
    const idx = pathParts.indexOf('tienda');
    return (idx !== -1 && pathParts[idx + 1]) ? pathParts[idx + 1] : null;
  };

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
    // TRACKING
    trackEvent({
      event_type: 'conversion',
      event_name: 'add_to_cart',
      entity_type: 'product',
      entity_id: producto.id,
      id_comercio: getIdComercio(),
      payload: {
        title: producto.titulo,
        price: producto.precio_estandar || producto.precio,
        currency: 'ARS'
      }
    });

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
    // TRACKING - Find item before deleting to track details
    const itemToRemove = cartItems.find(i => i.id === id);
    if (itemToRemove) {
      trackEvent({
        event_type: 'conversion',
        event_name: 'remove_from_cart',
        entity_type: 'product',
        entity_id: id,
        id_comercio: getIdComercio(),
        payload: {
          title: itemToRemove.titulo,
          price: itemToRemove.precio_estandar || itemToRemove.precio
        }
      });
    }

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
