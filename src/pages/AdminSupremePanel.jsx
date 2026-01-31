import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Shield, Activity, CheckCircle2, AlertCircle, Loader2, ExternalLink, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// HARDCODED SUPER ADMIN ID (As per requirement)
const SUPER_ADMIN_ID = "14349463-549c-4bf9-b223-95b058a7493a";
const ADMIN_SECRET_CODE = "abriteporfavor"; // Clave de acceso manual

export default function AdminSupremePanel() {
    const navigate = useNavigate();
    const { user, loading } = useAuth(); // Eliminamos hasAccess que no existe
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Estado local para acceso manual
    const [isManualAuth, setIsManualAuth] = useState(false);
    const [secretInput, setSecretInput] = useState("");
    const [showLogin, setShowLogin] = useState(true);

    // Verificar si ya tenemos acceso por sesión o previo ingreso
    const isSuperUser = user && (user.id === SUPER_ADMIN_ID || user.email?.toLowerCase() === "maxjorboz@gmail.com");
    const hasAccess = isSuperUser || isManualAuth;

    useEffect(() => {
        // Chequeo de persistencia simple
        const storedAuth = localStorage.getItem('admin_supreme_auth');
        if (storedAuth === ADMIN_SECRET_CODE) {
            setIsManualAuth(true);
            setShowLogin(false);
        } else if (isSuperUser) {
            setShowLogin(false);
        }
    }, [isSuperUser]);

    const handleManualLogin = (e) => {
        e.preventDefault();
        if (secretInput === ADMIN_SECRET_CODE) {
            setIsManualAuth(true);
            setShowLogin(false);
            localStorage.setItem('admin_supreme_auth', ADMIN_SECRET_CODE);
            toast({ title: "Acceso Concedido", description: "Bienvenido, Supremo." });
        } else {
            toast({ title: "Acceso Denegado", description: "Código incorrecto.", variant: "destructive" });
        }
    };

    // OBTENER SOLICITUDES
    const { data: solicitudes, isLoading: loadingSolicitudes } = useQuery({
        queryKey: ['admin-solicitudes'],
        queryFn: async () => {
            // Si no hay acceso validado, no hacemos fetch
            if (!hasAccess) return [];

            const payload = {
                action: 'list',
                admin_secret: ADMIN_SECRET_CODE // Enviamos el secreto para el backend
            };

            const response = await base44.functions.invoke('gestionarSolicitudes', payload);
            if (response.error) throw new Error(response.error.message);
            return response.data?.solicitudes || [];
        },
        enabled: hasAccess // Solo ejecutar si tenemos acceso
    });

    // APROBAR SOLICITUD
    const approveMutation = useMutation({
        mutationFn: async (id_registro) => {
            const payload = {
                action: 'approve',
                id_registro,
                admin_secret: ADMIN_SECRET_CODE
            };
            const response = await base44.functions.invoke('gestionarSolicitudes', payload);
            if (response.error) throw new Error(response.error.message || response.data?.error);
            return response.data;
        },
        onSuccess: (data) => {
            toast({ title: "Comercio Aprobado", description: `ID Asignado: ${data.new_id}` });
            queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    // TOGGLE STATUS
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id_registro, active, commerce_code }) => {
            const payload = {
                action: 'toggle_active',
                id: id_registro,
                commerce_code,
                active,
                admin_secret: ADMIN_SECRET_CODE
            };
            const response = await base44.functions.invoke('gestionarSolicitudes', payload);
            if (response.error) throw new Error(response.error.message || response.data?.error);
            return response.data;
        },
        onSuccess: () => {
            toast({ title: "Estado Actualizado", description: "El estado del comercio ha cambiado." });
            queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    // RENDER: PANTALLA DE BLOQUEO
    if (loading) return null;

    if (showLogin && !hasAccess) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md bg-neutral-900 border-neutral-800">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-orange-500" />
                        </div>
                        <CardTitle className="text-white uppercase tracking-widest">Acceso Restringido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleManualLogin} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Ingresa el Código Maestro"
                                value={secretInput}
                                onChange={(e) => setSecretInput(e.target.value)}
                                className="bg-black border-neutral-700 text-center tracking-widest font-mono"
                            />
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 font-bold">
                                INGRESAR AL PANEL
                            </Button>
                        </form>
                        <Button variant="link" onClick={() => navigate('/')} className="w-full text-neutral-500 mt-4">
                            Volver al Inicio
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const displayEmail = user?.email || "Supremo (Acceso Manual)";
    const pendientes = solicitudes?.filter(s => s.aprobacion_pendiente) || [];
    const activos = solicitudes?.filter(s => !s.aprobacion_pendiente) || [];

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <header className="mb-12 flex items-center justify-between border-b border-neutral-900 pb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                        <Shield className="text-orange-600" size={32} />
                        Administrador Supremo
                    </h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">
                        Gestión Global de la Plataforma
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-white">{displayEmail}</p>
                        <p className="text-xs text-orange-600 uppercase font-black tracking-widest">Super Admin</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-950/20"
                        onClick={() => {
                            localStorage.removeItem('admin_supreme_auth');
                            setIsManualAuth(false);
                            setShowLogin(true);
                            navigate('/');
                        }}
                    >
                        Salir
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SOLICITUDES PENDIENTES */}
                <Card className="bg-neutral-900 border-neutral-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic">
                            <AlertCircle className="text-orange-600" /> Pagos Pendientes de Aprobación ({pendientes.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingSolicitudes ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-orange-600" /></div>
                        ) : pendientes.length === 0 ? (
                            <div className="text-center p-8 text-neutral-500 italic">No hay pagos pendientes por validar</div>
                        ) : (
                            <div className="space-y-4">
                                {pendientes.map((sol) => (
                                    <div key={sol.id} className="bg-black/40 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{sol.nombre_comercio}</h3>
                                            <p className="text-sm text-neutral-400">{sol.email_admin} • {sol.whatsapp}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <p className="text-xs bg-orange-900/30 text-orange-500 px-2 py-1 rounded font-mono">OP: {sol.numero_operacion}</p>
                                                <p className="text-xs text-neutral-500 font-bold uppercase">Plan Inicial: $2.000 (Crédito)</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => approveMutation.mutate(sol.id_registro)}
                                            disabled={approveMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700 font-bold uppercase italic"
                                        >
                                            {approveMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                            Validar Pago y Activar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* COMERCIOS ACTIVOS */}
                <Card className="bg-neutral-900 border-neutral-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic">
                            <Activity className="text-blue-500" /> Comercios Activos ({activos.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingSolicitudes ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activos.map((com) => (
                                    <div key={com.id} className={`p-4 rounded-xl border transition-all ${com.activo ? 'bg-neutral-950 border-neutral-800' : 'bg-red-950/20 border-red-900/50'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-bold text-white text-sm truncate pr-2">{com.nombre_comercio}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-neutral-500 font-mono">{com.commerce_code}</p>
                                                    <a
                                                        href={`/tienda/${com.commerce_code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-orange-500 hover:text-orange-400"
                                                        title="Ver tienda pública"
                                                    >
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-1.5 ${com.activo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${com.activo ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                {com.activo ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleStatusMutation.mutate({
                                                    id_registro: com.id_registro,
                                                    active: !com.activo,
                                                    commerce_code: com.commerce_code
                                                })}
                                                disabled={toggleStatusMutation.isPending}
                                                className={`w-full text-xs font-bold uppercase italic h-8 ${com.activo ? 'hover:bg-red-900/20 hover:text-red-500 border-neutral-800' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}`}
                                            >
                                                {toggleStatusMutation.isPending ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : com.activo ? (
                                                    "Deshabilitar"
                                                ) : (
                                                    "Habilitar"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
