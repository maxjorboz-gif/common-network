import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Shield, Zap, ArrowRight, Store, Globe, Star, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
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
                            La Evolución del E-commerce Artesanal
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
                            Tu marca en <br />
                            <span className="text-orange-600">toda la red</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-neutral-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                            La plataforma definitiva para herreros y artesanos. Crea tu tienda profesional en minutos,
                            gestiona pedidos y escala tu negocio con tecnología de punta.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/registro">
                                <Button size="lg" className="h-16 px-10 bg-orange-600 hover:bg-orange-700 text-white font-black italic uppercase rounded-2xl text-lg shadow-[0_0_40px_rgba(234,88,12,0.3)] group">
                                    Empezar a Vender <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/home">
                                <Button variant="outline" size="lg" className="h-16 px-10 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 font-black italic uppercase rounded-2xl text-lg">
                                    Ver Demo
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Store className="w-8 h-8 text-orange-600" />}
                            title="Tu Propia Marca"
                            description="Personaliza tu catálogo, logo y colores. Es tu tienda, no la nuestra."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-orange-600" />}
                            title="Venta Instantánea"
                            description="Checkout optimizado para móviles y pagos integrados. Sin fricción."
                        />
                        <FeatureCard
                            icon={<Rocket className="w-8 h-8 text-orange-600" />}
                            title="Escalabilidad"
                            description="Desde tu primer venta hasta volúmenes industriales. Crecemos con vos."
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
                        <StatItem count="ML" label="Integración" />
                        <StatItem count="100%" label="Soberanía de Datos" />
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
                            Únete a la red de artesanos digitales más grande de la región.
                        </p>
                        <Link to="/registro">
                            <Button size="lg" className="h-16 px-12 bg-white text-black hover:bg-neutral-200 font-black italic uppercase rounded-2xl text-lg">
                                Registrar mi Marca
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group p-10 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500">
            <div className="mb-6 p-4 bg-orange-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-black italic uppercase mb-4">{title}</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">
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
