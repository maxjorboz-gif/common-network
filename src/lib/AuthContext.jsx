import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

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
    const storedToken = localStorage.getItem('commerce_token');
    if (storedToken) {
      refreshCommerceSession(storedToken);
    }
  }, []);

  // --- Commerce Auth Methods ---
  const loginComercio = async (email, password) => {
    setIsLoadingCommerce(true);
    try {
      const response = await base44.functions.invoke('loginComercio', { email, password });

      if (response.data && response.data.success) {
        const { session, commerce } = response.data;
        localStorage.setItem('commerce_token', session.token);
        localStorage.setItem('commerce_data', JSON.stringify(commerce));
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
    window.location.href = '/';
  };

  const refreshCommerceSession = async (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem('commerce_token');
    if (!token) {
      setCommerce(null);
      setIsCommerceAuthenticated(false);
      setIsLoadingCommerce(false);
      return;
    }

    setIsLoadingCommerce(true);
    try {
      const response = await base44.functions.invoke('obtenerDatosComercio', { token });
      const data = response.data || response;

      if (data.success && data.comercio) {
        setCommerce(data.comercio);
        setIsCommerceAuthenticated(true);
      } else {
        logoutComercio();
      }
    } catch (err) {
      console.error("Session Refresh Error:", err);
    } finally {
      setIsLoadingCommerce(false);
    }
  };

  // --- Standard User Auth Methods ---
  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // Reemplazo native fetch en lugar de axios-client interno
      const endpoint = `/api/apps/public/prod/public-settings/by-id/${appParams.appId}`;
      const response = await fetch(endpoint, {
        headers: {
          'X-App-Id': appParams.appId,
          'Authorization': appParams.token ? `Bearer ${appParams.token}` : undefined
        }
      });

      if (!response.ok) {
        // Si falla, no bloqueamos, solo logueamos
        console.warn("Public settings check status:", response.status);
      } else {
        const publicSettings = await response.json();
        setAppPublicSettings(publicSettings);
      }

      if (appParams.token) {
        await checkUserAuth();
      }
      setIsLoadingPublicSettings(false);

    } catch (error) {
      console.error('App state check failed:', error);
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
      user, isAuthenticated, isLoadingAuth, checkAppState, logout,
      commerce, commerceToken, isCommerceAuthenticated, isLoadingCommerce,
      loginComercio, logoutComercio, refreshCommerceSession,
      isLoadingPublicSettings, authError, appPublicSettings,
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



