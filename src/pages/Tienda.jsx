import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Search, ShoppingCart, Star, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';

export default function Tienda() {
    // Leer el slug desde la URL: /tienda?slug=mi-tienda o path /tienda/mi-tienda
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').pop();

    const [comercio, setComercio] = useState(null);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');
    const [carrito, setCarrito] = useState([]);
    const [carritoOpen, setCarritoOpen] = useState(false);

    useEffect(() => {
        const loadTienda = async () => {
            if (!slug) { setLoading(false); return; }
            try {
                // Buscar por slug
                const comercios = await base44.entities.Comercio.filter({ slug, activo: true });
                if (comercios.length === 0) { setLoading(false); return; }
                const com = comercios[0];
                setComercio(com);

                const prods = await base44.entities.Producto.filter({ id_comercio: com.id_comercio, activo: true });
                setProductos(prods);
            } catch (err) {
                console.error('Error cargando tienda:', err);
            } finally {
                setLoading(false);
            }
        };
        loadTienda();
    }, [slug]);

    const agregarAlCarrito = (producto) => {
        setCarrito(prev => {
            const existe = prev.find(i => i.id === producto.id);
            if (existe) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const totalCarrito = carrito.reduce((s, i) => s + i.precio_estandar * i.cantidad, 0);

    const categorias = ['Todos', ...new Set(productos.map(p => p.categoria).filter(Boolean))];

    const productosFiltrados = productos.filter(p => {
        const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = categoriaActiva === 'Todos' || p.categoria === categoriaActiva;
        return matchSearch && matchCat;
    });

    const abrirWhatsApp = (producto = null) => {
        if (!comercio?.whatsapp_negocio) return;
        const msg = producto
            ? `Hola! Me interesa "${producto.titulo}" (${comercio.moneda || 'ARS'} $${producto.precio_estandar?.toLocaleString('es-AR')}). ¿Está disponible?`
            : `Hola! Quiero consultar sobre los productos de ${comercio.nombre}.`;
        window.open(`https://wa.me/${comercio.whatsapp_negocio}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Cargando tienda...</p>
                </div>
            </div>
        );
    }

    if (!comercio) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Store className="w-12 h-12 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienda no encontrada</h1>
                    <p className="text-gray-500 mb-6">La tienda "<strong>{slug}</strong>" no existe o no está disponible.</p>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        Ir al inicio
                    </Button>
                </div>
            </div>
        );
    }

    const config = comercio;
    const colorPrimario = '#2563eb'; // Default blue; ideally from ConfiguracionComercio

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER DE LA TIENDA */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {comercio.logo_url ? (
                                <img src={comercio.logo_url} alt={comercio.nombre} className="w-12 h-12 rounded-xl object-cover shadow" />
                            ) : (
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                                    <span className="text-white font-black text-xl">{comercio.nombre?.[0]}</span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-black text-gray-900">{comercio.nombre}</h1>
                                {comercio.ciudad && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {comercio.ciudad}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {comercio.whatsapp_negocio && (
                                <Button
                                    onClick={() => abrirWhatsApp()}
                                    className="bg-green-500 hover:bg-green-600 text-white gap-2 hidden md:flex"
                                    size="sm"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="relative gap-2"
                                onClick={() => setCarritoOpen(!carritoOpen)}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                {carrito.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                                        {carrito.reduce((s, i) => s + i.cantidad, 0)}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* CARRITO DROPDOWN */}
            {carritoOpen && (
                <div className="fixed top-20 right-4 z-50 bg-white rounded-2xl shadow-2xl border w-80 p-4 max-h-[70vh] overflow-y-auto">
                    <h3 className="font-bold text-gray-900 mb-3">Tu carrito</h3>
                    {carrito.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">El carrito está vacío</p>
                    ) : (
                        <>
                            {carrito.map(item => (
                                <div key={item.id} className="flex items-center gap-3 py-2 border-b">
                                    {item.imagen_principal && (
                                        <img src={item.imagen_principal} alt={item.titulo} className="w-12 h-12 object-cover rounded-lg" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.titulo}</p>
                                        <p className="text-xs text-gray-500">x{item.cantidad} · ${(item.precio_estandar * item.cantidad).toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between font-bold text-gray-900 mb-3">
                                    <span>Total:</span>
                                    <span>${totalCarrito.toLocaleString('es-AR')}</span>
                                </div>
                                <Button
                                    className="w-full bg-green-500 hover:bg-green-600"
                                    onClick={() => {
                                        const resumen = carrito.map(i => `• ${i.titulo} x${i.cantidad} = $${(i.precio_estandar * i.cantidad).toLocaleString('es-AR')}`).join('\n');
                                        const msg = `Hola! Quiero hacer un pedido en ${comercio.nombre}:\n\n${resumen}\n\nTOTAL: $${totalCarrito.toLocaleString('es-AR')}`;
                                        window.open(`https://wa.me/${comercio.whatsapp_negocio}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Pedir por WhatsApp
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* BANNER DESCRIPCION */}
            {comercio.descripcion && (
                <div className="bg-blue-600 text-white py-3">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <p className="text-sm font-medium">{comercio.descripcion}</p>
                    </div>
                </div>
            )}

            {/* FILTROS Y BUSQUEDA */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar productos..."
                            className="pl-10 bg-white"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoriaActiva(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoriaActiva === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GRID DE PRODUCTOS */}
                {productosFiltrados.length === 0 ? (
                    <div className="text-center py-16">
                        <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No se encontraron productos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productosFiltrados.map(producto => (
                            <div
                                key={producto.id}
                                className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                            >
                                <div className="relative aspect-square bg-gray-100">
                                    {producto.imagen_principal ? (
                                        <img src={producto.imagen_principal} alt={producto.titulo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Store className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                    {producto.destacado && (
                                        <Badge className="absolute top-2 left-2 bg-orange-500">Destacado</Badge>
                                    )}
                                    {producto.stock_actual <= 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Badge className="bg-red-600">Sin stock</Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    {producto.categoria && (
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">{producto.categoria}</p>
                                    )}
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 flex-1">{producto.titulo}</h3>

                                    {producto.promedio_estrellas > 0 && (
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs text-gray-500">{producto.promedio_estrellas.toFixed(1)} ({producto.total_resenas})</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xl font-black text-gray-900">
                                            ${producto.precio_estandar?.toLocaleString('es-AR')}
                                        </span>
                                        {producto.stock_actual > 0 && producto.stock_actual <= 5 && (
                                            <span className="text-xs text-orange-600 font-bold">¡Últimas {producto.stock_actual}!</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => agregarAlCarrito(producto)}
                                            disabled={producto.stock_actual <= 0}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                                        >
                                            <ShoppingCart className="w-3 h-3 mr-1" />
                                            Agregar
                                        </Button>
                                        {comercio.whatsapp_negocio && (
                                            <Button
                                                onClick={() => abrirWhatsApp(producto)}
                                                variant="outline"
                                                className="h-9 px-3 border-green-500 text-green-600 hover:bg-green-50"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER DE LA TIENDA */}
            <footer className="bg-gray-900 text-white mt-12 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {comercio.logo_url ? (
                                <img src={comercio.logo_url} alt={comercio.nombre} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-black">{comercio.nombre?.[0]}</span>
                                </div>
                            )}
                            <span className="font-bold text-lg">{comercio.nombre}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400">
                            {comercio.whatsapp_negocio && (
                                <a href={`https://wa.me/${comercio.whatsapp_negocio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-400 transition-colors">
                                    <Phone className="w-4 h-4" /> {comercio.whatsapp_negocio}
                                </a>
                            )}
                            {comercio.email_negocio && (
                                <a href={`mailto:${comercio.email_negocio}`} className="flex items-center gap-1 hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" /> {comercio.email_negocio}
                                </a>
                            )}
                            {comercio.direccion && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {comercio.direccion}, {comercio.ciudad}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-600 text-xs">Tienda creada con <span className="text-orange-500 font-bold">Common Network</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}