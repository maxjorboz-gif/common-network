import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Store, ArrowRight, Loader2 } from 'lucide-react';

export default function MerchantRegister() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        nombreComercio: '',
        email: '',
        whatsapp: '',
        password: '',
        confirmPassword: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // PASO 1: Autenticar con Google
            await base44.auth.loginWithProvider('google');

            // PASO 2: Obtener user_id de Google Auth
            const user = await base44.auth.me();

            // PASO 3: Verificar si ya tiene comercio registrado
            const comerciosExistentes = await base44.entities.Comercio.filter({
                user_id: user.id
            });

            if (comerciosExistentes.length > 0) {
                toast({
                    title: "Ya tienes un comercio",
                    description: "Ya estás registrado. Redirigiendo al panel...",
                });
                setTimeout(() => navigate('/merchant'), 2000);
                return;
            }

            // PASO 4: Llamar a backend function (genera id_comercio y hashea contraseña)
            const result = await base44.functions.invoke('registrarComercio', {
                user_id: user.id,
                nombre: form.nombreComercio,
                email_negocio: form.email,
                whatsapp_negocio: form.whatsapp,
                password: form.password  // Se hashea en backend
            });

            if (!result.success) {
                toast({
                    title: "Error al registrar",
                    description: result.error || "Ocurrió un error inesperado",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const urlTienda = `${window.location.origin}/tienda?slug=${result.id_comercio?.slug || result.slug || result.id_comercio}`;
            toast({
                title: "¡Comercio registrado!",
                description: `Tu tienda: ${result.url_tienda || '/tienda?slug=...'} Redirigiendo al panel...`,
            });

            // PASO 5: Redirigir al panel
            setTimeout(() => {
                window.location.href = '/merchant';
            }, 2500);

        } catch (error) {
            console.error('Error al registrar comercio:', error);
            toast({
                title: "Error al registrar",
                description: error.message || "Ocurrió un error inesperado",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center">
                            <Store className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white text-center">
                        Registrar Comercio
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <Label htmlFor="nombreComercio" className="text-neutral-300">
                                Nombre del Comercio *
                            </Label>
                            <Input
                                id="nombreComercio"
                                required
                                value={form.nombreComercio}
                                onChange={(e) => setForm({ ...form, nombreComercio: e.target.value })}
                                placeholder="Ej: Parrillas El Fogón"
                                className="bg-neutral-800 border-neutral-700 text-white"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-neutral-300">
                                Email de Contacto *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="contacto@tucomercio.com"
                                className="bg-neutral-800 border-neutral-700 text-white"
                            />
                        </div>

                        <div>
                            <Label htmlFor="whatsapp" className="text-neutral-300">
                                WhatsApp *
                            </Label>
                            <Input
                                id="whatsapp"
                                required
                                value={form.whatsapp}
                                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                placeholder="5493411234567"
                                className="bg-neutral-800 border-neutral-700 text-white"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-neutral-300">
                                Contraseña *
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                className="bg-neutral-800 border-neutral-700 text-white"
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-neutral-300">
                                Confirmar Contraseña *
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="bg-neutral-800 border-neutral-700 text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    Registrar Comercio
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>

                        <div className="text-center text-sm text-neutral-400 mt-4">
                            Al registrarte, se abrirá Google Auth para verificar tu identidad
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-neutral-500">¿Ya tienes cuenta? </span>
                            <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}