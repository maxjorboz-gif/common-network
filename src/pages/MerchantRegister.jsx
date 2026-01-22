import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Store, ArrowRight, Loader2, CheckCircle2, Copy, Banknote, ShieldAlert } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const MerchantRegister = () => {
    const { user, login } = useAuth();
    const [step, setStep] = useState(1); // 1: Datos, 2: Pago, 3: Pendiente
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
            // Si el usuario no está logueado, lo registramos en Base44
            if (!user) {
                await base44.auth.signup({
                    email: form.email,
                    password: form.password,
                    full_name: form.usuario || form.email,
                    custom_data: { whatsapp: form.whatsapp }
                });

                // Intentamos loguear automáticamente
                toast({ title: "Cuenta creada", description: "Ahora procede al pago para activar tu tienda." });
                // En una app real, el signup suele loguear. Si no, forzamos login o pedimos login.
                // Por ahora asumimos que el flujo sigue o pedimos que se loguee.
                // REFRESH AUTH STATE
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
            const { data } = await base44.functions.invoke('registrarComercio', {
                nombre_comercio: form.nombreComercio,
                whatsapp: form.whatsapp,
                numero_operacion: numOperacion
            });

            if (data.success) {
                setStep(3);
                toast({
                    title: "¡Solicitud enviada!",
                    description: "Tu pago está siendo revisado por nuestro equipo.",
                });
            } else {
                throw new Error(data.message || 'Error al registrar');
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const copyCBU = () => {
        navigator.clipboard.writeText("0000003100000000000000"); // CBU DE EJEMPLO
        toast({ title: "Copiado", description: "CBU copiado al portapapeles" });
    };

    // Si ya está logueado y el backend detecta que ya tiene una solicitud pendiente, podríamos saltar al step 3.
    // Pero por ahora mantenemos el flujo manual.

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[100px]"></div>
            </div>

            <Card className="w-full max-w-xl shadow-2xl bg-neutral-900 border-neutral-800 relative z-10 overflow-hidden">
                {/* Banner de Precios Solicitado */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 py-3 px-6 text-center">
                    <p className="text-white font-black italic uppercase text-xs tracking-widest">
                        Pago único: $150.000 • Comisión: 10% • Sin costos ocultos
                    </p>
                </div>

                <CardHeader className="text-center pt-8">
                    <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
                        {step === 1 && <Store className="w-8 h-8 text-orange-600" />}
                        {step === 2 && <Banknote className="w-8 h-8 text-orange-600" />}
                        {step === 3 && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                    </div>
                    <CardTitle className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        {step === 1 && "Crea tu Marca"}
                        {step === 2 && "Activa tu Tienda"}
                        {step === 3 && "Revisión en Proceso"}
                    </CardTitle>
                    <p className="text-neutral-400 text-sm font-medium">
                        {step === 1 && "Ingresa los datos del titular y tu comercio."}
                        {step === 2 && "Realiza la transferencia para habilitar tu panel."}
                        {step === 3 && "Estamos validando tu pago. Te avisaremos pronto."}
                    </p>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {step === 1 && (
                        <form id="step1" onSubmit={handleNextStep} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Nombre del comercio</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="Ej: Mi Tienda Pro"
                                    required
                                    value={form.nombreComercio}
                                    onChange={e => setForm({ ...form, nombreComercio: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Email Personal</label>
                                <Input
                                    type="email"
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="email@ejemplo.com"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">WhatsApp</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="+54 9 341..."
                                    required
                                    value={form.whatsapp}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Usuario</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="Nombre de usuario"
                                    required
                                    value={form.usuario}
                                    onChange={e => setForm({ ...form, usuario: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Contraseña</label>
                                <Input
                                    type="password"
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="••••••••"
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Repetir Contraseña</label>
                                <Input
                                    type="password"
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="••••••••"
                                    required
                                    value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-[2rem] space-y-4">
                                <h4 className="font-black italic uppercase text-orange-500 text-sm">Datos de Transferencia</h4>
                                <div className="space-y-2">
                                    <p className="text-xs text-neutral-500 uppercase font-bold">CBU / ALIAS</p>
                                    <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                        <code className="text-orange-500 font-bold">0000003100000000000000</code>
                                        <Button variant="ghost" size="sm" onClick={copyCBU}><Copy className="w-4 h-4" /></Button>
                                    </div>
                                    <p className="text-xs text-neutral-500 uppercase font-bold mt-4">Importe a Transferir</p>
                                    <p className="text-3xl font-black text-white italic">$150.000</p>
                                    <p className="text-[10px] text-neutral-500">Titular: COMMON NETWORK PLATFORM</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 italic">Número de Operación / Comprobante</label>
                                <Input
                                    className="bg-neutral-800 border-neutral-700 text-white h-12"
                                    placeholder="Ingresa los dígitos de tu comprobante"
                                    value={numOperacion}
                                    onChange={e => setNumOperacion(e.target.value)}
                                />
                                <p className="text-[10px] text-neutral-500">Este número será validado por nuestro administrador.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-10 space-y-6 animate-in zoom-in duration-500">
                            <div className="bg-neutral-800/50 p-6 rounded-[2rem] border border-neutral-700">
                                <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black italic uppercase mb-2">Cuenta en Espera</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Hemos recibido tu información y el número de operación <span className="text-white font-bold">#{numOperacion}</span>.
                                    <br /><br />
                                    Tu cuenta será habilitada una vez confirmado el pago. Podrás ingresar a tu panel en un lapso de 2 a 24 horas.
                                </p>
                            </div>
                            <Button onClick={() => navigate('/')} variant="outline" className="w-full border-neutral-800 text-neutral-400 hover:text-white h-12 rounded-xl">
                                Volver al Inicio
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pb-8">
                    {step === 1 && (
                        <Button
                            form="step1"
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-2xl text-lg group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Siguiente Paso <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                        </Button>
                    )}
                    {step === 2 && (
                        <div className="flex flex-col w-full gap-3">
                            <Button
                                onClick={handleFinalSubmit}
                                disabled={loading || !numOperacion}
                                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black italic uppercase rounded-2xl text-lg group"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Informar Pago y Finalizar</>}
                            </Button>
                            <Button variant="ghost" onClick={() => setStep(1)} className="text-neutral-500 hover:text-white">Corregir datos</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default MerchantRegister;
