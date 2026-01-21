import AdminPanel from './pages/AdminPanel';
import Checkout from './pages/Checkout';
import MerchantRegister from './pages/MerchantRegister';
import Confirmacion from './pages/Confirmacion';
import Home from './pages/Home';
import PoliticaDevolucion from './pages/PoliticaDevolucion';
import Producto from './pages/Producto';
import TerminosYCondiciones from './pages/TerminosYCondiciones';
import __Layout from './Layout.jsx';


export const PAGES = {
    "admin": AdminPanel,
    "checkout": Checkout,
    "confirmacion": Confirmacion,
    "registro": MerchantRegister,
    "home": Home,
    "devolucion": PoliticaDevolucion,
    "producto": Producto,
    "terminos": TerminosYCondiciones,
}

export const pagesConfig = {
    mainPage: "home",
    Pages: PAGES,
    Layout: __Layout,
};
