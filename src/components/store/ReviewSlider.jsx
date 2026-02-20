import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ReviewSlider({ resenas = [] }) {
    const [current, setCurrent] = useState(0);

    if (!resenas || resenas.length === 0) return null;

    const prev = () => setCurrent(i => (i - 1 + resenas.length) % resenas.length);
    const next = () => setCurrent(i => (i + 1) % resenas.length);

    const r = resenas[current];

    return (
        <div className="relative max-w-2xl mx-auto">
            <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800">
                <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < (r.estrellas || 5) ? 'text-orange-500 fill-orange-500' : 'text-neutral-700'}`} />
                    ))}
                </div>
                {r.titulo && <h4 className="font-black text-white text-lg mb-2 italic">{r.titulo}</h4>}
                <p className="text-neutral-400 italic leading-relaxed mb-6">"{r.texto}"</p>
                <div className="flex items-center gap-3">
                    {r.foto_url && (
                        <img src={r.foto_url} alt={r.nombre_cliente} className="w-10 h-10 rounded-full object-cover border-2 border-orange-600" />
                    )}
                    <div>
                        <p className="font-black text-white text-sm">{r.nombre_cliente || 'Cliente verificado'}</p>
                        <p className="text-neutral-600 text-xs uppercase tracking-widest font-bold">Compra Verificada</p>
                    </div>
                </div>
            </div>

            {resenas.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button onClick={prev} className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex gap-2">
                        {resenas.map((_, i) => (
                            <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-orange-600' : 'bg-neutral-700'}`} />
                        ))}
                    </div>
                    <button onClick={next} className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            )}
        </div>
    );
}