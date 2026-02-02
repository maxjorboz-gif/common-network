import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { commerceClient } from '@/api/commerceApiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Standard User Auth (Base44) ---
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // --- Commerce Auth (Custom Internal) ---
  const [commerce, setCommerce] = useState(null);
  const [commerceToken, setCommerceToken] = useState(localStorage.getItem('commerce_token'));
  const [isCommerceAuthenticated, setIsCommerceAuthenticated] = useState(!!localStorage.getItem('commerce_token'));
  const [isLoadingCommerce, setIsLoadingCommerce] = useState(false);

  // --- App Settings ---
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  // Initial Load - Check for existing sessions without blocking
  useEffect(() => {
    // 1. Recover Commerce Session if token exists
    const storedToken = localStorage.getItem('commerce_token');
    if (storedToken) {
      refreshCommerceSession(storedToken);
    }

    // 2. We can lazily check standard user auth if needed, 
    // but we respect the "passive" requirement by default.
  }, []);

  // --- Commerce Auth Methods ---

  const loginComercio = async (email, password) => {
    setIsLoadingCommerce(true);
    try {
      const response = await base44.functions.invoke('loginComercio', { email, password });

      if (response.data && response.data.success) {
        const { session, commerce } = response.data;

        // Save source of truth
        localStorage.setItem('commerce_token', session.token);
        localStorage.setItem('commerce_data', JSON.stringify(commerce)); // Fast retrieval

        setCommerceToken(session.token);
        setCommerce(commerce);
        setIsCommerceAuthenticated(true);
        setIsLoadingCommerce(false);
        return { success: true };
      } else {
        throw new Error(response.data?.error || 'Login fallido');
      }
    } catch (error) {
      console.error("Commerce Login Error:", error);
      setIsLoadingCommerce(false);
      return { success: false, error: error.message };
    }
  };

  const logoutComercio = () => {
    localStorage.removeItem('commerce_token');
    localStorage.removeItem('commerce_data');
    setCommerce(null);
    setCommerceToken(null);
    setIsCommerceAuthenticated(false);
    // Optional: Redirect to home or login
    window.location.href = '/';
  };

  const refreshCommerceSession = async (tokenOverride) => {
    const token = tokenOverride || commerceToken;
    if (!token) return;

    setIsLoadingCommerce(true);
    try {
      // USANDO CLIENTE PROFESIONAL: commerceClient
      // Centraliza headers, auth y manejo de errores.
      const data = await commerceClient.post('obtenerDatosComercio', {});

      if (data.success && data.comercio) {
        setCommerce(data.comercio);
        setIsCommerceAuthenticated(true);
      } else {
        // Token invalid 
        logoutComercio();
      }
    } catch (err) {
      console.error("Session Refresh Error:", err);
      // Don't auto-logout on network error, only on auth invalid
      if (err.status === 401 || err.status === 403) {
        logoutComercio();
      }
    } finally {
      setIsLoadingCommerce(false);
    }
  };


  // --- Standard User Auth Methods (Legacy / SuperAdmin) ---

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: { 'X-App-Id': appParams.appId },
        token: appParams.token,
        interceptResponses: true
      });

      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);

        if (appParams.token) {
          await checkUserAuth();
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        // ... Error handling preserved ...
        console.error('App state check failed:', appError);
        setIsLoadingPublicSettings(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsLoadingPublicSettings(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout();
  };

  return (
    <AuthContext.Provider value={{
      // Standard User
      user,
      isAuthenticated,
      isLoadingAuth,
      checkAppState,
      logout,

      // Commerce User
      commerce,
      commerceToken,
      isCommerceAuthenticated,
      isLoadingCommerce,
      loginComercio,
      logoutComercio,
      refreshCommerceSession,

      // Global
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


