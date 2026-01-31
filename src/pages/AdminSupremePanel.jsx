import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Admin Supreme Panel Implementation
import { useAuth } from '@/lib/AuthContext';
import { Shield, Activity, CheckCircle2, AlertCircle, Loader2, ExternalLink, Lock, DollarSign, Wallet, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { base44 } from '@/api/base44Client';
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminSupremePanel() {
    const navigate = useNavigate();
    const { user } = useAuth(); // Solo para mostrar el email si está
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Estado para el formulario CBU
    const [cbuForm, setCbuForm] = useState({ cbu: '', alias: '', banco: '', titular: '' });

    // --- QUERIES (Sin validaciones, directas al grano) ---

    // 1. OBTENER CONFIGURACION FINANCIERA (CBU)
    const { data: configFinanciera } = useQuery({
        queryKey: ['config-suprema'],
        queryFn: async () => {
            const resp = await base44.functions.invoke('configuracionSuprema', { action: 'obtener' });
            return resp.data?.config || {};
        }
    });

    useEffect(() => {
        if (configFinanciera) setCbuForm(configFinanciera);
    }, [configFinanciera]);

    // 2. OBTENER PAGOS PENDIENTES
    const { data: pagosPendientes, isLoading: loadingPagos } = useQuery({
        queryKey: ['pagos-publicidad', 'pendiente'],
        queryFn: async () => {
            // Ya no mandamos admin_secret porque el backend está libre
            const resp = await base44.functions.invoke('gestionarPagosPublicidad', {
                action: 'listar',
                estado: 'pendiente'
            });
            return resp.data?.pagos || [];
        }
    });

    // 3. OBTENER SOLICITUDES / COMERCIOS (Unificado)
    const { data: solicitudes, isLoading: loadingSolicitudes } = useQuery({
        queryKey: ['admin-solicitudes'],
        queryFn: async () => {
            const payload = { action: 'list' };
            const response = await base44.functions.invoke('gestionarSolicitudes', payload);
            return response.data?.solicitudes || [];
        }
    });

    // --- MUTATIONS ---

    // A. GUARDAR CBU
    const guardarConfigMutation = useMutation({
        mutationFn: async (nuevoConfig) => {
            const resp = await base44.functions.invoke('configuracionSuprema', {
                action: 'guardar',
                config: nuevoConfig
            });
            if (resp.error) throw new Error(resp.error.message);
            return resp.data;
        },
        onSuccess: () => toast({ title: "Configuración Guardada", description: "Tus datos bancarios han sido actualizados." }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    // B. APROBAR PAGO PUBLICIDAD
    const aprobarPagoMutation = useMutation({
        mutationFn: async (id_pago) => {
            const resp = await base44.functions.invoke('gestionarPagosPublicidad', {
                action: 'aprobar',
                id_pago
            });
            if (resp.error) throw new Error(resp.error.message || resp.data?.error);
            return resp.data;
        },
        onSuccess: (data) => {
            toast({ title: "Pago Aprobado", description: `Se acreditó el saldo. Nuevo saldo: $${data.nuevo_saldo}` });
            queryClient.invalidateQueries({ queryKey: ['pagos-publicidad'] });
            queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    // C. TOGGLE STATUS (HABILITAR / DESHABILITAR COMERCIO)
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id_registro, active, commerce_code }) => {
            const payload = {
                action: 'toggle_active',
                id: id_registro,
                commerce_code,
                active
            };
            const response = await base44.functions.invoke('gestionarSolicitudes', payload);
            if (response.error) throw new Error(response.error.message || response.data?.error);
            return response.data;
        },
        onSuccess: () => {
            toast({ title: "Estado Actualizado", description: "El estado del comercio ha cambiado." });
            queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    // D. APROBAR REGISTRO INICIAL
    const approveRegisterMutation = useMutation({
        mutationFn: async (id_registro) => {
            const payload = { action: 'approve', id_registro };
            const response = await base44.functions.invoke('gestionarSolicitudes', payload);
            if (response.error) throw new Error(response.error.message || response.data?.error);
            return response.data;
        },
        onSuccess: (data) => {
            toast({ title: "Comercio Aprobado", description: `ID: ${data.new_id}` });
            queryClient.invalidateQueries({ queryKey: ['admin-solicitudes'] });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });


    // --- RENDERS ---

    const displayEmail = user?.email || "Super Admin";
    const pendientesRegistro = solicitudes?.filter(s => s.aprobacion_pendiente) || [];
    const comerciosActivos = solicitudes?.filter(s => !s.aprobacion_pendiente) || [];

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <header className="mb-8 flex items-center justify-between border-b border-neutral-900 pb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                        <Shield className="text-orange-600" size={32} />
                        Administrador Supremo
                    </h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">
                        Gestión Global de la Plataforma
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">{displayEmail}</p>
                        <p className="text-[10px] text-orange-600 uppercase font-black tracking-widest">Super Admin</p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="comercios" className="space-y-6">
                <TabsList className="bg-neutral-900 border-neutral-800">
                    <TabsTrigger value="comercios" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        <Store className="w-4 h-4 mr-2" /> Comercios
                    </TabsTrigger>
                    <TabsTrigger value="pagos" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        <DollarSign className="w-4 h-4 mr-2" /> Pagos ({pagosPendientes?.length || 0}) / Pendientes
                    </TabsTrigger>
                    <TabsTrigger value="finanzas" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        <Wallet className="w-4 h-4 mr-2" /> Mis Datos Bancarios
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB COMERCIOS (Gestión General) --- */}
                <TabsContent value="comercios">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* REGISTROS PENDIENTES */}
                        <Card className="bg-neutral-900 border-neutral-800 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic text-sm">
                                    <AlertCircle className="text-orange-600" size={16} /> Nuevos Registros ({pendientesRegistro.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingSolicitudes ? <Loader2 className="animate-spin text-orange-600 mx-auto" /> :
                                    pendientesRegistro.length === 0 ? <p className="text-neutral-500 text-sm italic text-center">Sin registros pendientes</p> :
                                        (
                                            <div className="space-y-2">
                                                {pendientesRegistro.map(sol => (
                                                    <div key={sol.id} className="bg-black/40 p-3 rounded-lg border border-neutral-800 flex justify-between items-center text-sm">
                                                        <div>
                                                            <span className="font-bold text-white block">{sol.nombre_comercio}</span>
                                                            <span className="text-neutral-500 text-xs">{sol.email_admin} | OP: {sol.numero_operacion}</span>
                                                        </div>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 text-xs" onClick={() => approveRegisterMutation.mutate(sol.id_registro)}>
                                                            Validar y Activar
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                }
                            </CardContent>
                        </Card>
                    </div>

                    {/* LISTADO MAESTRO */}
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic text-sm">
                                <Activity className="text-blue-500" size={16} /> Listado Maestro de Comercios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-neutral-800 hover:bg-transparent">
                                        <TableHead className="text-neutral-400">Comercio</TableHead>
                                        <TableHead className="text-neutral-400">Código</TableHead>
                                        <TableHead className="text-neutral-400">Saldo Publicidad</TableHead>
                                        <TableHead className="text-neutral-400">Estado</TableHead>
                                        <TableHead className="text-neutral-400 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingSolicitudes ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
                                    ) : comerciosActivos.map((com) => (
                                        <TableRow key={com.id} className="border-neutral-800 hover:bg-neutral-800/50">
                                            <TableCell className="font-bold text-white">{com.nombre_comercio}</TableCell>
                                            <TableCell className="font-mono text-xs text-neutral-400">{com.commerce_code}</TableCell>
                                            <TableCell className="font-mono text-green-500 font-bold">
                                                ${com.saldo_publicidad?.toLocaleString() || '0'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${com.activo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {com.activo ? 'Activo' : 'Pausado'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <a href={`/tienda/${com.commerce_code}`} target="_blank" rel="noreferrer" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 text-neutral-300">
                                                    <ExternalLink size={14} />
                                                </a>
                                                <Button
                                                    size="sm"
                                                    variant={com.activo ? "destructive" : "default"}
                                                    className={`h-8 text-xs ${!com.activo && "bg-green-600 hover:bg-green-700"}`}
                                                    onClick={() => toggleStatusMutation.mutate({ id_registro: com.id_registro, active: !com.activo, commerce_code: com.commerce_code })}
                                                >
                                                    {com.activo ? "Bloquear" : "Habilitar"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB PAGOS (Aprobación) --- */}
                <TabsContent value="pagos">
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-white font-black uppercase italic text-sm">
                                Pagos de Publicidad Recibidos ({pagosPendientes?.length || 0})
                            </CardTitle>
                            <CardDescription className="text-neutral-500">
                                Verifica el comprobante en tu banco antes de aprobar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingPagos ? <Loader2 className="animate-spin text-orange-600 mx-auto" /> :
                                pagosPendientes.length === 0 ? <div className="p-8 text-center text-neutral-500 italic">No hay pagos pendientes de aprobación.</div> :
                                    (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-neutral-800">
                                                    <TableHead className="text-neutral-400">Fecha</TableHead>
                                                    <TableHead className="text-neutral-400">Comercio</TableHead>
                                                    <TableHead className="text-neutral-400">Monto</TableHead>
                                                    <TableHead className="text-neutral-400">Comprobante</TableHead>
                                                    <TableHead className="text-right text-neutral-400">Acción</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pagosPendientes.map(pago => (
                                                    <TableRow key={pago.id || pago._id} className="border-neutral-800">
                                                        <TableCell className="text-neutral-300 text-xs">
                                                            {new Date(pago.fecha_reporte).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-white">{pago.nombre_comercio}</TableCell>
                                                        <TableCell className="text-green-500 font-bold font-mono text-base">
                                                            ${pago.monto?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-neutral-400 font-mono text-xs max-w-[200px] truncate" title={pago.comprobante}>
                                                            {pago.comprobante}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white font-bold h-8"
                                                                onClick={() => aprobarPagoMutation.mutate(pago.id || pago._id)}
                                                            >
                                                                <CheckCircle2 size={14} className="mr-2" /> Confirmar
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB FINANZAS (Configuración CBU) --- */}
                <TabsContent value="finanzas">
                    <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-white font-black uppercase italic text-sm">
                                Tus Datos Bancarios
                            </CardTitle>
                            <CardDescription className="text-neutral-500">
                                Estos datos serán visibles para todos los comercios cuando necesiten cargar saldo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400 font-bold uppercase">Banco / Billetera</label>
                                    <Input
                                        className="bg-black border-neutral-800 text-white"
                                        placeholder="Ej: Mercado Pago, Banco Nación..."
                                        value={cbuForm.banco}
                                        onChange={e => setCbuForm({ ...cbuForm, banco: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400 font-bold uppercase">Titular</label>
                                    <Input
                                        className="bg-black border-neutral-800 text-white"
                                        placeholder="Nombre del Titular"
                                        value={cbuForm.titular}
                                        onChange={e => setCbuForm({ ...cbuForm, titular: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs text-neutral-400 font-bold uppercase">CBU / CVU</label>
                                    <Input
                                        className="bg-black border-neutral-800 text-white font-mono tracking-widest"
                                        placeholder="0000000000000000000000"
                                        value={cbuForm.cbu}
                                        onChange={e => setCbuForm({ ...cbuForm, cbu: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs text-neutral-400 font-bold uppercase">Alias</label>
                                    <Input
                                        className="bg-black border-neutral-800 text-white font-bold uppercase"
                                        placeholder="MI.ALIAS.MP"
                                        value={cbuForm.alias}
                                        onChange={e => setCbuForm({ ...cbuForm, alias: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 font-bold mt-4"
                                onClick={() => guardarConfigMutation.mutate(cbuForm)}
                            >
                                Guardar Cambios
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
