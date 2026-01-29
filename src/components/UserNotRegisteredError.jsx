import React from 'react';
import { ShieldAlert, LogOut, MessageSquareText, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * LEY DE MEMORIA: Error de acceso restringido.
 * Estética: Dark Premium (neutral-950) con acentos de advertencia en orange-600.
 * Objetivo: Mantener la autoridad de la marca incluso en el error.
 */
const UserNotRegisteredError = () => {
  const handleLogout = () => {
    // Lógica para cerrar sesión y limpiar caché de base44
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 selection:bg-orange-500/30">
      <div className="max-w-md w-full p-8 bg-neutral-900 rounded-3xl border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute -top-10 -right-10 opacity-5">
          <Flame className="w-40 h-40 text-white" />
        </div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-orange-600/10 border border-orange-500/20">
            <ShieldAlert className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">
            Acceso Restringido
          </h1>
          
          <p className="text-neutral-400 mb-8 font-medium">
            Tu cuenta no está registrada en nuestra red de asadores. Para acceder a la gestión de pedidos, debés ser un administrador autorizado.
          </p>

          <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 text-left mb-8">
            <p className="text-orange-500 font-bold text-sm mb-3 uppercase tracking-wider">¿Qué podés hacer?</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                <span>Verificá si usaste el email correcto de administrador.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                <span>Contactá al soporte técnico de <strong>Common Network</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => window.location.href = 'https://wa.me/tu_numero'} 
              className="bg-orange-600 hover:bg-orange-500 text-white font-black h-12 rounded-xl"
            >
              <MessageSquareText className="w-5 h-5 mr-2" /> SOLICITAR ACCESO
            </Button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm font-bold py-2"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión y reintentar
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-neutral-600 text-xs font-medium uppercase tracking-[0.2em]">
        Common Network — Hardware para el Fuego
      </p>
    </div>
  );
};

export default UserNotRegisteredError;