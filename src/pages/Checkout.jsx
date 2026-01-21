import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/components/CartContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, MapPin, Phone, User, CheckCircle,
    Ticket, CreditCard, Landmark, Fingerprint, Hash, ShoppingBasket, Truck, FileText, Info
} from 'lucide-react';

const COMERCIO_ID = '000001';

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, total, clearCart } = useCart();

    // 1. ESTADOS
    const [loading, setLoading] = useState(false);
    const [metodoPago, setMetodoPago] = useState('transferencia');
    const [codigoCupon, setCodigoCupon] = useState('');
    const [comprobante, setComprobante] = useState('');
    const [tipoFactura, setTipoFactura] = useState('B');
    const [form, setForm] = useState({
        nombre: '', dni: '', whatsapp: '', email: '',
        calle: '', altura: '', ciudad: '', provincia: '', codigo_postal: '',
        observaciones: '', cuit: '', razonSocial: ''
    });

    // 2. MEMORIA DE CÁLCULO
    const resumen = useMemo(() => {
        const numSubtotal = Number(total || 0);
        const itemsValidados = (cartItems || []).map(item => {
            const precio = Number(item.precio_estandar) || 0;
            const cantidad = Number(item.cantidad) || 0;
            return {
                ...item,
                pNum: precio.toFixed(2),
                cNum: cantidad,
                subtotalItem: (precio * cantidad).toFixed(2)
            };
        });

        const descuento = metodoPago === 'transferencia' ? numSubtotal * 0.1 : 0;
        const totalFinal = (numSubtotal - descuento).toFixed(2);

        return {
            items: itemsValidados,
            subtotal: numSubtotal.toFixed(2),
            descuento: descuento.toFixed(2),
            totalFinal: totalFinal,
            hayData: itemsValidados.length > 0
        };
    }, [cartItems, total, metodoPago]);

    // 3. TRACKING AUTOMÁTICO (AddToCart)
    // Dispara la función en Deno con action: 'track' cuando hay datos de contacto
    useEffect(() => {
        if (form.whatsapp.length > 8 || (form.email.includes('@') && form.email.length > 5)) {
            const timer = setTimeout(async () => {
                try {
                    await base44.functions.invoke('finalizarCompra', {
                        action: 'track',
                        cliente: {
                            nombre_completo: form.nombre,
                            telefono_whatsapp: form.whatsapp,
                            email: form.email
                        },
                        items: cartItems,
                        resumen_economico: { total_final: resumen.totalFinal },
                        fbp: document.cookie.split('; ').find(row => row.startsWith('_fbp'))?.split('=')[1],
                        fbc: document.cookie.split('; ').find(row => row.startsWith('_fbc'))?.split('=')[1],
                        userAgent: navigator.userAgent
                    });
                } catch (e) { console.warn("Marketing tracking skipped"); }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [form.whatsapp, form.email]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFinalizarCompra = async () => {
        const camposObligatorios = ['nombre', 'dni', 'whatsapp', 'calle', 'altura', 'ciudad', 'provincia', 'codigo_postal'];
        if (tipoFactura === 'A') camposObligatorios.push('cuit', 'razonSocial');

        if (metodoPago === 'transferencia' && !comprobante) {
            toast.error("Por favor, ingrese el número de comprobante");
            return;
        }

        const vacios = camposObligatorios.filter(campo => !form[campo]);
        if (vacios.length > 0) {
            toast.error("Faltan datos obligatorios");
            return;
        }

        setLoading(true);
        try {
            // PAYLOAD ADAPTADO A TU FUNCIÓN DE MEMORIA
            const payload = {
                action: 'finalizar',
                id_comercio: COMERCIO_ID,
                cliente: {
                    nombre_completo: form.nombre,
                    dni: form.dni,
                    telefono_whatsapp: form.whatsapp,
                    email: form.email
                },
                items: resumen.items.map(item => ({
                    id_producto: item.id || item.id_producto,
                    titulo: item.titulo,
                    cantidad: item.cNum,
                    precio_unitario: Number(item.pNum)
                })),
                logistica: {
                    calle: form.calle,
                    altura: form.altura,
                    localidad: form.ciudad,
                    provincia: form.provincia,
                    codigo_postal: form.codigo_postal,
                    notas_entrega: form.observaciones,
                    tipo_envio: 'GRATIS_NACIONAL'
                },
                resumen_economico: {
                    subtotal_bruto: Number(resumen.subtotal),
                    descuento_metodo_pago: Number(resumen.descuento),
                    total_final: Number(resumen.totalFinal)
                },
                metodo_pago: metodoPago,
                comprobante_transferencia: comprobante,
                facturacion: {
                    tipo: tipoFactura,
                    cuit: form.cuit,
                    razon_social: form.razonSocial
                },
                fbp: document.cookie.split('; ').find(row => row.startsWith('_fbp'))?.split('=')[1],
                fbc: document.cookie.split('; ').find(row => row.startsWith('_fbc'))?.split('=')[1],
                userAgent: navigator.userAgent
            };

            const response = await base44.functions.invoke('finalizarCompra', payload);

            if (response.success) {
                // LÓGICA MERCADO PAGO
                if (metodoPago === 'mercadopago') {
                    toast.loading("Conectando con Mercado Pago...");

                    try {
                        const mpRes = await base44.functions.invoke('mercadopago', {
                            ordenId: response.orden.id // UUID Real que retornó el backend
                        });

                        if (mpRes.data?.init_point) {
                            clearCart(); // Limpiamos carrito antes de irnos
                            window.location.href = mpRes.data.init_point;
                            return;
                        } else {
                            throw new Error('No se recibió link de pago');
                        }
                    } catch (mpError) {
                        console.error(mpError);
                        toast.error("Error conectando con el pago. La orden fue guardada.");
                        // Opcional: Redirigir a confirmación pero como pendiente
                        navigate('/confirmacion', { state: { orden: response.orden } });
                    }
                } else {
                    // TRANSFERENCIA
                    toast.success("¡Pedido generado!");
                    clearCart();
                    navigate('/confirmacion', { state: { orden: response.orden } });
                }
            } else {
                toast.error(response.error || "Error al procesar el pedido");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    if (!resumen.hayData && !loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <span className="text-orange-600 font-black animate-pulse text-2xl uppercase italic">Cargando carrito...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 lg:p-12 font-sans selection:bg-orange-500/30">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

                <div className="lg:col-span-7 space-y-5">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black uppercase text-xs tracking-[0.2em]">Volver al catálogo</span>
                    </button>

                    <div className="space-y-12">
                        {/* SECCIÓN 1: IDENTIDAD */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-1.5 bg-orange-600 rounded-full"></div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">1. Identidad</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                <div className="space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Nombre y Apellido completo</Label>
                                    <Input name="nombre" placeholder="Ej: Juan Manuel Pérez" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl focus:border-orange-600 transition-all rounded-2xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"><Fingerprint size={12} /> Número de DNI</Label>
                                    <Input name="dni" placeholder="20.345.678" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl font-mono rounded-2xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-orange-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"><Phone size={12} /> Teléfono WhatsApp</Label>
                                    <Input name="whatsapp" placeholder="341 6123456" onChange={handleInputChange} className="bg-neutral-900 border-orange-900/30 h-16 text-2xl font-black text-orange-500 rounded-2xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Correo Electrónico</Label>
                                    <Input name="email" type="email" placeholder="usuario@gmail.com" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl rounded-2xl" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-1.5 bg-orange-600 rounded-full"></div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">2. Facturación</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"><FileText size={12} /> Tipo de Factura</Label>
                                    <Select onValueChange={setTipoFactura} defaultValue="B">
                                        <SelectTrigger className="bg-neutral-900 border-neutral-800 h-16 rounded-2xl text-xl">
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                            <SelectItem value="B">Consumidor Final (Factura B)</SelectItem>
                                            <SelectItem value="A">Responsable Inscripto (Factura A)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {tipoFactura === 'A' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">CUIT</Label>
                                            <Input name="cuit" placeholder="30-XXXXXXXX-X" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl rounded-2xl" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Razón Social</Label>
                                            <Input name="razonSocial" placeholder="Empresa S.A." onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl rounded-2xl" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-1.5 bg-orange-600 rounded-full"></div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">3. Destino de Envío</h2>
                            </div>
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-8 space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Calle / Avenida</Label>
                                    <Input name="calle" placeholder="Av. Pellegrini" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl rounded-2xl" />
                                </div>
                                <div className="col-span-4 space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Altura</Label>
                                    <Input name="altura" placeholder="1250" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl font-bold rounded-2xl text-center" />
                                </div>
                                <div className="col-span-5 space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Ciudad / Localidad</Label>
                                    <Input name="ciudad" placeholder="Rosario" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl rounded-2xl" />
                                </div>
                                <div className="col-span-4 space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Provincia</Label>
                                    <Input name="provincia" placeholder="Santa Fe" onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 h-16 text-xl rounded-2xl" />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-orange-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"><Hash size={12} /> C.P.</Label>
                                    <Input name="codigo_postal" placeholder="2000" onChange={handleInputChange} className="bg-neutral-900 border-orange-900/30 h-16 text-2xl font-black font-mono text-center rounded-2xl" />
                                </div>
                                <div className="col-span-12 space-y-2">
                                    <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Observaciones para el transporte</Label>
                                    <Textarea name="observaciones" placeholder="Ej: Portón negro..." onChange={handleInputChange} className="bg-neutral-900 border-neutral-800 min-h-[120px] rounded-2xl text-lg p-4" />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <Card className="bg-neutral-900 border-neutral-800 rounded-[3rem] overflow-hidden sticky top-8 border-t-8 border-t-orange-600 shadow-2xl">
                        <div className="bg-orange-600 py-4 px-8 flex items-center justify-between text-white">
                            <span className="font-black uppercase italic text-sm tracking-tighter">Detalle de tu compra</span>
                            <Truck size={20} className="animate-bounce" />
                        </div>

                        <CardContent className="p-8 space-y-10">
                            <div className="space-y-2">
                                <Label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1"><Ticket size={12} /> Cupón de Descuento</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ingresar código"
                                        value={codigoCupon}
                                        onChange={(e) => setCodigoCupon(e.target.value)}
                                        className="bg-neutral-950 border-neutral-800 h-12 rounded-xl font-mono uppercase"
                                    />
                                    <Button className="h-12 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-black px-6 text-xs uppercase">Aplicar</Button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                    <ShoppingBasket size={16} /> Productos en el carrito
                                </h3>
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {resumen.items.map((item) => (
                                        <div key={item.id} className="flex flex-col gap-2 bg-black/40 p-5 rounded-[1.5rem] border border-neutral-800">
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="text-base font-black uppercase text-white leading-tight italic">{item.titulo}</span>
                                                <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px] font-bold">CANT: {item.cNum}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-neutral-800/50 pt-2">
                                                <span className="text-[11px] text-neutral-600 font-bold uppercase tracking-tighter">P. Unit: ${item.pNum}</span>
                                                <span className="text-xl font-black text-orange-500 font-mono tracking-tighter">
                                                    ${item.subtotalItem}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-neutral-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Seleccioná tu pago</h3>
                                <div className="space-y-3">
                                    <div
                                        onClick={() => setMetodoPago('transferencia')}
                                        className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center justify-between ${metodoPago === 'transferencia' ? 'border-orange-600 bg-orange-600/10' : 'border-neutral-800 bg-neutral-950'}`}
                                    >
                                        <div className="flex items-center gap-4 text-white">
                                            <Landmark className={metodoPago === 'transferencia' ? 'text-orange-500' : 'text-neutral-600'} size={24} />
                                            <div>
                                                <p className="font-black uppercase text-sm italic">Transferencia Bancaria</p>
                                                <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest animate-pulse">10% DE DESCUENTO HOY</p>
                                            </div>
                                        </div>
                                        <CheckCircle size={24} className={metodoPago === 'transferencia' ? 'text-orange-500' : 'text-neutral-900'} />
                                    </div>

                                    {metodoPago === 'transferencia' && (
                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                            <Input
                                                placeholder="Número de comprobante"
                                                value={comprobante}
                                                onChange={(e) => setComprobante(e.target.value)}
                                                className="bg-neutral-950 border-orange-600/50 h-14 rounded-2xl text-orange-500 font-mono text-center text-lg"
                                            />
                                        </div>
                                    )}

                                    <div
                                        onClick={() => setMetodoPago('mercadopago')}
                                        className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center justify-between ${metodoPago === 'mercadopago' ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 bg-neutral-950'}`}
                                    >
                                        <div className="flex items-center gap-4 text-white">
                                            <CreditCard className={metodoPago === 'mercadopago' ? 'text-blue-500' : 'text-neutral-600'} size={24} />
                                            <div>
                                                <p className="font-black uppercase text-sm italic">Mercado Pago</p>
                                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">TARJETAS / DEBITO</p>
                                            </div>
                                        </div>
                                        <CheckCircle size={24} className={metodoPago === 'mercadopago' ? 'text-blue-500' : 'text-neutral-900'} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t-2 border-dashed border-neutral-800">
                                <div className="flex justify-between text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">
                                    <span>Subtotal Productos</span>
                                    <span className="text-white font-mono text-lg">${resumen.subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center bg-green-900/10 p-3 rounded-lg text-green-500">
                                    <span className="font-black text-[10px] uppercase tracking-widest">Costo de Envío</span>
                                    <span className="font-black text-xs uppercase italic tracking-widest">Bonificado 100%</span>
                                </div>
                                {metodoPago === 'transferencia' && (
                                    <div className="flex justify-between text-orange-500 font-black uppercase text-xs tracking-[0.1em]">
                                        <span>Ahorro por Transferencia (10%)</span>
                                        <span className="font-mono text-lg">-${resumen.descuento}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-neutral-600 font-black text-[10px] uppercase tracking-[0.3em]">Total Final</span>
                                        <span className="font-black text-3xl text-white uppercase italic tracking-tighter leading-none">A Pagar</span>
                                    </div>
                                    <span className="text-6xl font-black text-orange-600 font-mono tracking-tighter leading-none">
                                        ${resumen.totalFinal}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                                    <Info className="text-orange-600 shrink-0" size={18} />
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase leading-relaxed">
                                        Después de la compra nos comunicaremos para explicarle el proceso de entrega.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleFinalizarCompra}
                                    disabled={loading || !resumen.hayData}
                                    className="w-full h-28 bg-orange-600 hover:bg-orange-500 text-white font-black text-4xl rounded-[2.5rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase italic flex flex-col items-center justify-center leading-tight"
                                >
                                    {loading ? <span className="animate-pulse">PROCESANDO...</span> : "FINALIZAR COMPRA"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
