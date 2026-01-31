import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Users, Calendar, Trash2, Plus, Gift, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminSorteos({ comercio }) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [nuevoSorteo, setNuevoSorteo] = useState({
        titulo: '',
        id_producto_premio: '',
        fecha_fin: '',
        activo: true
    });

    // 1. Obtener Sorteos
    const { data: sorteos, isLoading: loadingSorteos } = useQuery({
        queryKey: ['sorteos-admin', comercio.commerce_code],
        queryFn: async () => {
            const response = await base44.functions.invoke('gestionarSorteo', {
                action: 'list',
                commerce_code: comercio.commerce_code
            });
            return response.data?.sorteos || [];
        }
    });

    // 2. Obtener Productos (Para seleccionar el premio)
    const { data: productos } = useQuery({
        queryKey: ['productos-admin-sorteo', comercio.commerce_code],
        queryFn: async () => {
            const response = await base44.functions.invoke('obtenerProductosAdmin', {
                commerce_code: comercio.commerce_code
            });
            return response.data?.productos || [];
        }
    });

    // 3. Crear Sorteo
    const mutationCreate = useMutation({
        mutationFn: async (data) => {
            return await base44.functions.invoke('gestionarSorteo', {
                action: 'create',
                commerce_code: comercio.commerce_code,
                data
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sorteos-admin'] });
            toast.success('¡Sorteo creado con éxito! Tu plataforma ya está captando leads.');
            setShowForm(false);
            setNuevoSorteo({ titulo: '', id_producto_premio: '', fecha_fin: '', activo: true });
        }
    });

    // 4. Toggle Activo
    const mutationToggle = useMutation({
        mutationFn: async ({ id, activo }) => {
            return await base44.functions.invoke('gestionarSorteo', {
                action: 'update',
                commerce_code: comercio.commerce_code,
                sorteoId: id,
                data: { activo }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sorteos-admin'] });
            toast.success('Estado actualizado');
        }
    });

    // 5. Eliminar
    const mutationDelete = useMutation({
        mutationFn: async (id) => {
            return await base44.functions.invoke('gestionarSorteo', {
                action: 'delete',
                commerce_code: comercio.commerce_code,
                sorteoId: id
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sorteos-admin'] });
            toast.success('Sorteo eliminado');
        }
    });

    const handleCreate = () => {
        if (!nuevoSorteo.titulo || !nuevoSorteo.id_producto_premio || !nuevoSorteo.fecha_fin) {
            toast.error('Completá todos los campos para lanzar el sorteo');
            return;
        }
        mutationCreate.mutate(nuevoSorteo);
    };

    if (loadingSorteos) return <div className="text-center py-12">Cargando motor de sorteos...</div>;

    return (
        <div className="space-y-8">
            {/* Hero de Sorteos */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-10 h-10 text-white fill-white/20" />
                        <h2 className="text-3xl font-black italic uppercase italic">Ganá Clientes con Sorteos</h2>
                    </div>
                    <p className="max-w-md opacity-90 text-sm md:text-base leading-relaxed">
                        Convertí a los visitantes anónimos en clientes reales de WhatsApp sorteando uno de tus productos.
                        <strong> Nosotros nos encargamos de que el cartel sea irresistible.</strong>
                    </p>
                    {!showForm && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-white text-orange-600 hover:bg-orange-50 font-bold border-none"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Lanzar Nuevo Sorteo
                        </Button>
                    )}
                </div>
                <div className="hidden lg:block">
                    <Gift className="w-40 h-40 opacity-30 rotate-12" />
                </div>
            </div>

            {showForm && (
                <Card className="border-2 border-orange-500 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <DialogHeader className="">
                        <CardTitle>Configurá tu Sorteo</CardTitle>
                        <CardDescription>Elegí qué producto sortear y hasta cuándo dura la campaña.</CardDescription>
                    </DialogHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Frase Tentadora (Título)</Label>
                                <Input
                                    id="titulo"
                                    placeholder="Ej: ¡Participá por esta Parrilla Pro!"
                                    value={nuevoSorteo.titulo}
                                    onChange={(e) => setNuevoSorteo({ ...nuevoSorteo, titulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="premio">Producto a Sortear (Premio)</Label>
                                <Select
                                    value={nuevoSorteo.id_producto_premio}
                                    onValueChange={(val) => setNuevoSorteo({ ...nuevoSorteo, id_producto_premio: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccioná un producto de tu stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(productos || []).map((p) => (
                                            <SelectItem key={p.id || p._id} value={p.id || p._id}>
                                                {p.titulo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha">Fecha de Finalización</Label>
                                <Input
                                    id="fecha"
                                    type="datetime-local"
                                    value={nuevoSorteo.fecha_fin}
                                    onChange={(e) => setNuevoSorteo({ ...nuevoSorteo, fecha_fin: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-4 pt-8">
                                <Label>¿Activar ahora?</Label>
                                <Switch
                                    checked={nuevoSorteo.activo}
                                    onCheckedChange={(val) => setNuevoSorteo({ ...nuevoSorteo, activo: val })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700">Lanzar Sorteo</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Sorteos */}
            <div className="grid grid-cols-1 gap-6">
                {sorteos.length === 0 && !showForm && (
                    <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-white">
                        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-500">Todavía no tienes sorteos creados</h3>
                        <p className="text-sm text-gray-400">Empezá hoy a captar leads de WhatsApp fácilmente.</p>
                    </div>
                )}

                {sorteos.map((sorteo) => (
                    <Card key={sorteo.id || sorteo._id} className={sorteo.activo ? 'border-l-4 border-l-orange-500' : ''}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-xl ${sorteo.activo ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{sorteo.titulo}</h3>
                                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Fin: {new Date(sorteo.fecha_fin).toLocaleDateString('es-AR')}
                                            </span>
                                            <span className="flex items-center gap-1 font-bold text-orange-600">
                                                <Users className="w-4 h-4" />
                                                {sorteo.total_participantes || 0} Participantes
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 mr-4">
                                        <span className={`text-xs font-bold uppercase ${sorteo.activo ? 'text-green-600' : 'text-gray-400'}`}>
                                            {sorteo.activo ? 'Activo' : 'Pausado'}
                                        </span>
                                        <Switch
                                            checked={sorteo.activo}
                                            onCheckedChange={(val) => mutationToggle.mutate({ id: sorteo.id || sorteo._id, activo: val })}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('¿Seguro quieres eliminar este sorteo? Se perderán las estadísticas del mismo.')) {
                                                mutationDelete.mutate(sorteo.id || sorteo._id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info de Valor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <h4 className="font-bold">Captura sin fricción</h4>
                    <p className="text-sm text-gray-500">No pedimos login. El cliente solo deja su WhatsApp y ya es tuyo en la tabla de Leads.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <h4 className="font-bold">Sentido de Urgencia</h4>
                    <p className="text-sm text-gray-500">Mostramos un contador real hasta la fecha del sorteo para forzar la suscripción.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
                    <Gift className="w-8 h-8 text-purple-500" />
                    <h4 className="font-bold">Ganador Aleatorio</h4>
                    <p className="text-sm text-gray-500">Próximamente: Podrás elegir al ganador con un solo clic directamente desde aquí.</p>
                </div>
            </div>
        </div>
    );
}
