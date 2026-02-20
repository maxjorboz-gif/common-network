import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false));
  }, []);

  const isAdminPage = currentPageName === 'AdminPanel';
  const isLandingPage = currentPageName === 'Landing';

  return (
    <div className={`min-h-screen flex flex-col ${isAdminPage ? 'bg-neutral-900' : 'bg-neutral-950'} text-neutral-100 selection:bg-orange-600/30`}>

      <header className="bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            <Link to="/" className="flex items-center gap-3 group" />

            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated && (
                <Link
                  to="/merchant"
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Mi Panel
                </Link>
              )}

              {isLandingPage && !isAuthenticated && (
                <Link
                  to="/registro"
                  className="px-4 py-2 rounded-xl text-sm font-black uppercase italic tracking-widest transition-all text-neutral-400 hover:text-white"
                >
                  Vender
                </Link>
              )}

              <div className="h-6 w-px bg-neutral-800 mx-2" />
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-2xl bg-neutral-800 text-neutral-400"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

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
  );
}