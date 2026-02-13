import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Search, ShoppingCart, Star } from 'lucide-react';

export default function LandingPage() {
    const [searchParams] = useSearchParams();
    const id_comercio = searchParams.get('id_comercio');

    const [comercio, setComercio] = useState(null);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadComercio = async () => {
            if (!id_comercio) {
                setLoading(false);
                return;
            }

            try {
                // Cargar datos del comercio (público)
                const comercios = await base44.entities.Comercio.filter({
                    id_comercio,
                    activo: true
                });

                if (comercios.length === 0) {
                    setLoading(false);
                    return;
                }

                setComercio(comercios[0]);

                // Cargar productos activos del comercio
                const productosData = await base44.entities.Producto.filter({
                    id_comercio,
                    activo: true
                });

                setProductos(productosData);
            } catch (error) {
                console.error('Error al cargar comercio:', error);
            } finally {
                setLoading(false);
            }
        };

        loadComercio();
    }, [id_comercio]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando tienda...</div>
            </div>
        );
    }

    if (!id_comercio || !comercio) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur max-w-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-white">
                            Comercio no encontrado
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                            El comercio que buscás no existe o está inactivo
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const productosFiltrados = productos.filter(p =>
        p.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header del Comercio */}
            <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {comercio.logo_url ? (
                                <img
                                    src={comercio.logo_url}
                                    alt={comercio.nombre}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Store className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-white">{comercio.nombre}</h1>
                                {comercio.descripcion && (
                                    <p className="text-sm text-slate-400">{comercio.descripcion}</p>
                                )}
                            </div>
                        </div>
                        <Button variant="outline" className="border-slate-600 text-white">
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Buscador */}
            <div className="container mx-auto px-4 py-6">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar productos..."
                        className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="container mx-auto px-4 pb-12">
                {productosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 text-lg">No hay productos disponibles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {productosFiltrados.map((producto) => (
                            <Card
                                key={producto.id}
                                className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <CardHeader className="p-0">
                                    {producto.imagen_principal ? (
                                        <img
                                            src={producto.imagen_principal}
                                            alt={producto.titulo}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-slate-700 rounded-t-lg flex items-center justify-center">
                                            <Store className="w-12 h-12 text-slate-500" />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-4">
                                    <h3 className="text-white font-bold mb-2 line-clamp-2">
                                        {producto.titulo}
                                    </h3>

                                    {producto.descripcion && (
                                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                            {producto.descripcion}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-2xl font-bold text-white">
                                            ${producto.precio_estandar.toLocaleString('es-AR')}
                                        </div>
                                        {producto.destacado && (
                                            <Badge className="bg-orange-600">Destacado</Badge>
                                        )}
                                    </div>

                                    {producto.promedio_estrellas > 0 && (
                                        <div className="flex items-center gap-1 mb-3">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm text-slate-300">
                                                {producto.promedio_estrellas.toFixed(1)} ({producto.total_resenas})
                                            </span>
                                        </div>
                                    )}

                                    {producto.stock_actual <= 0 ? (
                                        <Badge variant="destructive" className="w-full justify-center">
                                            Sin stock
                                        </Badge>
                                    ) : producto.stock_actual <= 5 ? (
                                        <Badge variant="outline" className="w-full justify-center border-yellow-600 text-yellow-600">
                                            ¡Últimas {producto.stock_actual} unidades!
                                        </Badge>
                                    ) : (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            Agregar al carrito
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-slate-800/50 backdrop-blur border-t border-slate-700 py-6">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-slate-400 text-sm">
                        {comercio.whatsapp_negocio && (
                            <a
                                href={`https://wa.me/${comercio.whatsapp_negocio}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                WhatsApp: {comercio.whatsapp_negocio}
                            </a>
                        )}
                        {comercio.email_negocio && (
                            <a
                                href={`mailto:${comercio.email_negocio}`}
                                className="hover:text-white transition-colors"
                            >
                                {comercio.email_negocio}
                            </a>
                        )}
                        {comercio.direccion && (
                            <span>{comercio.direccion}, {comercio.ciudad}</span>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
