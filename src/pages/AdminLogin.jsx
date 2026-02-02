import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {
            // Nota: Usamos invoke directo. La función espera { email, password }
            const resultRaw = await base44.functions.invoke('loginSuperAdmin', { email, password });

            // Manejo estricto de respuesta
            const data = resultRaw.data || resultRaw;

            if (data.error || !data.success) {
                toast({
                    title: "Acceso Denegado",
                    description: "Credenciales inválidas.",
                    variant: "destructive"
                });
                // Limpiamos password por seguridad
                setPassword('');
                return;
            }

            // ÉXITO: Guardamos token seguro
            if (data.token) {
                localStorage.setItem('super_admin_token', data.token);
                localStorage.setItem('super_admin_user', JSON.stringify(data.admin));

                toast({ title: "Bienvenido, Supremo.", description: "Iniciando sistema..." });

                // Redirección inmediata SPA
                navigate('/adminSupreme');
            }

        } catch (error) {
            console.error(error);
            toast({ title: "Error de Sistema", description: "No se pudo conectar con el servidor.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in duration-700">
                <div className="text-center mb-8">
                    <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest italic">
                        Acceso Restringido
                    </h1>
                    <p className="text-neutral-500 text-xs mt-2 uppercase tracking-wide">
                        Solo personal autorizado nivel global
                    </p>
                </div>

                <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-center text-sm font-bold uppercase flex items-center justify-center gap-2">
                            <Lock size={16} /> Credenciales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500">Email Corporativo</label>
                                <Input
                                    type="email"
                                    className="bg-black border-neutral-800 text-white h-12"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@plataforma.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500">Llave Maestra</label>
                                <Input
                                    type="password"
                                    className="bg-black border-neutral-800 text-white h-12"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-orange-700 hover:bg-orange-600 font-bold uppercase tracking-widest mt-6"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-neutral-800 pt-6">
                        <div className="flex items-center gap-2 text-neutral-600 text-[10px] uppercase">
                            <AlertCircle size={12} />
                            <span>Acceso monitoreado y auditado</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
