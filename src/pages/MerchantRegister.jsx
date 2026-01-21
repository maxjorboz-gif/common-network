import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Store, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const MerchantRegister = () => {
    const { user } = useAuth();
    const [nombreComercio, setNombreComercio] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!nombreComercio.trim()) return;

        setLoading(true);
        try {
            const { data } = await base44.functions.invoke('registrarComercio', {
                nombre_comercio: nombreComercio
            });

            if (data.success) {
                toast({
                    title: "¡Tienda creada!",
                    description: `Tu ID de Comercio es: ${data.id_comercio}`,
                });
                // Redirect to Admin Panel or Dashboard
                // Force a reload or state update might be needed if AuthContext caches commerce data
                window.location.href = '/admin';
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "No se pudo registrar registrar el comercio.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                        <Store className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Creá tu Tienda Digital</CardTitle>
                    <p className="text-slate-500 text-sm">
                        Comenzá a vender tus productos con tu propia identidad.
                    </p>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre de tu marca</label>
                            <Input
                                id="name"
                                placeholder="Ej: Parrillas El Tano"
                                value={nombreComercio}
                                onChange={(e) => setNombreComercio(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                            <p className="font-semibold">✨ Incluye:</p>
                            <ul className="list-disc pl-4 mt-1 space-y-1 text-blue-700">
                                <li>Catálogo de productos ilimitado</li>
                                <li>Panel de administración completo</li>
                                <li>Checkout integrado con MercadoPago (opcional)</li>
                                <li>Tracking para Meta Ads automático</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                            type="submit"
                            disabled={loading || !nombreComercio}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando tienda...
                                </>
                            ) : (
                                <>
                                    Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default MerchantRegister;
