import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CATEGORIAS = [
  'Set Parrillero Completo',
  'Parrillas con Brasero Uruguayo',
  'Parrillas Combinadas Premium',
  'Accesorios de Cocción: Palita y Atizador'
];

export default function CategoriaFilter({ selectedCategoria, onFilterChange }) {
  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">Filtrar por Categoría</h3>
        {selectedCategoria && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(null)}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            <X className="w-3 h-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map(cat => (
          <Badge
            key={cat}
            onClick={() => onFilterChange(selectedCategoria === cat ? null : cat)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
              selectedCategoria === cat
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {cat}
          </Badge>
        ))}
      </div>
    </div>
  );
}