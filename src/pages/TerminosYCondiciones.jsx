import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TerminosYCondiciones() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 mb-8 text-neutral-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all"
                >
                    <ArrowLeft size={14} /> Volver
                </button>

                <h1 className="text-4xl font-black uppercase italic tracking-tight mb-8">Términos y Condiciones</h1>

                <div className="space-y-6 text-neutral-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-white mb-2 uppercase">1. Uso del servicio</h2>
                        <p>Al utilizar esta plataforma, el usuario acepta los presentes términos y condiciones de uso. La plataforma ofrece servicios de e-commerce multi-comercio.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white mb-2 uppercase">2. Compras y pagos</h2>
                        <p>Las compras realizadas están sujetas a disponibilidad de stock. Los precios pueden variar según el método de pago seleccionado. Los descuentos por transferencia bancaria se aplicarán automáticamente al finalizar la compra.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white mb-2 uppercase">3. Envíos</h2>
                        <p>Los tiempos y costos de envío dependen de cada comercio y zona de entrega. El costo de envío se informará durante el proceso de checkout.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white mb-2 uppercase">4. Devoluciones</h2>
                        <p>Las políticas de devolución son responsabilidad de cada comercio. Contactar directamente al vendedor para gestionar cambios o devoluciones.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white mb-2 uppercase">5. Privacidad</h2>
                        <p>Los datos personales recopilados son utilizados exclusivamente para procesar pedidos y mejorar la experiencia de compra, nunca serán vendidos a terceros.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}