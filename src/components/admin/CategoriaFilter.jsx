import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';

export default function CategoriaFilter({ selectedCategoria, onFilterChange, categorias = [], onDeleteCategory, metaCategories = [] }) {
  // Combinar categorías fijas (si las hubiera) con las dinámicas, o usar solo las dinámicas
  const categoriasAMostrar = categorias.length > 0 ? categorias : [];

  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Filtrar por Categoría</h3>
          {selectedCategoria && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange(null)}
              className="text-xs text-gray-500 hover:text-red-600 h-6 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar filtro
            </Button>
          )}
        </div>
        <span className="text-xs text-gray-400 font-mono hidden md:inline-block">
          {categoriasAMostrar.length} categorías activas
        </span>
      </div>

      {categoriasAMostrar.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No hay categorías con productos aún.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categoriasAMostrar.map(cat => {
            const isSystem = metaCategories.includes(cat);
            const isSelected = selectedCategoria === cat;

            return (
              <Badge
                key={cat}
                variant={isSelected ? "default" : "secondary"}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-all border ${isSelected
                    ? 'bg-blue-600 hover:bg-blue-700 border-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                  }`}
              >
                <span
                  onClick={() => onFilterChange(isSelected ? null : cat)}
                  className="cursor-pointer select-none"
                >
                  {cat}
                </span>

                {onDeleteCategory && !isSystem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(cat);
                    }}
                    className={`ml-1 p-0.5 rounded-full hover:bg-red-100 transition-colors group ${isSelected ? 'text-blue-200 hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    title="Eliminar categoría y todos sus productos"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}