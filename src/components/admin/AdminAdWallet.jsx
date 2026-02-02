import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { commerceClient } from '@/api/commerceApiClient';
import { useState, useEffect } from 'react';
import {
    Wallet,
    TrendingUp,
    Zap,
    Target,
    Users,
    ShieldCheck,
    Sparkles,
    ArrowRight,
    PlusCircle,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

export default function AdminAdWallet({ comercio }) {
    const queryClient = useQueryClient();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showBillingForm, setShowBillingForm] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    // 1. Obtener los datos reales del comercio (donde vive el saldo)
    const { data: datosComercio, isLoading } = useQuery({
        queryKey: ['comercio-wallet', comercio.commerce_code],
        queryFn: async () => {
            const response = await commerceClient.post('obtenerDatosComercio', {
                commerce_code: comercio.commerce_code
            });
            return response.comercio;
        }
    });

    const { data: config, isLoadingConfig } = useQuery({
        queryKey: ['config-admin', comercio.commerce_code],
        queryFn: async () => {
            const response = await commerceClient.post('obtenerConfiguracion', {
                commerce_code: comercio.commerce_code
            });
            return response.config;
        }
    });

    // 1.b Obtener Configuración SUPREMA (Datos Bancarios del Admin)
    const { data: configSuprema, isLoading: loadingSuprema } = useQuery({
        queryKey: ['config-suprema-public'],
        queryFn: async () => {
            const response = await commerceClient.post('configuracionSuprema', {
                action: 'obtener'
            });
            console.log("Datos bancarios obtenidos:", response?.config);
            return response?.config || {};
        },
        refetchOnWindowFocus: true // Para asegurar que si cambias de pestaña se actualice
    });

    const [dailyLimit, setDailyLimit] = useState(0);

    useEffect(() => {
        if (config?.limite_diario_ads) {
            setDailyLimit(config.limite_diario_ads);
        }
    }, [config]);

    const updateConfigMutation = useMutation({
        mutationFn: async (newLimit) => {
            return await commerceClient.post('actualizarConfiguracion', {
                commerce_code: comercio.commerce_code,
                configData: { limite_diario_ads: newLimit }
            });
        },
        onSuccess: () => {
            toast.success("Límite diario actualizado");
            queryClient.invalidateQueries(['config-admin']);
        }
    });

    const handleLimitChange = (e) => {
        setDailyLimit(parseInt(e.target.value));
    };

    const saveLimit = () => {
        updateConfigMutation.mutate(dailyLimit);
    };

    const saldoActual = datosComercio?.saldo_publicidad || 0;

    // 2. Mutación para solicitar recarga
    const requestReload = useMutation({
        mutationFn: async (plan) => {
            // Usamos trackEvent o una función de logs para registrar la intención de carga
            // Y enviamos un mensaje a las notas del comercio
            return await commerceClient.post('agregarNotaLead', {
                id_comercio: comercio.commerce_code,
                nota: `[SOLICITUD PUBLICIDAD] El comercio solicitó un reporte de carga de $${plan.precio} USD. Operación: ${transactionId}`,
                tipo: 'facturacion'
            });
        },
        onSuccess: () => {
            toast.success("Solicitud enviada. Tu saldo se acreditará en breve.");
            setShowBillingForm(false);
            setSelectedPlan(null);
            setTransactionId('');
        }
    });

    const planes = [
        { title: 'Plan Despegue', precio: 50000, clics: '~800 clics', badge: 'Popular', icon: Zap, color: 'text-orange-600' },
        { title: 'Plan Expansión', precio: 100000, clics: '~1800 clics', badge: 'Mejor ROAS', icon: Target, color: 'text-purple-600' },
        { title: 'Plan Dominio', precio: 150000, clics: '~3000 clics', badge: 'VIPS', icon: Sparkles, color: 'text-blue-600' },
    ];

    if (isLoading) return <div className="p-10 text-center animate-pulse">Cargando Billetera...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">

            {/* HEADER: EL SALDO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet size={120} />
                    </div>
                    <CardContent className="p-10 relative z-10">
                        <div className="flex items-center gap-3 mb-6 text-neutral-400 font-bold uppercase tracking-widest text-xs">
                            <Wallet className="w-4 h-4" /> Billetera de Publicidad
                        </div>
                        <div className="text-6xl font-black italic tracking-tighter mb-4">
                            $ {saldoActual.toLocaleString('es-AR')}
                            <span className="text-2xl text-orange-500 ml-2">ARS</span>
                        </div>
                        <p className="text-neutral-400 text-sm max-w-md">
                            Invertí en visibilidad genuina. Este saldo se consume solo cuando atraemos clientes con intereses reales en tus productos desde nuestra red de socios.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200 border-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-purple-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Tu Impacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-purple-800 text-xs font-medium">Intereses Perfilados</span>
                                <span className="font-bold text-lg">+{config?.stats_intereses || 124}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-purple-200 pt-4">
                                <span className="text-purple-800 text-xs font-medium">Visitas de la Red</span>
                                <span className="font-bold text-lg">+{config?.stats_visitas_red || 45}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PANEL DE GASTO DIARIO REGULABLE */}
            <Card className="bg-neutral-900 text-white border-neutral-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Clock className="w-5 h-5 text-orange-500" /> Control de Gasto Diario
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">Presupuesto Objetivo / Día</span>
                                <span className="text-2xl font-black italic text-orange-500">${dailyLimit.toLocaleString()} ARS</span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100000"
                                step="1000"
                                value={dailyLimit}
                                onChange={handleLimitChange}
                                onMouseUp={saveLimit}
                                onTouchEnd={saveLimit}
                                className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-600 hover:accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-neutral-600 font-mono">
                                <span>Pausado ($0)</span>
                                <span>$100.000</span>
                            </div>
                        </div>

                        <div className="md:w-1/3 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
                            <h5 className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-300 mb-2">
                                <Zap size={12} className="text-yellow-500" /> Inteligencia Artificial
                            </h5>
                            <p className="text-xs text-neutral-400 leading-relaxed italic">
                                "La IA puede no gastar nada en un día de bajo tráfico, y gastar el doble en un día 'caliente', pero
                                <span className="text-white font-bold not-italic"> NUNCA superará en 30 días el promedio establecido </span>
                                (${(dailyLimit * 30).toLocaleString()} al mes)."
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* COMPARATIVA CONTRA AGENCY/ADS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <h4 className="font-black text-neutral-900 uppercase italic mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-green-600" /> ¿Por qué pautar en la Red?
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-sm text-neutral-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span><b>Sin Marketers:</b> No pagás honorarios fijos mensuales de +400 USD.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-neutral-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span><b>Sin Espera:</b> Los anuncios aparecen apenas cargás saldo, sin "períodos de aprendizaje" eternos.</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-200">
                    <h4 className="font-black text-orange-900 uppercase italic mb-4 flex items-center gap-2">
                        <Users /> Audiencia Real
                    </h4>
                    <p className="text-sm text-orange-800 italic font-medium leading-relaxed">
                        "Tus productos aparecen en tiendas donde el cliente YA tiene la billetera en la mano y está comprando algo que complementa tu marca."
                    </p>
                </div>
            </div>

            {/* PLANES DE INVERSIÓN */}
            <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-6">Elige tu Plan de Vuelo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {planes.map((plan, i) => (
                        <Card
                            key={i}
                            className={`hover:scale-105 transition-all cursor-pointer border-2 ${selectedPlan?.precio === plan.precio ? 'border-orange-600 bg-orange-50/50' : 'border-neutral-200 hover:border-neutral-300'}`}
                            onClick={() => {
                                setSelectedPlan(plan);
                                setShowBillingForm(true);
                            }}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <plan.icon className={`${plan.color} w-8 h-8`} />
                                    <Badge className="bg-neutral-950 text-white border-none text-[9px] px-2">{plan.badge}</Badge>
                                </div>
                                <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black mb-1">$ {plan.precio.toLocaleString('es-AR')}</div>
                                <p className="text-xs text-neutral-500 mb-6 font-medium">Pago Único • Sin Costos Ocultos</p>

                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                                        <ArrowRight size={14} className="text-orange-600" /> {plan.clics} estimativos
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                        <CheckCircle2 size={12} className="text-green-500" /> Aparecé en 15+ tiendas aliadas
                                    </div>
                                </div>

                                <Button className={`w-full ${selectedPlan?.precio === plan.precio ? 'bg-orange-600' : 'bg-neutral-900'}`}>
                                    Seleccionar Plan
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* FORMULARIO DE CARGA (SIMPLIFICADO) */}
            {showBillingForm && (
                <Card className="border-orange-600 border-t-8 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="text-orange-600" /> Informar Carga: {selectedPlan?.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-neutral-100 p-6 rounded-2xl border-dashed border-2 border-neutral-300">
                            <p className="text-neutral-600 text-sm mb-4 font-bold uppercase tracking-tighter italic">Transferí Pesos (ARS) a nuestra cuenta oficial:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                                <div className="p-3 bg-white rounded-lg border">
                                    <b>CBU:</b> {loadingSuprema ? <span className="animate-pulse">Cargando...</span> : (configSuprema?.cbu || 'Consultar Admin')}
                                </div>
                                <div className="p-3 bg-white rounded-lg border">
                                    <b>Alias:</b> {loadingSuprema ? <span className="animate-pulse">...</span> : (configSuprema?.alias || 'Consultar Admin')}
                                </div>
                                <div className="p-3 bg-white rounded-lg border">
                                    <b>Banco:</b> {loadingSuprema ? <span className="animate-pulse">...</span> : (configSuprema?.banco || 'Consultar Admin')}
                                </div>
                                <div className="p-3 bg-white rounded-lg border font-bold text-orange-600">
                                    <b>Monto:</b> $ {selectedPlan?.precio.toLocaleString('es-AR')}
                                </div>
                                <div className="p-3 bg-white rounded-lg border md:col-span-2">
                                    <b>Titular:</b> {loadingSuprema ? <span className="animate-pulse">Cargando...</span> : (configSuprema?.titular || 'COMMON NETWORK S.A.')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase text-neutral-500">N° de Operación de la Transferencia</label>
                            <input
                                type="text"
                                placeholder="Ej: 1234567890"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="w-full h-14 bg-neutral-100 border-none rounded-xl px-4 font-bold text-lg focus:ring-2 ring-orange-600 transition-all"
                            />
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 h-14 bg-orange-600 hover:bg-orange-500 font-black text-lg"
                                    disabled={!transactionId || requestReload.isPending}
                                    onClick={() => requestReload.mutate(selectedPlan)}
                                >
                                    {requestReload.isPending ? 'Procesando...' : 'Confirmar y Cargar'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-14 px-6 text-neutral-400"
                                    onClick={() => { setShowBillingForm(false); setSelectedPlan(null); }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-center gap-8 py-4 opacity-30 grayscale items-center grayscale">
                            <ShieldCheck size={20} />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 italic">Seguridad de Datos Cifrada</span>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
