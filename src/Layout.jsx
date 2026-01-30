import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, X, Flame, LayoutDashboard } from 'lucide-react';
import CartDrawerNew from '@/components/store/CartDrawerNew';
import CartButton from '@/components/CartButton';
import { useAuth } from '@/lib/AuthContext';

const getPageNameFromPath = (pathname) => {
  const path = pathname.toLowerCase();
  if (path === '/' || path === '/landing') return 'Landing';
  if (path.includes('/home')) return 'Home';
  if (path.includes('/admin')) return 'AdminPanel';
  if (path.includes('/checkout')) return 'Checkout';
  if (path.includes('/producto')) return 'Producto';
  return 'Home';
};

export default function Layout({ children }) {
  const location = useLocation();
  const currentPageName = getPageNameFromPath(location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Consumo pasivo del contexto: solo leemos si hay comercio auth, no bloqueamos nada.
  const { isCommerceAuthenticated, commerce } = useAuth();

  const isAdminPage = currentPageName === 'AdminPanel';
  const isLandingPage = currentPageName === 'Landing';

  return (
    <>
      <CartDrawerNew />

      <div className={`min-h-screen flex flex-col ${isAdminPage ? 'bg-neutral-900' : 'bg-neutral-950'} text-neutral-100 selection:bg-orange-600/30`}>

        {/* Header Estilo Premium */}
        <header className="bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">

              {/* Logo Dinámico */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className={`w-12 h-12 bg-gradient-to-br ${isLandingPage ? 'from-orange-400 to-orange-600' : 'from-orange-600 to-red-800'} rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform`}>
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl text-white tracking-tighter leading-none uppercase italic">
                    {isLandingPage ? 'Common' : 'Pasión'}
                  </span>
                  <span className="font-bold text-[10px] text-orange-500 tracking-[0.3em] uppercase leading-none mt-1">
                    {isLandingPage ? 'Network' : 'Fierrera'}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">

                {/* Si estamos autenticados como comercio, mostramos acceso directo al panel */}
                {isCommerceAuthenticated && (
                  <Link
                    to="/adminpanel"
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mi Panel
                  </Link>
                )}

                {isLandingPage && !isCommerceAuthenticated && (
                  <Link
                    to="/registro"
                    className={`px-4 py-2 rounded-xl text-sm font-black uppercase italic tracking-widest transition-all text-neutral-400 hover:text-white`}
                  >
                    Vender
                  </Link>
                )}

                <div className="h-6 w-px bg-neutral-800 mx-2" />
                {!isLandingPage && <CartButton />}

              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-2xl bg-neutral-800 text-neutral-400"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1">
          {children}
        </main>

        {!isAdminPage && (
          <footer className="bg-neutral-950 border-t border-neutral-900 py-16">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-neutral-800 text-[10px] font-bold uppercase tracking-widest">
                © 2026 Common Network. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}