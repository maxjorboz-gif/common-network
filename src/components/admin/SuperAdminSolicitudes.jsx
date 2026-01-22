import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Check, X, User, Phone, Mail, Hash, Loader2,
    TrendingUp, Store, DollarSign, Filter, Search,
    ArrowUpRight, ArrowDownRight, Power, PowerOff, ShieldAlert
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminSolicitudes() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('recientes'); // recientes, mayor_roas, menor_roas, mayor_ventas

    const { data: solicitudes, isLoading } = useQuery({
        queryKey: ['solicitudes-comercio'],
        queryFn: async () => {
            const response = await base44.functions.invoke('gestionarSolicitudes', { action: 'list' });
            return response.data.solicitudes || [];
        }
    });

    // MOCK DATA para items que aún no existen en DB (ROAS, Ventas)
    // En una fase posterior, esto vendrá de un join o una agregación en backend
    const solicitudesConMetricas = useMemo(() => {
        if (!solicitudes) return [];
        return solicitudes.map(s => ({
            ...s,
            roas: s.roas || (Math.random() * 10).toFixed(1), // Mock
            ventas: s.ventas || Math.floor(Math.random() * 500), // Mock
            ticketPromedio: s.ticketPromedio || Math.floor(Math.random() * 15000) + 5000 // Mock
        }));
    }, [solicitudes]);

    const filteredList = useMemo(() => {
        let list = [...solicitudesConMetricas];

        // Buscador
        if (searchTerm) {
            list = list.filter(s =>
                s.nombre_comercio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.id_comercio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email_admin?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Ordenamiento
        if (filterBy === 'mayor_roas') list.sort((a, b) => b.roas - a.roas);
        if (filterBy === 'menor_roas') list.sort((a, b) => a.roas - b.roas);
        if (filterBy === 'mayor_ventas') list.sort((a, b) => b.ventas - a.ventas);
        if (filterBy === 'ticket_alto') list.sort((a, b) => b.ticketPromedio - a.ticketPromedio);

        return list;
    }, [solicitudesConMetricas, searchTerm, filterBy]);

    const handleHabilitar = async (sol) => {
        try {
            const { data } = await base44.functions.invoke('gestionarSolicitudes', {
                action: 'approve',
                id_registro: sol.id_registro,
                id_comercio: sol.id_comercio
            });
            if (data.success) {
                toast({ title: "Comercio Activado", description: "Se ha asignado un ID definitivo de 10 caracteres." });
                queryClient.invalidateQueries(['solicitudes-comercio']);
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleToggleStatus = async (idComercio, currentStatus) => {
        try {
            await base44.functions.invoke('gestionarSolicitudes', {
                action: 'toggle_active',
                id_comercio: idComercio,
                active: !currentStatus
            });
            toast({ title: "Estado actualizado", description: `Comercio ${!currentStatus ? 'activado' : 'desactivado'}` });
            queryClient.invalidateQueries(['solicitudes-comercio']);
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-600" /></div>;

    const stats = {
        totalComercios: solicitudes?.length || 0,
        activos: solicitudes?.filter(s => s.activo).length || 0,
        pendientes: solicitudes?.filter(s => s.aprobacion_pendiente).length || 0,
        recaudacionTotal: (solicitudes?.filter(s => s.pago_confirmado).length || 0) * 150000
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Comercios" value={stats.totalComercios} icon={<Store className="text-blue-500" />} />
                <StatCard title="Red Activa" value={stats.activos} icon={<Check className="text-green-500" />} />
                <StatCard title="Esperando" value={stats.pendientes} icon={<ShieldAlert className="text-orange-500" />} />
                <StatCard title="Ingresos Inscripción" value={`$${stats.recaudacionTotal.toLocaleString()}`} icon={<DollarSign className="text-emerald-500" />} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar por nombre, ID o email..."
                        className="pl-10 h-11 border-neutral-100 bg-neutral-50/50 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <FilterButton active={filterBy === 'recientes'} onClick={() => setFilterBy('recientes')}>Recientes</FilterButton>
                    <FilterButton active={filterBy === 'mayor_roas'} onClick={() => setFilterBy('mayor_roas')}>Mejor ROAS</FilterButton>
                    <FilterButton active={filterBy === 'mayor_ventas'} onClick={() => setFilterBy('mayor_ventas')}>Más Ventas</FilterButton>
                    <FilterButton active={filterBy === 'ticket_alto'} onClick={() => setFilterBy('ticket_alto')}>Ticket Prom.</FilterButton>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredList.length === 0 && (
                    <Card className="bg-white border-dashed border-2">
                        <CardContent className="py-20 text-center text-neutral-400">
                            <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            No se encontraron comercios con esos criterios.
                        </CardContent>
                    </Card>
                )}

                {filteredList.map((sol) => (
                    <Card key={sol.id} className={`overflow-hidden transition-all duration-300 ${sol.activo ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}`}>
                        <div className="flex flex-col lg:flex-row">
                            <div className="p-6 flex-1 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black italic ${sol.activo ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {sol.nombre_comercio?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black italic uppercase text-neutral-900 text-xl tracking-tight">{sol.nombre_comercio}</h3>
                                                {sol.activo ? (
                                                    <Badge className="bg-green-500/10 text-green-600 border-none text-[10px] uppercase font-bold tracking-tighter italic">Activo</Badge>
                                                ) : (
                                                    <Badge className="bg-orange-500/10 text-orange-600 border-none text-[10px] uppercase font-bold tracking-tighter italic">Esperando</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs font-mono text-neutral-400 mt-1">ID: <span className="text-neutral-900 font-bold">{sol.id_comercio}</span></p>
                                        </div>
                                    </div>

                                    {/* Métricas Mockeadas Solicitadas */}
                                    <div className="flex gap-6">
                                        <Metric v={sol.roas} l="ROAS" icon={sol.roas > 4 ? <ArrowUpRight className="text-green-500 w-3 h-3" /> : <ArrowDownRight className="text-orange-500 w-3 h-3" />} />
                                        <Metric v={sol.ventas} l="Ventas" />
                                        <Metric v={`$${(sol.ticketPromedio / 1000).toFixed(1)}k`} l="Avg. Ticket" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-100">
                                    <ContactItem icon={<Mail size={14} />} label="Email" value={sol.email_admin} />
                                    <ContactItem icon={<Phone size={14} />} label="WhatsApp" value={sol.whatsapp} />
                                    <ContactItem icon={<Hash size={14} />} label="Op. Pago" value={sol.numero_operacion || 'N/A'} highlight />
                                </div>
                            </div>

                            <div className="bg-neutral-50/50 p-6 flex flex-row lg:flex-col items-center gap-3 border-l border-neutral-100 lg:w-56 justify-center">
                                {sol.aprobacion_pendiente ? (
                                    <Button
                                        onClick={() => handleHabilitar(sol)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white w-full font-black italic uppercase text-xs h-12 rounded-xl"
                                    >
                                        <Check className="w-4 h-4 mr-2" /> Activar Comercio
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleToggleStatus(sol.id_comercio, sol.activo)}
                                        variant="outline"
                                        className={`w-full font-black italic uppercase text-xs h-12 rounded-xl bg-white ${sol.activo ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                    >
                                        {sol.activo ? <><PowerOff className="w-4 h-4 mr-2" /> Deshabilitar</> : <><Power className="w-4 h-4 mr-2" /> Habilitar</>}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase text-neutral-400 tracking-widest">{title}</p>
                    <div className="p-2 bg-neutral-50 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
                </div>
                <p className="text-3xl font-black italic uppercase tracking-tighter text-neutral-900">{value}</p>
            </CardContent>
        </Card>
    );
}

function FilterButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-xs font-black italic uppercase transition-all whitespace-nowrap border ${active ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200' : 'bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300'}`}
        >
            {children}
        </button>
    );
}

function Metric({ v, l, icon }) {
    return (
        <div className="text-right">
            <div className="flex items-center justify-end gap-1">
                {icon}
                <span className="text-sm font-black italic uppercase leading-none">{v}</span>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mt-1">{l}</p>
        </div>
    );
}

function ContactItem({ icon, label, value, highlight }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neutral-400 italic">
                {icon} {label}
            </div>
            <p className={`text-sm font-medium truncate ${highlight ? 'text-orange-600 font-bold' : 'text-neutral-700'}`}>{value}</p>
        </div>
    );
}
