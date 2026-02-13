import React, { useState, useEffect } from 'react';
import { X, Trophy, Gift, MessageCircle, Mail, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'react-hot-toast';

export default function PopupLeadHook({
  isOpen,
  onClose,
  comercio,
  sorteo = null,
  id_cliente = null
}) {
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Si ya tenemos datos de identidad del cliente (porque volvió), los precargamos
  useEffect(() => {
    if (isOpen && !whatsapp) {
      // Intentar recuperar de localStorage si no viene por props
      const savedId = localStorage.getItem('cliente_id');
      // Nota: En una app real, aquí haríamos un fetch o usaríamos el estado global
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!whatsapp || whatsapp.length < 8) {
      setError('Ingresa un número de WhatsApp válido');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Usamos la nueva función centralizada de sorteos
      const res = await base44.functions.invoke('participarSorteo', {
        nombre_completo: nombre,
        email: email,
        whatsapp: whatsapp,
        commerce_code: comercio?.commerce_code || comercio?.id_comercio,
        sorteo_id: sorteo?.id || sorteo?._id,
        userAgent: navigator.userAgent
      });

      if (res.data?.success) {
        // Guardamos la identidad para que la app lo reconozca después
        if (res.data.clienteId) {
          localStorage.setItem('cliente_id', res.data.clienteId);
        }

        setSuccess(true);
        toast.success("¡Ya estás participando!");

        // Cerrar después de 4 segundos para que vea el éxito
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 4000);
      } else {
        throw new Error(res.data?.error || "Error al registrar");
      }

    } catch (err) {
      console.error('Error sorteo:', err);
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !sorteo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="bg-neutral-900 border border-white/10 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

          {/* Header con Sorteo */}
          <div className="p-8 text-center relative z-10">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-20 h-20 bg-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
              <Trophy className="w-10 h-10 text-orange-500 animate-bounce" />
            </div>

            <h3 className="text-3xl md:text-4xl font-black italic uppercase italic tracking-tighter text-white mb-2">
              ¡Participá del Sorteo!
            </h3>
            <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-6">
              PREMIO: {sorteo.titulo}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-10 relative z-10">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <Star className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">¡Inscripción Exitosa!</h4>
                <p className="text-neutral-400">
                  Mucha suerte. Te avisaremos por WhatsApp si resultas ganador.
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-neutral-400 text-center mb-8">
                  Ingresá tus datos para participar. <br />
                  <strong>Nosotros te traemos los mejores productos, vos solo disfrutá.</strong>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nombre Completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="h-14 bg-neutral-800 border-neutral-700 text-white rounded-2xl pl-12"
                      required
                    />
                    <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                  </div>

                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Tu mejor Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 bg-neutral-800 border-neutral-700 text-white rounded-2xl pl-12"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                  </div>

                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="WhatsApp (Cód área + número)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      className="h-14 bg-neutral-800 border-neutral-700 text-white rounded-2xl pl-12"
                      required
                    />
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-bold text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-orange-600/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      'Quiero Participar Ahora'
                    )}
                  </Button>
                </form>

                <p className="text-[10px] text-neutral-600 text-center mt-6 uppercase tracking-widest font-bold">
                  * Participación gratuita. Privacidad protegida por Base44.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}