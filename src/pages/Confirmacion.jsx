import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, MessageCircle } from 'lucide-react';

export default function Confirmacion() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id_comercio, ordenId } = useParams();
    const [orderDetail, setOrderDetail] = React.useState(location.state?.orden || null);
    const [loading, setLoading] = React.useState(!orderDetail);

    React.useEffect(() => {
        if (!orderDetail && ordenId) {
            // Re-fetch logic if user refreshes
            console.log("Re-fetching order:", ordenId);
            // This would call a backend function like 'obtenerDetalleOrden'
            setLoading(false);
        }
    }, [ordenId, orderDetail]);

    const handleVolver = () => {
        if (id_comercio) navigate(`/tienda/${id_comercio}`);
        else navigate('/');
    };

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Cargando orden...</div>;

    if (!orderDetail) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-white">
                <p className="mb-4">No pudimos encontrar los detalles de tu orden.</p>
                <Button onClick={() => navigate('/')} className="bg-orange-600">Ir al inicio</Button>
            </div>
        );
    }

    const { orden } = { orden: orderDetail }; // Bridge for existing code below

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
