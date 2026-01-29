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

  // Filtrar 'adminSupreme' para que no se genere automáticamente con el Layout estándar
  const standardPages = Object.entries(Pages).filter(([path]) => path !== 'adminSupreme');

  return (
    <Routes>
      {/* RUTA SUPREMA (Aislada, sin Layout de Tienda, Carga Rápida) */}
      <Route path="/adminSupreme" element={<Pages.adminSupreme />} />

      {/* RUTAS DINÁMICAS DE TIENDA (SEO Friendly) */}
      <Route path="/tienda/:commerce_code" element={
        <LayoutWrapper currentPageName="home">
          <Pages.home />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:commerce_code/checkout" element={
        <LayoutWrapper currentPageName="checkout">
          <Pages.checkout />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:commerce_code/producto" element={
        <LayoutWrapper currentPageName="producto">
          <Pages.producto />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:commerce_code/confirmacion" element={
        <LayoutWrapper currentPageName="confirmacion">
          <Pages.confirmacion />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:commerce_code/terminos" element={
        <LayoutWrapper currentPageName="terminos">
          <Pages.terminos />
        </LayoutWrapper>
      } />
      <Route path="/tienda/:commerce_code/devolucion" element={
        <LayoutWrapper currentPageName="devolucion">
          <Pages.devolucion />
        </LayoutWrapper>
      } />

      {/* Ruta Principal dinamicamente desde pagesConfig */}
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />

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

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        {/* El CartProvider envuelve al Router para que el Layout tenga acceso al carrito */}
        <CartProvider>
          <Router>
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
