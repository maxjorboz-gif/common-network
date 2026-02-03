import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Phone, Mail, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function AdminLeads({ comercio }) {
  const [filtroEstado, setFiltroEstado] = useState('all');
  const queryClient = useQueryClient();

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads-admin', comercio.commerce_code || comercio.id_comercio],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerLeads', {
        commerce_code: comercio.commerce_code,
        id_comercio: comercio.id_comercio
      });
      return response.data || response;
    }
  });

  const leads = leadsData?.leads || [];
  const productos = leadsData?.productos || [];

  const handleChangeEstado = async (leadId, nuevoEstado) => {
    try {
      await base44.functions.invoke('cambiarEstadoLead', {
        leadId,
        nuevoEstado
      });
      queryClient.invalidateQueries(['leads-admin']);
    } catch (err) {
      console.error('Error actualizando lead:', err);
    }
  };

  const handleAddNote = async (leadId, nota) => {
    try {
      await base44.functions.invoke('agregarNotaLead', {
        leadId,
        nota
      });
      queryClient.invalidateQueries(['leads-admin']);
    } catch (err) {
      console.error('Error guardando nota:', err);
    }
  };

  const handleWhatsApp = (lead) => {
    const mensaje = encodeURIComponent(
      `Hola ${lead.nombre || ''}! Te contacto desde ${comercio.nombre}. Vi que estuviste interesado en nuestros productos. ¿En qué puedo ayudarte?`
    );
    window.open(`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=${mensaje}`, '_blank');
  };

  const leadsFiltrados = filtroEstado === 'all'
    ? leads
    : leads.filter(l => l.estado === filtroEstado);

  const getEstadoBadge = (estado) => {
    const estados = {
      nuevo: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
      contactado: { label: 'Contactado', color: 'bg-purple-100 text-purple-800' },
      en_negociacion: { label: 'En negociación', color: 'bg-yellow-100 text-yellow-800' },
      convertido: { label: 'Convertido', color: 'bg-green-100 text-green-800' },
      perdido: { label: 'Perdido', color: 'bg-red-100 text-red-800' }
    };

    const { label, color } = estados[estado] || estados.nuevo;
    return <Badge className={color}>{label}</Badge>;
  };

  const getOrigenBadge = (origen) => {
    const origenes = {
      popup_salida: 'Pop-up de salida',
      popup_precio: 'Pop-up de precio',
      formulario: 'Formulario',
      whatsapp_directo: 'WhatsApp directo'
    };
    return origenes[origen] || origen;
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando leads...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Leads</h2>
          <p className="text-sm text-gray-600 mt-1">
            {leadsFiltrados.length} leads{filtroEstado !== 'all' && ` en estado "${filtroEstado}"`}
          </p>
        </div>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="nuevo">Nuevos</SelectItem>
            <SelectItem value="contactado">Contactados</SelectItem>
            <SelectItem value="en_negociacion">En negociación</SelectItem>
            <SelectItem value="convertido">Convertidos</SelectItem>
            <SelectItem value="perdido">Perdidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leadsFiltrados.map(lead => {
          const producto = productos.find(p => p.id === lead.id_producto_interes);

          return (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {lead.nombre?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{lead.nombre || 'Sin nombre'}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(lead.created_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  {getEstadoBadge(lead.estado)}
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 mb-4 text-sm">
                  {lead.whatsapp && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span>{lead.whatsapp}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                </div>

                {/* Origen y producto */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {getOrigenBadge(lead.origen)}
                    </Badge>
                  </div>

                  {producto && (
                    <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                      <img
                        src={producto.imagen_principal || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=50'}
                        alt={producto.titulo}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{producto.titulo}</p>
                        <p className="text-xs text-gray-500">${producto.precio_base?.toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  )}

                  {lead.cupon_ofrecido && (
                    <p className="text-xs text-gray-600">
                      Cupón ofrecido: <span className="font-semibold text-amber-600">{lead.cupon_ofrecido}</span>
                    </p>
                  )}
                </div>

                {/* Notas */}
                {lead.notas && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Notas:</p>
                    <p className="text-sm">{lead.notas}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleWhatsApp(lead)}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>

                    <Select
                      value={lead.estado}
                      onValueChange={(value) => handleChangeEstado(lead.id, value)}
                    >
                      <SelectTrigger className="flex-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo</SelectItem>
                        <SelectItem value="contactado">Contactado</SelectItem>
                        <SelectItem value="en_negociacion">En negociación</SelectItem>
                        <SelectItem value="convertido">Convertido ✓</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <LeadNoteInput
                    leadId={lead.id}
                    currentNote={lead.notas || ''}
                    onSave={handleAddNote}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leadsFiltrados.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No hay leads{filtroEstado !== 'all' && ` en estado "${filtroEstado}"`}</p>
        </div>
      )}
    </div>
  );
}

// Componente para agregar notas
function LeadNoteInput({ leadId, currentNote, onSave }) {
  const [editing, setEditing] = useState(false);
  const [nota, setNota] = useState(currentNote);

  const handleSave = () => {
    onSave(leadId, nota);
    setEditing(false);
  };

  if (!editing && !currentNote) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="w-full text-xs"
      >
        + Agregar nota
      </Button>
    );
  }

  if (!editing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="w-full text-xs"
      >
        Editar nota
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Agregar notas sobre este lead..."
        rows={2}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} className="flex-1">
          Guardar
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
