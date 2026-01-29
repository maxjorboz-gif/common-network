import React, { useState, useEffect } from 'react';
import { X, Gift, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { trackLead } from '@/components/meta/MetaPixelManager';

export default function PopupLeadHook({ 
  isOpen, 
  onClose, 
  comercio, 
  producto = null,
  trigger = 'popup_salida',
  textoTitulo = "¡Espera! No te vayas sin tu descuento",
  textoSubtitulo = "Déjanos tu WhatsApp y te enviamos un cupón exclusivo del 10%",
  cuponOfrecido = "BIENVENIDO10"
}) {
  const [whatsapp, setWhatsapp] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!whatsapp || whatsapp.length < 8) {
      setError('Ingresa un número de WhatsApp válido');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Crear Lead
      const lead = await base44.entities.Lead.create({
        id_comercio: comercio?.id,
        id_producto_interes: producto?.id,
        nombre: nombre,
        whatsapp: whatsapp,
        origen: trigger,
        trigger_activado: trigger,
        cupon_ofrecido: cuponOfrecido,
        estado: 'nuevo',
        suppress_ads: true
      });
      
      // Enviar evento Lead a Meta con suppress_ads
      await trackLead({ 
        lead, 
        producto,
        suppressAds: true 
      });
      
      setSuccess(true);
      
      // Cerrar después de 3 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setWhatsapp('');
        setNombre('');
      }, 3000);
      
    } catch (err) {
      console.error('Error capturando lead:', err);
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-xs uppercase tracking-wider font-medium opacity-90">
                Oferta Exclusiva
              </span>
            </div>
            <h3 className="text-2xl font-bold">{textoTitulo}</h3>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">¡Listo!</h4>
                <p className="text-gray-600">
                  Te enviaremos tu cupón <span className="font-bold text-amber-600">{cuponOfrecido}</span> por WhatsApp
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">{textoSubtitulo}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Tu WhatsApp (ej: 1155667788)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      className="h-12"
                      required
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Enviando...' : 'Quiero mi cupón'}
                  </Button>
                </form>
                
                <p className="text-xs text-gray-400 text-center mt-4">
                  Solo recibirás tu cupón. Sin spam, lo prometemos.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}