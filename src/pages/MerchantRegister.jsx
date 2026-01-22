import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Store, ArrowRight, Loader2, CheckCircle2, Copy, Banknote,
    ShieldAlert, X, MessageCircle, ExternalLink, Flame
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MerchantRegister = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Datos, 2: Pago, 3: Éxito
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

    const [numOperacion, setNumOperacion] = useState('');

    const handleNextStep = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            if (!user) {
                await base44.auth.signup({
                    email: form.email,
                    password: form.password,
                    full_name: form.usuario || form.email,
                    custom_data: { whatsapp: form.whatsapp }
                });

                toast({ title: "Cuenta creada", description: "Por favor, inciá sesión y continuá con el pago." });
                window.location.reload();
                return;
            }
            setStep(2);
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!numOperacion.trim()) return;

        setLoading(true);
        try {
            // Intentamos invocar la función de registro
            const response = await base44.functions.invoke('registrarComercio', {
                nombre_comercio: form.nombreComercio,
                whatsapp: form.whatsapp,
                numero_operacion: numOperacion
            });

            // Si hay error 500 o similar, data vendrá como null o con error
            if (response.error) {
                throw new Error(response.error.message || "Error en el servidor");
            }

            if (response.data?.success) {
                setStep(3);
            } else {
                throw new Error(response.data?.error || 'Error al procesar el registro');
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error de Servidor",
                description: "Hubo un problema procesando tu registro. Por favor, contactanos por WhatsApp.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const copyCBU = () => {
        navigator.clipboard.writeText("0000003100000000000000");
        toast({ title: "Copiado", description: "CBU copiado" });
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]"></div>
            </div>

            <AnimatePresence mode="wait">
                {step === 3 ? (
                    <motion.div
                        key="success-modal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative z-50 w-full max-w-xl"
                    >
                        <Card className="bg-neutral-900 border-neutral-800 shadow-2xl overflow-hidden rounded-[3rem]">
                            <button
                                onClick={() => navigate('/')}
                                className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full z-10"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-12 text-center space-y-8">
                                <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-green-500/20">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                                        ¡Felicitaciones! <br />
                                        <span className="text-orange-600">Comercio en marcha</span>
                                    </h2>
                                    <p className="text-neutral-400 font-medium text-lg leading-relaxed">
                                        Tu tienda ya está en nuestro sistema. <br />
                                        En las próximas **24 hs** te lo habilitaremos.
                                    </p>
                                </div>

                                <div className="bg-neutral-950/50 border border-neutral-800 rounded-[2rem] p-6 space-y-4">
                                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest italic">Acelerá el proceso:</p>
                                    <p className="text-neutral-300 text-sm">
                                        Adjuntanos tu comprobante de ventas por WhatsApp para procesar tu solicitud lo antes posible.
                                    </p>
                                    <a
                                        href="https://wa.me/5493412722576"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-green-500 font-black italic uppercase text-lg hover:text-green-400 transition-colors"
                                    >
                                        <MessageCircle className="w-6 h-6" /> 3412722576
                                    </a>
                                </div>

                                <div className="pt-4 flex flex-col gap-4">
                                    <Button
                                        onClick={() => window.open('https://tu-url-de-tutoriales.com', '_blank')}
                                        className="h-16 bg-white text-black hover:bg-neutral-200 font-black italic uppercase rounded-2xl text-lg shadow-xl"
                                    >
                                        <ExternalLink className="mr-2 w-5 h-5" /> Ver Manual de Usuario
                                    </Button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="text-neutral-500 hover:text-white font-bold uppercase text-xs tracking-[0.2em]"
                                    >
                                        Cerrar y volver al inicio
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative z-10 w-full max-w-xl"
                    >
                        <Card className="shadow-2xl bg-neutral-900 border-neutral-800 overflow-hidden rounded-[2.5rem]">
                            <div className="bg-gradient-to-r from-orange-600 to-red-600 py-3 px-6 text-center">
                                <p className="text-white font-black italic uppercase text-xs tracking-widest">
                                    Pago único: $150.000 • Comisión: 10% • Sin costos ocultos
                                </p>
                            </div>

                            <CardHeader className="text-center pt-8">
                                <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
                                    {step === 1 ? <Store className="w-8 h-8 text-orange-600" /> : <Banknote className="w-8 h-8 text-orange-600" />}
                                </div>
                                <CardTitle className="text-3xl font-black italic uppercase text-white tracking-tighter">
                                    {step === 1 ? "Crea tu Marca" : "Activa tu Tienda"}
                                </CardTitle>
                                <p className="text-neutral-400 text-sm font-medium">
                                    {step === 1 ? "Ingresa los datos para tu nuevo e-commerce." : "Realiza la transferencia para habilitar tu panel."}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                {step === 1 ? (
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
                                            <label className="text-xs font-black uppercase text-neutral-500 italic">Email Personal</label>
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
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-orange-600/5 border border-orange-500/20 p-6 rounded-[2rem] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black italic uppercase text-orange-500 text-sm">Transferencia CBU</h4>
                                                <Badge className="bg-orange-500 text-white border-none italic font-black uppercase text-[10px]">$150.000</Badge>
                                            </div>
                                            <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                                <code className="text-orange-500 font-bold overflow-hidden truncate mr-2 text-sm">0000003100000000000000</code>
                                                <Button variant="ghost" size="sm" onClick={copyCBU} className="hover:bg-orange-500/10 text-orange-500"><Copy size={16} /></Button>
                                            </div>
                                            <p className="text-[10px] text-neutral-500 uppercase font-bold text-center">Titular: COMMON NETWORK PLATFORM</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-neutral-500 italic">Nº Compante de Operación</label>
                                            <Input
                                                className="border-neutral-800 bg-neutral-800 h-14 rounded-xl text-lg text-center font-bold tracking-widest text-orange-500"
                                                placeholder="0000000000"
                                                value={numOperacion}
                                                onChange={e => setNumOperacion(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pb-10 pt-4 px-10">
                                {step === 1 ? (
                                    <Button
                                        form="step1"
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-2xl text-lg group"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Configurar Pago <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                                    </Button>
                                ) : (
                                    <div className="flex flex-col w-full gap-4">
                                        <Button
                                            onClick={handleFinalSubmit}
                                            disabled={loading || !numOperacion}
                                            className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black italic uppercase rounded-2xl text-lg group shadow-xl shadow-green-950/20"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : "Finalizar y Activar Cuenta"}
                                        </Button>
                                        <button onClick={() => setStep(1)} className="text-neutral-500 hover:text-white uppercase font-bold text-[10px] tracking-widest">Atrás a mis datos</button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MerchantRegister;
