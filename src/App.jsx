import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ProtectedCommerceRoute, ProtectedSuperAdminRoute } from '@/components/ProtectedRoute';

// IMPORTANTE: El motor del carrito
import { CartProvider } from "@/components/CartContext";


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Pantalla de carga oficial de Base44
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Manejo de errores de Auth
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Filtrar 'adminSupreme' y 'registro' para que no se generen automáticamente con el Layout estándar
  // Filtrar 'adminSupreme', 'adminpanel' y 'registro' para que no se generen automáticamente
  const standardPages = Object.entries(Pages).filter(([path]) =>
    path !== 'adminSupreme' && path !== 'adminpanel' && path !== 'merchant' && path !== 'registro'
  );

  return (
    <Routes>
      {/* RUTAS DE SUPER ADMINISTRADOR (PROTEGIDAS) */}
      <Route
        path="/admin-supreme"
        element={
          <ProtectedSuperAdminRoute>
            <Pages.adminSupreme />
          </ProtectedSuperAdminRoute>
        }
      />

      {/* RUTAS DE PANEL DE COMERCIO (PROTEGIDAS) */}
      <Route
        path="/adminpanel"
        element={
          <ProtectedCommerceRoute>
            <Pages.adminpanel />
          </ProtectedCommerceRoute>
        }
      />

      {/* RUTAS DINÁMICAS DE TIENDA (SEO Friendly) */}
      {/* RUTAS DINÁMICAS DE TIENDA (SEO Friendly) */}
      <Route path="/tienda/:id_comercio" element={
        <LayoutWrapper currentPageName="home">
          <Pages.home />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:id_comercio/checkout" element={
        <LayoutWrapper currentPageName="checkout">
          <Pages.checkout />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:id_comercio/producto" element={
        <LayoutWrapper currentPageName="producto">
          <Pages.producto />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:id_comercio/confirmacion" element={
        <LayoutWrapper currentPageName="confirmacion">
          <Pages.confirmacion />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:id_comercio/terminos" element={
        <LayoutWrapper currentPageName="terminos">
          <Pages.terminos />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:id_comercio/devolucion" element={
        <LayoutWrapper currentPageName="devolucion">
          <Pages.devolucion />
        </LayoutWrapper>
      } />

      {/* Ruta Principal dinamicamente desde pagesConfig */}
      <Route path="/" element={<MainPage />} />

      {/* RUTA DE REGISTRO (Sin Layout de Tienda) */}
      <Route path="/registro" element={<Pages.registro />} />

      {/* Mapeo automático de todas las páginas ESTÁNDAR (Con Layout de Tienda) */}
      {standardPages.map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getClientId, trackEvent } from '@/lib/tracking';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Ensure ID exists
    getClientId();

    // 2. Track Page View
    // Intentamos deducir el id_comercio de la URL
    const pathParts = location.pathname.split('/');
    const idComercioIdx = pathParts.indexOf('tienda');
    const id_comercio = idComercioIdx !== -1 && pathParts[idComercioIdx + 1] ? pathParts[idComercioIdx + 1] : null;

    trackEvent({
      event_type: 'navigation',
      event_name: 'page_view',
      id_comercio: id_comercio,
      payload: {
        path: location.pathname,
        search: location.search
      }
    });

  }, [location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        {/* El CartProvider envuelve al Router para que el Layout tenga acceso al carrito */}
        <CartProvider>
          <Router>
            <PageTracker />
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
