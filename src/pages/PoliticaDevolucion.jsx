import React from 'react';
import { ArrowLeft, RefreshCw, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function PoliticaDevolucion() {
  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-300 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a la tienda</span>
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4">Política de Devolución</h1>
          <p className="text-neutral-400 mb-8">Fecha de Última Actualización: 15 de enero de 2026</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-neutral-800 border border-amber-900/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-amber-100 mb-2">10 Días</h3>
              <p className="text-sm text-neutral-400">Para ejercer tu derecho de arrepentimiento</p>
            </div>

            <div className="bg-neutral-800 border border-amber-900/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-amber-100 mb-2">Garantía Legal</h3>
              <p className="text-sm text-neutral-400">6 meses por defectos de fábrica</p>
            </div>

            <div className="bg-neutral-800 border border-amber-900/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-amber-100 mb-2">Reembolso</h3>
              <p className="text-sm text-neutral-400">Hasta 15 días hábiles</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-neutral-300">
            <p className="text-amber-100 text-lg">
              En <strong>Common Network</strong>, tu satisfacción es nuestra prioridad. Si no estás conforme con tu compra, te ofrecemos la posibilidad de realizar devoluciones y cambios de acuerdo con las siguientes condiciones.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-amber-100 mt-8 mb-4">1. Derecho de Revocación (Arrepentimiento de Compra)</h2>
              <p>
                De acuerdo con el Artículo 34 de la Ley de Defensa del Consumidor N° 24.240 y concordantes, el consumidor tiene derecho a revocar la aceptación del producto o servicio adquirido, dentro del plazo de <strong>DIEZ (10) días corridos</strong> contados a partir de la fecha en que se entregue el bien o se celebre el contrato, lo último que ocurra.
              </p>
              <p className="mt-4">
                Para ejercer este derecho, el producto debe encontrarse en las mismas condiciones en que fue recibido, sin uso, con sus etiquetas y empaques originales, y con todos sus accesorios y manuales (si los tuviera).
              </p>
              <div className="bg-amber-950 border border-amber-800 rounded-lg p-4 mt-4">
                <p className="text-amber-100 font-semibold mb-2">📞 Para iniciar el proceso de revocación:</p>
                <p className="text-sm">
                  Comunícate con nuestro servicio de atención al cliente a través de WhatsApp o email dentro del plazo establecido, indicando tu número de orden y el motivo de la revocación.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-amber-100 mt-8 mb-4">2. Devoluciones por Fallas o Defectos de Fábrica</h2>
              <p>
                Si el producto presenta alguna falla o defecto de fabricación dentro del plazo de <strong>garantía legal (generalmente 6 meses desde la entrega según Ley 24.240)</strong>, usted podrá solicitar la reparación, cambio o devolución del dinero, según corresponda y lo determine Common Network en base a la evaluación del producto.
              </p>
              <p className="mt-4">
                Para reportar una falla o defecto, por favor, contáctenos con su número de orden, una descripción detallada del problema y, si es posible, fotografías o videos que evidencien la falla.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-amber-100 mt-8 mb-4">3. Condiciones Generales para Devoluciones y Cambios</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-amber-100 mb-2">📅 Plazo</h3>
                  <p>Toda devolución o cambio debe solicitarse dentro de los plazos establecidos en los puntos 1 y 2.</p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-100 mb-2">📦 Estado del Producto</h3>
                  <p>
                    El producto debe estar en perfectas condiciones, sin uso (excepto en caso de falla de fábrica), con el embalaje original intacto, etiquetas, accesorios, manuales y cualquier obsequio promocional incluido. No se aceptarán productos incompletos, dañados, usados o sin su empaque original.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-100 mb-2">🧾 Comprobante de Compra</h3>
                  <p>Es indispensable presentar la factura o comprobante de compra para procesar cualquier devolución o cambio.</p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-100 mb-2">🚚 Costo de Envío</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Revocación:</strong> Los costos de envío y retiro del producto (si aplicara) correrán por cuenta del cliente.</li>
                    <li><strong>Falla/Defecto:</strong> Si la devolución o cambio se debe a una falla o defecto de fábrica, los costos de envío y retiro serán asumidos por Common Network.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-amber-100 mb-2">⚙️ Proceso</h3>
                  <p>Una vez que hayamos recibido y verificado el estado del producto, procederemos con el cambio o la devolución del dinero.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-amber-100 mt-8 mb-4">4. Reembolsos</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Los reembolsos se realizarán por el mismo medio de pago utilizado en la compra, dentro de un plazo máximo de <strong>15 días hábiles</strong> desde la recepción y verificación del producto devuelto.</li>
                <li>En caso de que el pago se haya realizado con tarjeta de crédito, el reembolso se verá reflejado en el resumen de su tarjeta, lo cual puede demorar según los tiempos de su entidad bancaria.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-amber-100 mt-8 mb-4">5. Exclusiones (Productos que no admiten Devolución o Cambio)</h2>
              <p>
                Por razones de higiene o naturaleza específica, algunos productos podrían no admitir devoluciones o cambios. Esta información estará claramente indicada en la descripción del producto o se le informará al momento de la compra.
              </p>
            </section>

            <div className="bg-orange-950 border border-orange-800 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-amber-100 mb-3">📞 ¿Necesitás ayuda?</h3>
              <p className="text-neutral-300">
                Para cualquier consulta adicional sobre devoluciones, no dudes en contactarnos. Estamos aquí para ayudarte.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-800">
            <Link to={createPageUrl('Home')}>
              <Button className="bg-orange-700 hover:bg-orange-800">
                Volver a la tienda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
