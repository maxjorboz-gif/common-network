# 🔍 CAMPOS REALES ENCONTRADOS EN EL CÓDIGO

> **Análisis de campos usados en las funciones backend**  
> Fecha: 2026-02-03  
> **IMPORTANTE:** Estos son los campos que el código ESTÁ USANDO actualmente.  
> Necesitamos compararlos con los esquemas REALES de Base44.

---

## ⚠️ ACCIÓN REQUERIDA

**Por favor, accede a Base44 y verifica/copia los esquemas reales:**

1. Ve a: https://app.base44.com/apps/6967728aba18db08a32d56fd/entities
2. Para cada entidad abajo, copia los campos reales
3. Compara con lo que encontré en el código
4. Actualiza `ENTITIES_SCHEMA.md` con los campos correctos

---

## 📊 CAMPOS ENCONTRADOS EN EL CÓDIGO

### 1. Producto
**Archivos analizados:** `crearProducto.ts`, `actualizarProducto.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  id_comercio: string,
  commerce_code: string,
  
  // Información básica
  titulo: string,
  descripcion: string,
  descripcion_tecnica: string,
  sku_taller_interno: string,
  
  // Precios
  precio_estandar: number,
  precio_meta_referencia: number,
  costo_producto: number,
  moneda: string,
  
  // Categorización
  categoria: string,
  subcategoria: string,
  meta_product_category: string,
  categoria_negocio: string,  // ⚠️ Encontrado en obtenerPaginaInicio.ts
  
  // Multimedia
  fotos: string[],
  videos: string[],
  imagen_principal: string,
  
  // Inventario
  stock_actual: number,
  stock_minimo_alerta: number,
  
  // Estado
  activo: boolean,
  destacado: boolean,
  
  // Estadísticas
  total_vendidos: number,
  promedio_estrellas: number,
  total_resenas: number,
  vistas_totales: number,
  
  // Metadatos
  created_at: string,
  updated_at: string
}
```

---

### 2. ConfiguracionComercio
**Archivos analizados:** `actualizarConfiguracion.ts`, `obtenerPaginaInicio.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  commerce_code: string,
  id_comercio: string,
  
  // Diseño (encontrados en obtenerPaginaInicio.ts)
  nombre_tienda: string,
  color_primario: string,
  color_secundario: string,  // ⚠️ Probablemente existe
  logo_url: string,          // ⚠️ Probablemente existe
  banner_url: string,
  
  // Marketing
  marketing_red_activo: boolean,
  categoria_negocio: string,  // ⚠️ Encontrado en obtenerPaginaInicio.ts
  
  // Pagos (probables, no confirmados en código analizado)
  metodos_pago_activos: string[],
  mercadopago_access_token: string,
  datos_transferencia: {
    cbu: string,
    alias: string,
    titular: string
  },
  
  // Meta Pixel (probables)
  meta_pixel_id: string,
  meta_access_token: string,
  
  // Textos (probables)
  mensaje_bienvenida: string,
  descripcion_tienda: string,
  
  // Metadatos
  created_at: string,
  updated_at: string
}
```

---

### 3. Comercio
**Archivos analizados:** `registrarComercio.ts`, `loginComercio.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  commerce_code: string,
  user_id: string,
  
  // Datos del negocio
  nombre: string,
  nombre_usuario: string,
  email_negocio: string,
  whatsapp_negocio: string,
  
  // Autenticación
  password_hash: string,
  
  // Estado
  estado_registro: string,  // "completado" | "pendiente"
  activo: boolean,
  plan: string,  // "bronce" | "plata" | "oro"
  
  // Publicidad
  saldo_publicidad: number,
  
  // Estadísticas
  total_ventas: number,
  total_ordenes: number,
  
  // Configuración
  configuracion_avanzada: object,
  
  // Metadatos
  created_at: string,
  updated_at: string,
  ultimo_login: string
}
```

---

### 4. Orden
**Archivos analizados:** `finalizarCompra.ts`, `confirmarPago.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  numero_orden: string,
  commerce_code: string,
  id_comercio: string,
  id_cliente: string,
  
  // Items
  items: Array<{
    id: string,
    id_producto: string,
    titulo: string,
    cantidad: number,
    precio_unitario: number
  }>,
  
  // Cliente (datos embebidos)
  cliente: {
    id: string,
    nombre_completo: string,
    email: string,
    telefono_whatsapp: string,
    email_hash: string,
    whatsapp_hash: string
  },
  
  // Envío (estructura alternativa encontrada)
  datos_envio: {
    nombre: string,
    calle: string,
    ciudad: string,
    provincia: string,
    cp: string
  },
  
  // Económico
  resumen_economico: {
    subtotal: number,
    descuento: number,
    total_final: number
  },
  total: number,
  total_final: number,  // ⚠️ Duplicado con resumen_economico.total_final
  
  // Pago
  metodo_pago: string,  // "transferencia" | "mercadopago"
  estado: string,  // Ver EstadoOrden
  fecha_pago_confirmado: string,
  
  // Tracking Meta
  event_id_meta: string,
  fbp: string,
  fbc: string,
  hashes_generados: {
    emH: string,
    phH: string
  },
  
  // Metadatos
  created_at: string,
  created_date: string,  // ⚠️ Alternativa a created_at
  updated_at: string
}
```

---

### 5. Cliente
**Archivos analizados:** `finalizarCompra.ts`, `participarSorteo.ts`, `obtenerPaginaInicio.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  
  // Datos personales
  nombre_completo: string,
  email: string,
  whatsapp: string,  // Normalizado
  
  // Hashes
  email_hash: string,
  whatsapp_hash: string,
  
  // Relación
  commerce_code: string,
  
  // Estadísticas
  total_compras: number,
  
  // Metadatos
  created_at: string,
  updated_at: string
}
```

---

### 6. Lead
**Archivos analizados:** `participarSorteo.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  id_cliente: string,
  commerce_code: string,
  id_sorteo: string,
  
  // Datos
  nombre_completo: string,
  email: string,
  telefono_whatsapp: string,
  
  // Origen y estado
  origen: string,  // "sorteo" | "formulario" | "popup"
  estado: string,  // "inscrito" | "contactado" | "convertido"
  fecha_contacto: string,
  
  // Tracking
  fbp: string,
  fbc: string,
  user_agent: string,
  
  // Notas
  notas: string,  // ⚠️ Probable, no confirmado
  
  // Metadatos
  created_at: string,
  updated_at: string
}
```

---

### 7. Sorteo
**Archivos analizados:** `gestionarSorteo.ts`, `participarSorteo.ts`, `obtenerPaginaInicio.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  commerce_code: string,
  
  // Información
  titulo: string,
  descripcion: string,
  id_producto_premio: string,
  
  // Estado
  activo: boolean,
  fecha_sorteo: string,
  ganador_id: string,
  
  // Estadísticas
  total_participantes: number,
  
  // Metadatos
  created_at: string,
  updated_at: string
}
```

---

### 8. AtributoProducto
**Archivos analizados:** `crearProducto.ts`, `actualizarProducto.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  id_producto: string,
  
  // Atributo
  nombre_atributo: string,
  valor_atributo: string,
  ia_weight: number,
  orden: number,
  
  // Metadatos
  created_at: string
}
```

---

### 9. EventoMeta
**Archivos analizados:** `confirmarPago.ts`, `finalizarCompra.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  event_id: string,
  event_name: string,
  id_comercio: string,
  
  // User Data
  user_data: {
    em: string[],
    ph: string[],
    fn: string[],
    fbp: string,
    fbc: string,
    client_user_agent: string
  },
  
  // Custom Data
  custom_data: {
    currency: string,
    value: number,
    content_ids: string[]
  },
  
  // Metadata
  action_source: string,
  event_time: number,
  
  // Metadatos
  created_at: string
}
```

---

### 10. GastoPublicitario
**Archivos analizados:** `solicitarCreditoPublicitario.ts`, `resetGastoPublicitario.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  commerce_code: string,
  
  // Tipo
  tipo: string,  // "solicitud" | "gasto" | "credito"
  
  // Montos
  monto: number,
  monto_solicitado: number,
  
  // Estado
  estado: string,  // "pendiente" | "aprobado" | "rechazado"
  
  // Descripción
  descripcion: string,
  motivo: string,
  
  // Metadatos
  created_at: string,
  updated_at: string
}
```

---

### 11. SuperAdmin
**Archivos analizados:** `loginSuperAdmin.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  
  // Credenciales
  email: string,
  password_hash: string,
  
  // Datos
  nombre: string,
  
  // Estado
  activo: boolean,
  
  // Metadatos
  created_at: string,
  ultimo_login: string
}
```

---

### 12. TrackingEvent
**Archivos analizados:** `trackEvent.ts`

```typescript
{
  // IDs
  id: string,
  _id: string,
  client_id: string,
  commerce_code: string,
  session_id: string,
  
  // Evento
  event_type: string,
  event_data: object,
  
  // Contexto
  page_url: string,
  referrer: string,
  user_agent: string,
  
  // Metadatos
  timestamp: string,
  created_at: string
}
```

---

## ⚠️ CAMPOS INCONSISTENTES ENCONTRADOS

### Problema 1: Doble nomenclatura de IDs
- `commerce_code` vs `id_comercio` (usados indistintamente)
- `id` vs `_id` (ambos válidos en Base44)

### Problema 2: Campos duplicados en Orden
- `total` vs `resumen_economico.total_final`
- `created_at` vs `created_date`

### Problema 3: Campos probables no confirmados
- `ConfiguracionComercio.logo_url`
- `ConfiguracionComercio.color_secundario`
- `ConfiguracionComercio.categoria_negocio`
- `Lead.notas`

---

## 📋 PRÓXIMOS PASOS

1. **Acceder a Base44** y copiar esquemas reales de cada entidad
2. **Comparar** con los campos encontrados en el código
3. **Identificar discrepancias:**
   - Campos que existen en Base44 pero no se usan en código
   - Campos que se usan en código pero no existen en Base44
   - Campos con nombres diferentes
4. **Actualizar `ENTITIES_SCHEMA.md`** con los campos correctos
5. **Crear plan de migración** si hay que renombrar campos

---

## 🔗 ENTIDADES ADICIONALES ENCONTRADAS

Estas entidades se mencionan en el código pero no he analizado en detalle:

- `ConfiguracionGlobal` (mencionada en `configuracionSuprema.ts`)
- `Cupon` (mencionada en `aplicarCupon.ts`)
- `PagoPublicidad` (mencionada en `gestionarPagosPublicidad.ts`)
- `Logs_Configuracion` (mencionada en `trackEvent.ts`)

---

**📌 IMPORTANTE:** Este documento es temporal. Una vez que tengamos los esquemas reales de Base44, actualizaremos `ENTITIES_SCHEMA.md` con la información correcta.
