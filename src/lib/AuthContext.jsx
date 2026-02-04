import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // --- Super Admin Auth ---
  const [superAdmin, setSuperAdmin] = useState(null);
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState(false);
  const [isLoadingSuperAdmin, setIsLoadingSuperAdmin] = useState(false);

  // --- Commerce Auth ---
  const [commerce, setCommerce] = useState(null);
  const [commerceToken, setCommerceToken] = useState(localStorage.getItem('commerce_token'));
  const [isCommerceAuthenticated, setIsCommerceAuthenticated] = useState(!!localStorage.getItem('commerce_token'));
  const [isLoadingCommerce, setIsLoadingCommerce] = useState(false);

  // --- Standard User Auth (Base44) ---
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // --- App Settings ---
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  // Initial Load - Check for existing sessions
  useEffect(() => {
    const initAuth = async () => {
      // Check Super Admin token
      const superAdminToken = localStorage.getItem('superadmin_token');
      if (superAdminToken) {
        await refreshSuperAdminSession(superAdminToken);
      }

      // Check Commerce token
      const commerceToken = localStorage.getItem('commerce_token');
      if (commerceToken) {
        await refreshCommerceSession(commerceToken);
      }
    };

    initAuth();
  }, []);

  // --- Super Admin Auth Methods ---
  const loginSuperAdmin = async (email, password) => {
    setIsLoadingSuperAdmin(true);
    try {
      const response = await base44.functions.invoke('loginSuperAdmin', { email, password });

      if (response.data && response.data.success) {
        const { session, superAdmin: adminData } = response.data;
        localStorage.setItem('superadmin_token', session.token);
        localStorage.setItem('superadmin_data', JSON.stringify(adminData));
        setSuperAdmin(adminData);
        setIsSuperAdminAuthenticated(true);
        setIsLoadingSuperAdmin(false);
        return { success: true };
      } else {
        throw new Error(response.data?.error || 'Login de Super Admin fallido');
      }
    } catch (error) {
      console.error("Super Admin Login Error:", error);
      setIsLoadingSuperAdmin(false);
      return { success: false, error: error.message };
    }
  };

  const logoutSuperAdmin = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_data');
    setSuperAdmin(null);
    setIsSuperAdminAuthenticated(false);
    window.location.href = '/';
  };

  const refreshSuperAdminSession = async (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem('superadmin_token');
    if (!token) {
      setSuperAdmin(null);
      setIsSuperAdminAuthenticated(false);
      setIsLoadingSuperAdmin(false);
      return;
    }

    setIsLoadingSuperAdmin(true);
    try {
      const response = await base44.functions.invoke('validarSuperAdmin', { token });
      const data = response.data || response;

      if (data.success && data.superAdmin) {
        setSuperAdmin(data.superAdmin);
        setIsSuperAdminAuthenticated(true);
      } else {
        logoutSuperAdmin();
      }
    } catch (err) {
      console.error("Super Admin Session Refresh Error:", err);
      logoutSuperAdmin();
    } finally {
      setIsLoadingSuperAdmin(false);
    }
  };

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
      console.error("Commerce Session Refresh Error:", err);
      logoutComercio();
    } finally {
      setIsLoadingCommerce(false);
    }
  };

  // --- Standard User Auth Methods (Base44) ---
  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const endpoint = `/api/apps/public/prod/public-settings/by-id/${appParams.appId}`;
      const response = await fetch(endpoint, {
        headers: {
          'X-App-Id': appParams.appId,
          'Authorization': appParams.token ? `Bearer ${appParams.token}` : undefined
        }
      });

      if (!response.ok) {
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

  // Global loading state - true if ANY auth is loading
  const isLoadingAnyAuth = isLoadingSuperAdmin || isLoadingCommerce || isLoadingAuth;

  return (
    <AuthContext.Provider value={{
      // Super Admin
      superAdmin,
      isSuperAdminAuthenticated,
      isLoadingSuperAdmin,
      loginSuperAdmin,
      logoutSuperAdmin,
      refreshSuperAdminSession,

      // Commerce
      commerce,
      commerceToken,
      isCommerceAuthenticated,
      isLoadingCommerce,
      loginComercio,
      logoutComercio,
      refreshCommerceSession,

      // Standard User (Base44)
      user,
      isAuthenticated,
      isLoadingAuth,
      checkAppState,
      logout,

      // App Settings
      isLoadingPublicSettings,
      authError,
      appPublicSettings,

      // Global
      isLoadingAnyAuth,
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
