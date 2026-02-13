import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Creamos el cliente usando la URL oficial del motor regional (app.base44.com)
export const base44 = createClient({
  appId: appId |
    token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl: appBaseUrl || 'https://app.base44.com'
});