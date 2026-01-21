import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Imagen */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={item.imagen || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100'}
          alt={item.titulo}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.titulo}</h4>
        
        {/* Atributos seleccionados */}
        {item.atributos_seleccionados && Object.keys(item.atributos_seleccionados).length > 0 && (
          <div className="flex gap-2 mt-1 flex-wrap">
            {Object.entries(item.atributos_seleccionados).map(([key, value]) => (
              <span key={key} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                {key}: {value}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-gray-900">
            ${item.precio_unitario?.toLocaleString('es-AR')}
          </span>
          
          {/* Cantidad */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => onUpdateQuantity(item.id_producto, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-medium">{item.cantidad}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => onUpdateQuantity(item.id_producto, item.cantidad + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Subtotal y Eliminar */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">
            Subtotal: <span className="font-medium text-gray-900">
              ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
            onClick={() => onRemove(item.id_producto)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}