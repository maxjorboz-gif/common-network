import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, User, Phone, Mail, Hash, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminSolicitudes() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: solicitudes, isLoading } = useQuery({
        queryKey: ['solicitudes-comercio'],
        queryFn: async () => {
            const response = await base44.functions.invoke('gestionarSolicitudes', { action: 'list' });
            return response.data.solicitudes || [];
        }
    });

    const handleHabilitar = async (idComercio) => {
        try {
            const { data } = await base44.functions.invoke('gestionarSolicitudes', {
                action: 'approve',
                id_comercio: idComercio
            });
            if (data.success) {
                toast({ title: "Comercio Activado", description: "El comercio ya puede operar." });
                queryClient.invalidateQueries(['solicitudes-comercio']);
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tight">Solicitudes Pendientes</h2>

            <div className="grid grid-cols-1 gap-4">
                {solicitudes.length === 0 && (
                    <Card className="bg-white border-dashed border-2">
                        <CardContent className="py-12 text-center text-neutral-400">
                            No hay solicitudes pendientes de activación.
                        </CardContent>
                    </Card>
                )}

                {solicitudes.map((sol) => (
                    <Card key={sol.id} className="overflow-hidden border-orange-500/20 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                                            {sol.nombre_comercio?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-neutral-900">{sol.nombre_comercio}</h3>
                                            <p className="text-xs text-neutral-500">ID: {sol.id_comercio}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                                        Pendiente de Pago
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-600">
                                        <Mail className="w-4 h-4" /> {sol.email_admin}
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-600">
                                        <Phone className="w-4 h-4" /> {sol.whatsapp}
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-orange-600">
                                        <Hash className="w-4 h-4" /> Op: {sol.numero_operacion || 'Sin número'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 p-6 flex items-center gap-3 border-l md:w-48 justify-center">
                                <Button
                                    onClick={() => handleHabilitar(sol.id_comercio)}
                                    className="bg-green-600 hover:bg-green-700 text-white w-full font-bold uppercase italic text-xs"
                                >
                                    <Check className="w-4 h-4 mr-2" /> Activar
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
