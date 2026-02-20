import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const addItem = (producto) => {
        setCartItems(prev => {
            const exists = prev.find(i => i.id === producto.id);
            if (exists) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const removeItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

    const updateQty = (id, cantidad) => {
        if (cantidad <= 0) { removeItem(id); return; }
        setCartItems(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i));
    };

    const clearCart = () => setCartItems([]);

    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    const total = cartItems.reduce((sum, i) => sum + (i.precio_estandar || 0) * i.cantidad, 0);

    return (
        <CartContext.Provider value={{ cartItems, total, addItem, removeItem, updateQty, clearCart, drawerOpen, openDrawer, closeDrawer }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}