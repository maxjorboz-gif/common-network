import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PASO 1: Verificar contraseña con backend function
      const result = await base44.functions.invoke('loginComercio', {
        email: formData.email,
        password: formData.password
      });

      if (!result.success) {
        toast({
          title: "Error al iniciar sesión",
          description: result.error || "Credenciales incorrectas",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // PASO 2: Verificar Google Auth
      const isAuthenticated = await base44.auth.isAuthenticated();

      if (!isAuthenticated) {
        await base44.auth.loginWithProvider('google');
      }

      // PASO 3: Verificar que el user_id coincida
      const user = await base44.auth.me();

      if (user.id !== result.comercio.user_id) {
        toast({
          title: "Error de autenticación",
          description: "La cuenta de Google no coincide con el comercio",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "¡Bienvenido!",
        description: `Accediendo al panel de ${result.comercio.nombre}`,
      });

      // PASO 4: Redirigir al panel
      setTimeout(() => {
        navigate('/merchant');
      }, 1000);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Base44<span className="text-orange-600">Store</span>
          </Link>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-neutral-300">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-neutral-300">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold"
            disabled={loading}
          >
            {loading ? (
              'Verificando...'
            ) : (
              <>
                <Lock className="mr-2 w-5 h-5" />
                Ingresar
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-500">¿No tienes cuenta? </span>
          <Link to="/registro" className="font-medium text-orange-500 hover:text-orange-400">
            Regístrate aquí
          </Link>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full mt-4 text-neutral-400 hover:text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
