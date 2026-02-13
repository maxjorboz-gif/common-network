import AdminPanel from './pages/AdminPanel';
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
import Login from './pages/Login';

export const PAGES = {
    "adminSupreme": AdminSupremePanel,
    "login": Login,
    "merchant": AdminPanel,
    "adminpanel": AdminPanel,
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
