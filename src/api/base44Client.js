import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Cliente oficial de Base44
export const base44 = createClient({
  appId,
  token: token || null,
  functionsVersion,
  serverUrl: appBaseUrl || "https://app.base44.com/api"
});

// Definición de Entidades para uso tipado/estructurado en la app
// (Agrega aquí las que necesites)
base44.entities = {
  ...base44.entities,
  // Ejemplo de cómo se suelen estructurar si el SDK lo requiere explicitamente o como helpers
  Lead: base44.entity('Lead'),
  Sorteo: base44.entity('Sorteo'),
  Producto: base44.entity('Producto'),
  Configuracion: base44.entity('ConfiguracionGlobal'),
  GastoPublicitario: base44.entity('GastoPublicitario'),
  Cupon: base44.entity('Cupon')
};

// Helper de Autenticación (para usar en botones, no automático)
export const loginGoogle = () => {
  // Redirige al proveedor Google y vuelve a la misma URL
  base44.auth.loginWithProvider('google', window.location.pathname);
};

export const logout = async () => {
  await base44.auth.logout();
  window.location.reload();
};




