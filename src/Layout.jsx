import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, User, Menu, X, Flame, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
// IMPORTANTE: Ya no importamos CartProvider aquí porque lo maneja el App.js
import CartDrawerNew from '@/components/store/CartDrawerNew';
import CartButton from '@/components/CartButton'; 

const getPageNameFromPath = (pathname) => {
  const path = pathname.toLowerCase();
  if (path.includes('/admin')) return 'AdminPanel';
  if (path.includes('/checkout')) return 'Checkout';
  if (path.includes('/producto')) return 'Producto';
  if (path.includes('/terminos')) return 'TerminosYCondiciones';
  if (path.includes('/devolucion')) return 'PoliticaDevolucion';
  return 'Home';
};

export default function Layout({ children }) {
  const location = useLocation();
  const currentPageName = getPageNameFromPath(location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Verificamos si es página de admin para el estilo
  const isAdminPage = currentPageName === 'AdminPanel';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      }
    };
    loadUser();
  }, [location.pathname]);

  const handleLogout = () => {
    base44.auth.logout();
    window.location.reload();
  };

  return (
    <>
      <CartDrawerNew /> 

      <div className={`min-h-screen flex flex-col ${isAdminPage ? 'bg-neutral-900' : 'bg-neutral-950'} text-neutral-100 selection:bg-orange-600/30`}>
        
        {/* Header Estilo Premium */}
        <header className="bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo: Fuego y Hierro */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl text-white tracking-tighter leading-none uppercase italic">Pasión</span>
                  <span className="font-bold text-[10px] text-orange-500 tracking-[0.3em] uppercase leading-none mt-1">Fierrera</span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-xl text-sm font-black uppercase italic tracking-widest transition-all ${
                    currentPageName === 'Home' ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Catálogo
                </Link>

                <div className="h-6 w-px bg-neutral-800 mx-2" />

                <CartButton />

                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-neutral-800/50 border border-neutral-700 pl-3 pr-1 py-1 rounded-full">
                      <span className="text-xs font-bold uppercase text-neutral-400 tracking-tighter">
                        {user.full_name?.split(' ')[0] || 'Maestro'}
                      </span>
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-xs font-black text-white">
                         {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </div>
                    </div>
                    
                    {(user.role === 'admin' || isAdminPage) && (
                      <Link to="/admin" className="p-2 text-neutral-500 hover:text-orange-500 transition-colors">
                        <LayoutDashboard size={20} />
                      </Link>
                    )}

                    <button onClick={handleLogout} className="p-2 text-neutral-600 hover:text-red-500 transition-colors">
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="text-neutral-400 hover:text-white hover:bg-neutral-800 font-bold uppercase text-xs tracking-widest"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Ingresar
                  </Button>
                )}
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-800 bg-neutral-900 p-6 space-y-4 animate-in slide-in-from-top">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-800 text-white font-black uppercase italic"
              >
                <Home size={20} className="text-orange-600" />
                Catálogo
              </Link>
              {!user && (
                <Button className="w-full bg-orange-600 font-black italic uppercase rounded-2xl" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
                  Iniciar Sesión
                </Button>
              )}
            </div>
          )}
        </header>

        {/* Contenido Principal */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer Reforzado */}
        {!isAdminPage && (
          <footer className="bg-neutral-950 border-t border-neutral-900 py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex items-center gap-3 opacity-50 grayscale">
                  <Flame className="text-white" />
                  <span className="font-black uppercase italic text-xl">Pasión Fierrera</span>
                </div>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                  <Link to="/terminos" className="hover:text-orange-500 transition-colors">Términos</Link>
                  <Link to="/devolucion" className="hover:text-orange-500 transition-colors">Devoluciones</Link>
                  <Link to="/contacto" className="hover:text-orange-500 transition-colors">Contacto</Link>
                </div>
              </div>
              <p className="text-center text-neutral-800 text-[10px] font-bold uppercase tracking-widest">
                © 2026 Herrería Artesanal. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}