import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, MessageCircle } from 'lucide-react';

export default function Confirmacion() {
    const location = useLocation();
    const navigate = useNavigate();
    const { orden } = location.state || {};

    if (!orden) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                <Button onClick={() => navigate('/')} className="bg-orange-600">Volver a la tienda</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 flex items-center justify-center">
            <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
                    </div>
                    <CardTitle className="text-3xl font-black uppercase italic">¡Pedido Recibido!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-neutral-400">Gracias por tu compra. Tu número de orden es:</p>
                    <div className="bg-neutral-800 py-4 rounded-2xl border border-orange-600/30">
                        <span className="text-4xl font-black tracking-widest text-orange-500">#{orden.numero_orden || orden.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={() => navigate('/')} 
                            className="bg-orange-600 hover:bg-orange-700 h-12 font-bold"
                        >
                            <ShoppingBag className="mr-2 w-4 h-4" /> SEGUIR COMPRANDO
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => window.open(`https://wa.me/5493410000000?text=Hola, mi orden es #${orden.id}`, '_blank')}
                            className="border-neutral-700 text-white h-12"
                        >
                            <MessageCircle className="mr-2 w-4 h-4" /> CONSULTAR POR WHATSAPP
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
