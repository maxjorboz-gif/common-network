import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoginModal } from "@/components/LoginModal";
import {
    Store, ArrowRight, Loader2, CheckCircle2, Copy, Banknote,
    X, MessageCircle, ExternalLink
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MerchantRegister = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombreComercio: '',
        email: '',
        whatsapp: '',
        usuario: '',
        password: '',
        confirmPassword: ''
    });

    const handleNextStep = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevención de doble submit

        if (form.password !== form.confirmPassword) {
            toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Mapeamos 'usuario' a 'full_name' según lo esperado por el backend
            const payload = {
                action: 'create',
                nombre_comercio: form.nombreComercio,
                email: form.email,
                whatsapp: form.whatsapp,
                password: form.password,
                full_name: form.usuario
            };

            const { data, error } = await base44.functions.invoke('registrarComercio', payload);

            if (error) {
                console.error(error);
                toast({ title: "Error de Conexión", variant: "destructive" });
                return;
            }

            if (!data?.success) {
                toast({ title: "Error de Registro", description: data?.error || "Error desconocido", variant: "destructive" });
                return;
            }

            // Éxito
            toast({ title: "¡Cuenta Creada!", description: "Bienvenido a la plataforma." });
            navigate('/');
        } catch (error) {
            console.error("Error invoke registrarComercio:", error);
            toast({ title: "Error de Conexión", description: "Intenta nuevamente.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Login Button absolute */}
            <div className="absolute top-6 right-6 z-50">
                <LoginModal trigger={
                    <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 gap-2 rounded-full px-6">
                        <span className="font-bold uppercase tracking-wide text-xs">Ingresar</span>
                    </Button>
                } />
            </div>

            <div className="relative z-10 w-full max-w-xl animate-in slide-in-from-bottom duration-500">
                <Card className="shadow-2xl bg-neutral-900 border-neutral-800 overflow-hidden rounded-[2.5rem]">
                    <div className="bg-orange-600 py-3 px-6 text-center">
                        <p className="text-white font-black italic uppercase text-xs tracking-widest">
                            GRATIS DE POR VIDA • CRECÉS VOS, CRECEMOS TODOS
                        </p>
                    </div>

                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
                            <Store className="w-8 h-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-3xl font-black italic uppercase text-white tracking-tighter">
                            Crea tu Marca
                        </CardTitle>
                        <p className="text-neutral-400 text-sm font-medium">
                            Ingresa los datos para tu nuevo e-commerce y empezá a vender.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        <form id="step1" onSubmit={handleNextStep} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Nombre del comercio</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12 rounded-xl"
                                    placeholder="Ej: Mi Parrilla Pro"
                                    required
                                    value={form.nombreComercio}
                                    onChange={e => setForm({ ...form, nombreComercio: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Email Verificado (Google)</label>
                                <Input
                                    type="email"
                                    className="bg-neutral-800 border-neutral-700 text-white h-12 rounded-xl"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">WhatsApp</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12 rounded-xl"
                                    required
                                    value={form.whatsapp}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Usuario Admin</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12 rounded-xl"
                                    required
                                    value={form.usuario}
                                    onChange={e => setForm({ ...form, usuario: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Contraseña</label>
                                <Input
                                    type="password"
                                    className="bg-neutral-800 border-neutral-700 text-white h-12 rounded-xl"
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Repetir</label>
                                <Input
                                    type="password"
                                    className="bg-neutral-800 border-neutral-700 text-white h-12 rounded-xl"
                                    required
                                    value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="pb-10 pt-4 px-10">
                        <Button
                            form="step1"
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-2xl text-lg group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Registro <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default MerchantRegister;
