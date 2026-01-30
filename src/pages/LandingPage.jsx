import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Shield, Zap, ArrowRight, Store, Globe, Star, Users, Banknote, CreditCard, PieChart, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function LandingPage() {
    const { isCommerceAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-neutral-950 text-white overflow-hidden relative">

            {/* Background Texture & Image Overlay */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.07] grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950"></div>
            </div>

            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-[0.3em] mb-8">
                            La Evolución del E-commerce Emprendedor
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
                            Tu marca en <br />
                            <span className="text-orange-600">toda la red</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-neutral-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                            La plataforma definitiva para E-comerce emprendedores/as. Crea tu tienda profesional en minutos,
                            gestiona pedidos y escala tu negocio con tecnología de punta.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            {isCommerceAuthenticated ? (
                                <Link to="/adminpanel">
                                    <Button size="lg" className="h-16 px-10 bg-green-600 hover:bg-green-700 text-white font-black italic uppercase rounded-2xl text-lg shadow-[0_0_40px_rgba(22,163,74,0.3)] group">
                                        Ir a mi Panel <LayoutDashboard className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/registro">
                                    <Button size="lg" className="h-16 px-10 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-2xl text-lg shadow-[0_0_40px_rgba(234,88,12,0.3)] group">
                                        Empezar a Vender <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid Section - UPDATED BY USER REQUEST */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 italic">
                            Tu tienda es tuya. <br />
                            <span className="text-orange-600">Manejala como quieras.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Banknote className="w-8 h-8 text-orange-600" />}
                            title="Dinero al Instante"
                            description="Maneja tu dinero al instante. Sin esperas, cobras y dispones de tus fondos."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-8 h-8 text-orange-600" />}
                            title="Pago Único"
                            description="Pago único por creación de la tienda. Sin suscripciones mensuales abusivas."
                        />
                        <FeatureCard
                            icon={<PieChart className="w-8 h-8 text-orange-600" />}
                            title="Comisión Justa"
                            description="Pagas solo si vendes: entre 5% y 10% de tus ventas. Transparencia total."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-orange-600" />}
                            title="Publicidad Gratis"
                            description="No te cobramos por publicidad. Tu crecimiento es nuestro éxito."
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="relative z-10 py-20 border-y border-neutral-900 bg-neutral-900/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <StatItem count="+100" label="Socio-Vendedores" />
                        <StatItem count="24/7" label="Soporte Técnico" />
                        <StatItem count="API" label="Integración" />
                        <StatItem count="100%" label="Efectividad" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-3xl mx-auto bg-gradient-to-br from-orange-600 to-red-800 p-1 rounded-[3rem] shadow-[0_0_100px_rgba(234,88,12,0.1)]">
                    <div className="bg-neutral-950 rounded-[2.8rem] p-12 md:p-20 text-center">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 italic">
                            ¿Listo para dar el salto?
                        </h2>
                        <p className="text-neutral-400 text-lg mb-12">
                            Únete a la red de emprendedores digitales más grande de la región.
                        </p>

                        {isCommerceAuthenticated ? (
                            <Link to="/adminpanel">
                                <Button size="lg" className="h-16 px-12 bg-white text-black hover:bg-neutral-200 font-black italic uppercase rounded-2xl text-lg">
                                    Ir a mi Panel
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/registro">
                                <Button size="lg" className="h-16 px-12 bg-white text-black hover:bg-neutral-200 font-black italic uppercase rounded-2xl text-lg">
                                    Registrar mi Marca
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group p-10 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 flex flex-col h-full">
            <div className="mb-6 p-4 bg-orange-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-black italic uppercase mb-4">{title}</h3>
            <p className="text-neutral-400 font-medium leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function StatItem({ count, label }) {
    return (
        <div>
            <div className="text-4xl md:text-5xl font-black italic uppercase text-white mb-2">{count}</div>
            <div className="text-orange-600 font-bold uppercase tracking-widest text-xs">{label}</div>
        </div>
    );
}


