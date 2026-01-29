/**
 * CONFIGURACIÓN DE PÁGINAS Y RUTAS - BASE44
 * 
 * Roles definidos:
 * - "adminSupreme": Panel Global (Solo SuperAdmin: 14349463-549c-4bf9-b223-95b058a7493a)
 * - "merchant": Panel de Comercio (Todo usuario autenticado)
 * 
 * Entry Point:
 * - "home": Controla Landing vs Tienda según ?id= en la URL
 */

import AdminPanel from './pages/AdminPanel'; // Legacy/Reference
import Checkout from './pages/Checkout';
import MerchantRegister from './pages/MerchantRegister';
import Confirmacion from './pages/Confirmacion';
import Home from './pages/Home';
import PoliticaDevolucion from './pages/PoliticaDevolucion';
import Producto from './pages/Producto';
import TerminosYCondiciones from './pages/TerminosYCondiciones';
import LandingPage from './pages/LandingPage';
import __Layout from './Layout.jsx';

import AdminSupremePanel from './pages/AdminSupremePanel';
import MerchantDashboard from './pages/MerchantDashboard';

export const PAGES = {
    "adminSupreme": AdminSupremePanel,
    "merchant": AdminPanel,
    "checkout": Checkout,
    "confirmacion": Confirmacion,
    "registro": MerchantRegister,
    "home": Home,
    "devolucion": PoliticaDevolucion,
    "producto": Producto,
    "terminos": TerminosYCondiciones,
    "landing": LandingPage,
}

export const pagesConfig = {
    mainPage: "home",
    Pages: PAGES,
    Layout: __Layout,
};
