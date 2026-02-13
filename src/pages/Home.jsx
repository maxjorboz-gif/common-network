import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Sparkles, Lock, Shield } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();

        if (isAuthenticated) {
          const user = await base44.auth.me();

          // CAPA 1: ¿Es admin supremo? → Panel admin directo
          if (user.role === "admin") {
            navigate('/adminSupreme');
            return;
          }

          // Si está autenticado pero NO es admin, verificar si tiene comercio
          const comercios = await base44.entities.Comercio.filter({
            user_id: user.id
          });

          if (comercios.length > 0) {
            // Ya tiene comercio registrado → ir al panel
            navigate('/merchant');
          }
          // Si no tiene comercio, se queda en Home para registrarse
        }
      } catch (error) {
        console.error('Error al verificar usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-black text-white">
              Plataforma Multi-Comercio
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Creá tu tienda online en minutos. Sin comisiones ocultas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/registro')}
                className="h-24 text-xl font-bold bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="mr-2" />
                Crear Mi Comercio
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="h-24 text-xl font-bold border-slate-600 hover:bg-slate-700 text-white"
              >
                <Lock className="mr-2" />
                Ya Tengo Cuenta
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ✨ Beneficios
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li>✅ Panel de administración completo</li>
                <li>✅ Gestión de productos y órdenes</li>
                <li>✅ Integración con Meta Pixel</li>
                <li>✅ Sistema de cupones y referidos</li>
                <li>✅ Tienda online personalizada</li>
                <li>✅ Autenticación con Google</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
