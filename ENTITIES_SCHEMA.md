# 📚 FUENTE ÚNICA DE VERDAD - ENTIDADES BASE44

> **Documento Oficial de Esquemas de Entidades**  
> Última actualización: 2026-02-03  
> Este documento define TODAS las entidades de Base44 utilizadas en la aplicación.

---

## 🎯 ENTIDADES PRINCIPALES

### 1. **Comercio** (Commerce/Merchant)
**Propósito:** Representa a cada comercio/tienda registrado en la plataforma.  
**⚠️ ESQUEMA REAL DE BASE44** - Incluye configuración de Meta CAPI y planes

```typescript
interface Comercio {
  // === IDENTIFICADORES ===
  id: string;                          // ID único de Base44
  _id?: string;                        // ID alternativo de Base44
  
  // 🚨 MIGRACIÓN EN PROGRESO: commerce_code → id_comercio
  commerce_code: string;               // REQUERIDO - Código único (LEGACY - migrar a id_comercio)
  id_comercio?: string;                // NUEVO - Identificador principal para Meta CAPI
                                       // TODO: Copiar commerce_code → id_comercio en migración
  
  user_id?: string;                    // UUID del usuario (Auth) - Opcional
  
  // === DATOS DEL NEGOCIO ===
  nombre: string;                      // REQUERIDO - Nombre del comercio
  nombre_usuario?: string;             // Nombre completo del dueño/usuario
  slug?: string;                       // URL amigable (ej: "mi-tienda")
  logo_url?: string;                   // URL del logo
  descripcion?: string;                // Descripción del comercio
  
  // === CONTACTO ===
  email_negocio?: string;              // Email de contacto del negocio
  whatsapp_negocio?: string;           // WhatsApp del negocio
  direccion?: string;                  // Dirección física
  ciudad?: string;                     // Ciudad
  
  // === AUTENTICACIÓN ===
  password?: string;                   // Contraseña de acceso (⚠️ debería ser password_hash)
                                       // TODO: Migrar a password_hash con SHA-256
  
  // === ESTADO Y PLAN ===
  estado_registro?: 'borrador' | 'pendiente_pago' | 'pendiente_aprobacion' | 'activo' | 'rechazado';
                                       // Estado del trámite de alta (default: "borrador")
  
  numero_operacion?: string;           // Número de comprobante de pago
  
  activo?: boolean;                    // Visibilidad pública (default: false)
  
  plan?: 'bronce' | 'plata' | 'oro';   // Plan del comercio (default: "bronce")
  
  comision_porcentaje?: number;        // Comisión de la plataforma (default: 5)
  
  // === META PIXEL & CAPI ===
  meta_pixel_id?: string;              // Meta Pixel ID (ej: "123456789012345")
  meta_dataset_id?: string;            // Dataset ID para CAPI
  meta_access_token?: string;          // Token de acceso para Meta CAPI
  meta_test_event_code?: string;       // Test Event Code para debugging (default: "")
  
  // === ESTADÍSTICAS ===
  total_ventas?: number;               // Ventas totales en ARS (default: 0)
  total_ordenes?: number;              // Cantidad de órdenes (default: 0)
  
  // === CONFIGURACIÓN AVANZADA ===
  configuracion_avanzada?: {
    usa_capi?: boolean;                // Usar Meta CAPI (default: true)
    [key: string]: any;                // Configuraciones adicionales
  };
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
  ultimo_login?: string;               // ISO 8601
}
```

**Campos Requeridos:**
- `nombre`
- `commerce_code` (temporal - migrar a `id_comercio`)

**⚠️ PLAN DE MIGRACIÓN: `commerce_code` → `id_comercio`**

**Problema actual:**
- El código usa `commerce_code` en algunos lugares e `id_comercio` en otros
- Meta CAPI requiere consistencia en identificadores
- Confusión en relaciones entre entidades

**Solución:**
1. **Fase 1 - Duplicar datos:**
   ```typescript
   // En todas las entidades, agregar:
   id_comercio: comercio.commerce_code  // Copiar valor
   ```

2. **Fase 2 - Actualizar código:**
   - Cambiar todas las referencias de `commerce_code` → `id_comercio`
   - Mantener `commerce_code` como campo legacy (no eliminar)

3. **Fase 3 - Validar:**
   - Verificar que todas las funciones usan `id_comercio`
   - Verificar que Meta CAPI recibe `id_comercio` consistentemente

4. **Fase 4 - Deprecar (futuro):**
   - Marcar `commerce_code` como deprecated
   - Eventualmente eliminar (6+ meses después)

**Notas Importantes:**
- **Password:** El campo `password` debería ser `password_hash` con SHA-256
- **Meta CAPI:** Requiere `meta_pixel_id`, `meta_dataset_id` y `meta_access_token` configurados
- **Test Event Code:** Usar para debugging en Meta Events Manager
- **Slug:** Debe ser único y URL-friendly (ej: "mi-tienda-123")
- **Estado Registro:** Flujo completo de onboarding:
  - `borrador` → Comercio creado pero incompleto
  - `pendiente_pago` → Esperando pago de alta
  - `pendiente_aprobacion` → Esperando aprobación de Super Admin
  - `activo` → Comercio operativo
  - `rechazado` → Solicitud rechazada

---

### 2. **Producto** (Product)
**Propósito:** Representa cada producto en el catálogo de un comercio.  
**⚠️ ESQUEMA REAL DE BASE44** - Optimizado para Meta DPA (Dynamic Product Ads)

```typescript
interface Producto {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_comercio: string;                 // REQUERIDO - Referencia al comercio
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  sku_taller_interno: string;          // REQUERIDO - SKU interno de logística
                                       // ID único para Meta (content_ids)
  
  // === INFORMACIÓN BÁSICA ===
  titulo: string;                      // REQUERIDO - Título del producto para SEO
  descripcion?: string;                // Descripción completa
  descripcion_tecnica?: string;        // Especificaciones técnicas
  
  // === PRECIOS ===
  precio_estandar: number;             // REQUERIDO - PRECIO REAL
                                       // Único valor que ve el cliente y se usa para checkout
  
  precio_meta_referencia?: number;     // Variable técnica exclusiva para Meta (no visible en frontend)
                                       // (default: 0)
  
  costo_producto?: number;             // Costo interno para cálculo de margen
  
  moneda: string;                      // REQUERIDO - Código de moneda (default: "ARS")
                                       // Requerido por Meta CAPI
  
  // === CATEGORIZACIÓN ===
  categoria?: string;                  // Categoría principal
  subcategoria?: string;               // Subcategoría
  meta_product_category?: string;      // Categoría estándar de Meta para DPA
                                       // (ej: "Home & Garden > Kitchen & Dining")
  
  // === MULTIMEDIA (ESTRUCTURADA) ===
  fotos?: ProductPhoto[];              // Array de fotos estructuradas
  videos?: ProductVideo[];             // Array de videos estructurados
  imagen_principal?: string;           // URL imagen principal (sincronizada con catálogo)
  
  // === INVENTARIO ===
  stock_actual?: number;               // Stock disponible (default: 0)
  stock_minimo_alerta?: number;        // Nivel mínimo de alerta (default: 5)
  
  // === ESTADO ===
  activo?: boolean;                    // Visible en tienda (default: true)
  destacado?: boolean;                 // Producto destacado (default: false)
  
  // === ESTADÍSTICAS ===
  total_vendidos?: number;             // Unidades vendidas (default: 0)
  promedio_estrellas?: number;         // Rating promedio (default: 0)
  total_resenas?: number;              // Cantidad de reseñas (default: 0)
  vistas_totales?: number;             // Vistas del producto (default: 0)
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}

// === INTERFACES AUXILIARES ===

interface ProductPhoto {
  url: string;                         // URL de la imagen
  tipo: 'principal' | 'detalle' | 'uso';  // Tipo de imagen
  orden: number;                       // Orden de visualización
}

interface ProductVideo {
  url: string;                         // URL del video
  tipo: 'uso' | 'review' | 'demo';     // Tipo de video
  orden: number;                       // Orden de visualización
}
```

**Campos Requeridos:**
- `id_comercio`
- `titulo`
- `precio_estandar`
- `sku_taller_interno`
- `moneda`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- SKU único para tracking en Meta
- Estructura de fotos/videos organizada

**Notas Importantes:**

**Precios:**
- `precio_estandar` → **ÚNICO PRECIO REAL** que ve el cliente
- `precio_meta_referencia` → Solo para Meta (no mostrar en frontend)
- `costo_producto` → Solo para cálculos internos de margen

**Multimedia:**
- **Fotos:** Array estructurado con tipo y orden
  - `principal` → Imagen destacada del producto
  - `detalle` → Fotos de detalles/características
  - `uso` → Fotos del producto en uso
- **Videos:** Array estructurado con tipo y orden
  - `uso` → Video mostrando el producto en uso
  - `review` → Video review del producto
  - `demo` → Video demostración/tutorial
- `imagen_principal` → Debe sincronizarse con `fotos[0]` donde `tipo === 'principal'`

**Meta DPA (Dynamic Product Ads):**
- `sku_taller_interno` → Se usa como `content_ids` en eventos de Meta
- `meta_product_category` → Debe seguir taxonomía de Meta (Google Product Category)
- `moneda` → Requerido para eventos de compra en Meta CAPI

**Stock:**
- `stock_actual` → Actualizar en tiempo real al confirmar ventas
- `stock_minimo_alerta` → Trigger para notificaciones de reposición

**Estadísticas:**
- `total_vendidos` → Incrementar al confirmar pago
- `vistas_totales` → Incrementar en cada vista de producto
- `promedio_estrellas` y `total_resenas` → Para social proof

---

### 3. **AtributoProducto** (Product Attribute)
**Propósito:** Atributos adicionales de productos (talla, color, material, etc.).  
**⚠️ ESQUEMA REAL DE BASE44** - Con mapeo Meta DPA y variaciones de precio

```typescript
interface AtributoProducto {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_producto: string;                 // REQUERIDO - Referencia al producto padre
  
  // === ATRIBUTO ===
  nombre_atributo: string;             // REQUERIDO - Nombre del atributo
                                       // Ej: "Material", "Tipo de Emparrillado", "Color", "Tamaño"
  
  valor_atributo: string;              // REQUERIDO - Valor específico
                                       // Ej: "Acero Inoxidable", "Enlozado", "Hierro Redondo"
  
  // === MAPEO META DPA ===
  tag_meta_mapping?: 'material' | 'size' | 'color' | 'pattern' | 'custom_label_0' | 'custom_label_1';
                                       // Mapeo con campos estándar de Meta
                                       // Para anuncios dinámicos y personalización
  
  // === INTELIGENCIA ARTIFICIAL ===
  ia_weight?: number;                  // Peso de importancia para recomendaciones de IA (default: 0)
                                       // Según perfil de usuario (ej: perfil "asador profesional")
  
  // === VISUALIZACIÓN ===
  orden?: number;                      // Prioridad de visualización en ficha técnica (default: 0)
                                       // Menor número = mayor prioridad
  
  // === VARIACIONES DE PRECIO ===
  afecta_precio?: boolean;             // Define si modifica el precio_estandar (default: false)
                                       // Ej: emparrillado inoxidable vs hierro
  
  variacion_precio?: number;           // Monto que se suma o resta al precio base (default: 0)
                                       // Puede ser positivo o negativo
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `id_producto`
- `nombre_atributo`
- `valor_atributo`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Mapeo directo con campos de Meta DPA
- Variaciones de precio por atributo
- Peso IA para personalización
- Orden de visualización

**Notas Importantes:**

**Mapeo Meta DPA:**
Los campos `tag_meta_mapping` se corresponden con los campos estándar de Meta Product Catalog:
- `material` → Material del producto (ej: "Acero Inoxidable", "Aluminio")
- `size` → Tamaño/Talla (ej: "Grande", "Mediano", "XL")
- `color` → Color (ej: "Negro", "Plateado", "Rojo")
- `pattern` → Patrón/Diseño (ej: "Liso", "Rayado")
- `custom_label_0` → Etiqueta personalizada 1
- `custom_label_1` → Etiqueta personalizada 2

**Uso en Meta DPA:**
```javascript
// Ejemplo de cómo se envía a Meta
{
  content_name: "Parrilla Premium",
  material: "Acero Inoxidable",  // ← Desde tag_meta_mapping
  size: "Grande",                // ← Desde tag_meta_mapping
  color: "Negro"                 // ← Desde tag_meta_mapping
}
```

**Variaciones de Precio:**
Ejemplo de uso con `afecta_precio`:

```javascript
// Producto Base: Parrilla - $50,000
// Atributo 1: Material = "Hierro" → afecta_precio: false, variacion_precio: 0
// Atributo 2: Material = "Acero Inoxidable" → afecta_precio: true, variacion_precio: +15000

// Precio final con "Acero Inoxidable" = $50,000 + $15,000 = $65,000
```

**Cálculo de Precio Final:**
```javascript
const precioBase = producto.precio_estandar;
const atributosSeleccionados = [...]; // Atributos elegidos por el usuario

const precioFinal = precioBase + atributosSeleccionados
  .filter(attr => attr.afecta_precio)
  .reduce((sum, attr) => sum + attr.variacion_precio, 0);
```

**IA Weight (Peso de Inteligencia Artificial):**
- Valores: 0-10 (0 = no importante, 10 = muy importante)
- Usado para recomendaciones personalizadas según perfil de usuario
- Ejemplo para perfil "Asador Profesional":
  - Material "Acero Inoxidable" → `ia_weight: 10` (muy importante)
  - Material "Hierro" → `ia_weight: 3` (menos importante)
  - Tipo "Parrilla V" → `ia_weight: 9` (importante para profesionales)

**Orden de Visualización:**
- `orden: 0` → Se muestra primero
- `orden: 1` → Se muestra segundo
- `orden: 2` → Se muestra tercero
- Sin orden definido → Se muestra al final

**Ejemplo de Ficha Técnica:**
```
Especificaciones:
1. Material: Acero Inoxidable (orden: 0)
2. Tipo de Emparrillado: Parrilla V (orden: 1)
3. Tamaño: 60x40cm (orden: 2)
4. Color: Negro (orden: 3)
```

**Casos de Uso Comunes:**

**Parrillas:**
- Material: "Acero Inoxidable", "Hierro", "Aluminio"
- Tipo Emparrillado: "Parrilla V", "Enlozado", "Hierro Redondo"
- Tamaño: "Grande", "Mediano", "Chico"

**Ropa:**
- Talla: "S", "M", "L", "XL"
- Color: "Negro", "Blanco", "Azul"
- Material: "Algodón", "Poliéster"

**Electrónicos:**
- Capacidad: "64GB", "128GB", "256GB"
- Color: "Negro", "Blanco", "Gris Espacial"
- Modelo: "Standard", "Pro", "Max"

---

### 4. **Orden** (Order)
**Propósito:** Representa una orden de compra realizada por un cliente.  
**⚠️ ESQUEMA REAL DE BASE44** - Crítico para Meta CAPI Purchase events

```typescript
interface Orden {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  numero_orden: string;                // REQUERIDO - Número legible (ej: "PARRI-1025")
  
  id_comercio: string;                 // REQUERIDO - Referencia al comercio
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  id_cliente?: string;                 // Referencia al Cliente
                                       // Usado para recuperar email_hash y whatsapp_hash
  
  // === ITEMS DE LA ORDEN ===
  items: OrderItem[];                  // REQUERIDO - Productos comprados
  
  // === ECONÓMICO ===
  subtotal?: number;                   // Subtotal antes de descuentos/envío
  descuento?: number;                  // Monto de descuento aplicado (default: 0)
  costo_envio?: number;                // Costo de envío (default: 0)
  total: number;                       // REQUERIDO - VALOR FINAL
                                       // Este es el 'value' que se envía a Meta CAPI
  
  moneda?: string;                     // Código de moneda ISO (default: "ARS")
                                       // Requerido por Meta CAPI
  
  // === ESTADO Y PAGO ===
  estado?: 'pendiente_pago' | 'pago_confirmado' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado';
                                       // Estado de la orden (default: "pendiente_pago")
  
  metodo_pago?: 'transferencia' | 'efectivo' | 'mercadopago' | 'tarjeta';
                                       // Clave para determinar si el total incluye recargo/descuento
  
  fecha_pago_confirmado?: string;      // ISO 8601 - Fecha de confirmación de pago
  
  // === DATOS DE ENVÍO ===
  datos_envio?: {
    nombre?: string;                   // Nombre de quien recibe
    direccion?: string;                // Dirección completa
    ciudad?: string;                   // Ciudad
    codigo_postal?: string;            // Código postal
    telefono_normalizado?: string;     // Teléfono pasado por normalizeArgentinaPhone
  };
  
  // === META CAPI TRACKING ===
  fbp?: string;                        // Facebook Browser ID
                                       // Debe persistir desde el inicio de la sesión
  
  fbc?: string;                        // Facebook Click ID
                                       // Debe persistir desde el clic en el anuncio
  
  event_id_meta: string;               // REQUERIDO - ID ÚNICO
                                       // Debe generarse igual para Pixel y CAPI
                                       // Formato: numero_orden + timestamp
                                       // Ej: "PARRI-1025_1706918400000"
  
  evento_purchase_enviado?: boolean;   // Flag para evitar duplicados en Meta (default: false)
                                       // Evita que un mismo pedido sume dos veces
  
  // === COMISIONES Y MÁRGENES ===
  comision_plataforma?: number;        // Comisión de la plataforma (ARS)
  margen_vendedor?: number;            // Margen del vendedor (ARS)
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}

// === INTERFACES AUXILIARES ===

interface OrderItem {
  id_producto: string;                 // SKU taller interno (content_ids para Meta)
  titulo: string;                      // Nombre del producto
  imagen?: string;                     // URL de la imagen
  precio_unitario: number;             // Precio final cobrado por unidad
  cantidad: number;                    // Cantidad de unidades
  atributos?: Record<string, string>;  // Ej: {parrilla: 'acero inox'}
}

// === ESTADOS DE ORDEN ===
type EstadoOrden = 
  | "pendiente_pago"      // Orden creada, esperando pago
  | "pago_confirmado"     // Pago confirmado, listo para preparar
  | "en_preparacion"      // Orden siendo preparada
  | "enviado"             // Orden enviada al cliente
  | "entregado"           // Orden entregada exitosamente
  | "cancelado";          // Orden cancelada
```

**Campos Requeridos:**
- `id_comercio`
- `items`
- `total`
- `numero_orden`
- `event_id_meta`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- Event ID único para deduplicación en Meta
- Flag de evento enviado para evitar duplicados
- Teléfono normalizado en datos de envío

**Notas Críticas:**

**Meta CAPI Purchase Event:**
- `event_id_meta` → **DEBE SER IDÉNTICO** entre Pixel (frontend) y CAPI (backend)
- Formato recomendado: `${numero_orden}_${timestamp}`
- Ejemplo: `"PARRI-1025_1706918400000"`
- **Deduplicación:** Meta usa este ID para evitar contar el mismo evento dos veces

**Flujo de Estados:**
```
pendiente_pago → pago_confirmado → en_preparacion → enviado → entregado
                      ↓
                  cancelado (en cualquier momento)
```

**Evento Purchase en Meta:**
- Solo enviar cuando `estado === "pago_confirmado"`
- Verificar `evento_purchase_enviado === false` antes de enviar
- Marcar `evento_purchase_enviado = true` después de enviar
- Usar `total` como `value` en el evento
- Usar `items[].id_producto` como `content_ids`

**Tracking de Conversión:**
- `fbp` → Cookie `_fbp` del navegador (persiste 90 días)
- `fbc` → Parámetro `fbclid` de la URL (persiste 7 días)
- Ambos deben capturarse en el frontend y persistir hasta la compra

**Datos de Envío:**
- `telefono_normalizado` → Debe pasar por `normalizeArgentinaPhone()` antes de guardar
- Formato esperado: `+54XXXXXXXXXX` (sin espacios ni guiones)

**Comisiones:**
- `comision_plataforma` → Porcentaje definido en `Comercio.comision_porcentaje`
- `margen_vendedor` → `total - comision_plataforma - costos`
- Calcular al confirmar pago

**Método de Pago:**
- `transferencia` → Sin recargo
- `mercadopago` → Puede tener recargo (verificar config)
- `tarjeta` → Puede tener recargo
- `efectivo` → Sin recargo

---

### 5. **Cliente** (Customer)
**Propósito:** Representa a un cliente que ha interactuado con un comercio.  
**⚠️ ESQUEMA REAL DE BASE44** - Incluye tracking avanzado para Meta CAPI y Google Ads

```typescript
interface Cliente {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  // === DATOS PERSONALES (CRUDOS) ===
  nombre_completo: string;             // REQUERIDO - Nombre para personalización
  email: string;                       // REQUERIDO - Email del cliente (dato crudo)
  whatsapp: string;                    // REQUERIDO - Número normalizado (sin espacios, con +54)
  telefono_entrega?: string;           // Teléfono de quien recibe (dato crudo)
  
  // === DATOS GEOGRÁFICOS ===
  direccion?: string;                  // Dirección de envío
  ciudad?: string;                     // Ciudad del cliente (ct)
  provincia_estado?: string;           // Provincia (Argentina) / Estado (st)
  codigo_postal?: string;              // Código postal (zp)
  pais?: string;                       // Código de país ISO (default: "AR")
  
  // === HASHES PARA META CAPI (SHA-256) ===
  email_hash?: string;                 // Email hasheado para Meta (em)
  whatsapp_hash?: string;              // WhatsApp hasheado para Meta (ph)
  telefono_entrega_hash?: string;      // Teléfono de entrega hasheado
  nombre_hash?: string;                // Nombre hasheado para Meta (fn)
  apellido_hash?: string;              // Apellido hasheado para Meta (ln)
  ciudad_hash?: string;                // Ciudad hasheada para Meta (ct)
  provincia_hash?: string;             // Provincia hasheada para Meta (st)
  pais_hash?: string;                  // País hasheado para Meta (country)
  codigo_postal_hash?: string;         // CP hasheado para Meta (zp)
  
  // === TRACKING DE CONVERSIONES ===
  fbp?: string;                        // Facebook Browser ID (cookie _fbp)
  fbc?: string;                        // Facebook Click ID (parámetro fbclid)
  google_id?: string;                  // ID de Google para cross-device tracking y Google Ads
  
  // === ATRIBUCIÓN Y ORIGEN ===
  lead_source_original?: 'google_ads' | 'meta_ads' | 'organico' | 'referido' | 'directo';
  referido_por?: string;               // ID del cliente que lo refirió
  
  // === INTELIGENCIA DE NEGOCIO ===
  puntuacion_ltv?: number;             // Lifetime Value calculado (default: 0)
                                       // Ayuda a Meta a buscar clientes similares de alto valor
  
  cross_store_trust_score?: number;    // Índice de confianza 1-100 (default: 50)
  
  perfil_comprador?: 'visual_emocional' | 'tecnico_racional' | 'buscador_precio' | 'indefinido';
                                       // Perfil detectado por IA para anuncios personalizados
                                       // (default: "indefinido")
  
  // === ESTADÍSTICAS ===
  total_compras?: number;              // Cantidad de compras (default: 0)
  total_gastado?: number;              // Total gastado en ARS (default: 0)
  
  // === RELACIÓN ===
  commerce_code?: string;              // Comercio al que pertenece (si es multi-tenant)
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `nombre_completo`
- `email`
- `whatsapp`

**Notas Importantes:**
- **Hashes:** Todos los campos `*_hash` deben generarse con SHA-256 para cumplir con Meta CAPI
- **Normalización:** El campo `whatsapp` debe estar normalizado (formato: +54XXXXXXXXXX)
- **LTV:** El `puntuacion_ltv` se calcula automáticamente basado en compras históricas
- **Perfil:** El `perfil_comprador` se detecta mediante IA analizando comportamiento de navegación
- **Trust Score:** El `cross_store_trust_score` se usa para validar clientes en red de comercios

---

### 6. **Carrito** (Shopping Cart)
**Propósito:** Gestión de carritos de compra con tracking de abandono y conversión.  
**⚠️ ESQUEMA REAL DE BASE44** - Crítico para retargeting y recuperación de carritos

```typescript
interface Carrito {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  // === RELACIONES (REQUERIDAS) ===
  id_comercio: string;                 // REQUERIDO - Para cargar Pixel/CAPI
  session_id: string;                  // REQUERIDO - Vital para event_id de Meta en usuarios no logueados
  
  id_cliente?: string;                 // Referencia al cliente (vincula con email_hash y whatsapp_hash)
  
  // === ITEMS DEL CARRITO ===
  items: CartItem[];                   // Items en el carrito
  
  // === ECONÓMICO ===
  subtotal?: number;                   // Subtotal antes de descuentos (default: 0)
  cupon_aplicado?: string;             // Código de cupón aplicado
  descuento?: number;                  // Monto de descuento (default: 0)
  total?: number;                      // Valor final que se envía a Meta como 'value' (default: 0)
  moneda?: string;                     // Requerido por Meta CAPI (default: "ARS")
  
  // === ESTADO Y TRACKING ===
  estado?: 'activo' | 'abandonado' | 'convertido';  // Estado del carrito (default: "activo")
  fecha_ultimo_update?: string;        // ISO 8601 - Última actualización
  
  // === FLAGS DE RECUPERACIÓN ===
  evento_abandono_enviado?: boolean;   // Flag para evitar duplicados en Retargeting de Meta (default: false)
  email_recuperacion_enviado?: boolean;  // Flag de email de recuperación enviado (default: false)
  whatsapp_recuperacion_enviado?: boolean;  // Flag de WhatsApp de recuperación enviado (default: false)
  
  // === META CAPI ===
  external_id_meta?: string;           // ID persistente para mejorar el Match Quality de CAPI
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}

interface CartItem {
  id_producto: string;                 // SKU del taller que viaja como content_ids
  titulo: string;                      // Nombre del producto
  imagen?: string;                     // URL de la imagen
  precio_unitario: number;             // Precio estándar + variación por atributos
  cantidad: number;                    // Cantidad de unidades
  atributos_seleccionados?: Record<string, string>;  // Ej: {emparrillado: 'Inoxidable'}
}
```

**Campos Requeridos:**
- `id_comercio`
- `session_id`

**Notas Importantes:**
- **Session ID:** Crítico para tracking de usuarios anónimos en Meta CAPI
- **Estado:** Se actualiza automáticamente:
  - `activo` → Carrito en uso
  - `abandonado` → No actualizado en X minutos (trigger para retargeting)
  - `convertido` → Compra finalizada
- **Flags de Recuperación:** Evitan enviar múltiples emails/mensajes al mismo usuario
- **External ID Meta:** Mejora el match quality en Meta CAPI (usar email_hash o whatsapp_hash)
- **Items:** Los `content_ids` para Meta se extraen de `items[].id_producto`

---

### 7. **Lead** (Lead/Contact)
**Propósito:** Representa un contacto/lead generado (sorteos, formularios, popups, etc.).  
**⚠️ ESQUEMA REAL DE BASE44** - Sistema avanzado de captura y gestión de leads

```typescript
interface Lead {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_comercio: string;                 // REQUERIDO - Referencia al comercio
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  id_cliente?: string;                 // Referencia al Cliente (si ya existe)
  id_producto_interes?: string;        // Producto que estaba viendo cuando se capturó
  
  // === DATOS DEL LEAD ===
  nombre?: string;                     // Nombre del lead
  email?: string;                      // Email del lead
  whatsapp: string;                    // REQUERIDO - WhatsApp normalizado
  
  // === HASHES PARA META CAPI ===
  email_hash?: string;                 // Email hasheado SHA256 (em) para Meta
  whatsapp_hash?: string;              // WhatsApp hasheado SHA256 (ph) para Meta
  
  // === ORIGEN Y CAPTURA ===
  origen?: 'popup_salida' | 'popup_precio' | 'formulario' | 'whatsapp_directo';
                                       // Origen de captura del lead
  
  trigger_activado?: string;           // Qué disparó el popup
                                       // Ej: "exit_intent", "tiempo_en_pagina", "scroll_50%"
  
  cupon_ofrecido?: string;             // Código de cupón ofrecido al capturar
  
  // === ESTADO Y GESTIÓN ===
  estado?: 'nuevo' | 'contactado' | 'en_negociacion' | 'convertido' | 'perdido';
                                       // Estado del lead (default: "nuevo")
  
  suppress_ads?: boolean;              // Bloquear gasto en ads mientras se trabaja el lead
                                       // (default: true)
                                       // ⚠️ IMPORTANTE: Evita gastar en alguien que ya contactaste
  
  notas?: string;                      // Notas del comercio sobre el lead
  fecha_ultimo_contacto?: string;      // ISO 8601 - Última vez que se contactó
  
  // === META CAPI TRACKING ===
  fbp?: string;                        // Facebook Browser ID para atribución
  fbc?: string;                        // Facebook Click ID para atribución
  
  event_id_meta: string;               // REQUERIDO - ID ÚNICO para deduplicación
                                       // Formato: "lead_" + whatsapp_hash + "_" + timestamp
                                       // Ej: "lead_abc123_1706918400000"
  
  evento_lead_enviado?: boolean;       // Flag para evitar duplicados en Meta (default: false)
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `id_comercio`
- `whatsapp`
- `event_id_meta`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- Event ID único para deduplicación en Meta
- Suppress ads para evitar gastar en leads ya contactados
- Múltiples orígenes de captura

**Notas Críticas:**

**Orígenes de Captura:**
- `popup_salida` → Exit intent (usuario intenta salir)
- `popup_precio` → Popup al ver precio (ej: "¿Querés un descuento?")
- `formulario` → Formulario de contacto estándar
- `whatsapp_directo` → Click en botón de WhatsApp

**Triggers de Popup:**
Ejemplos de `trigger_activado`:
- `"exit_intent"` → Mouse hacia barra de direcciones
- `"tiempo_en_pagina_30s"` → 30 segundos en la página
- `"scroll_50%"` → Scroll al 50% de la página
- `"producto_visto_3_veces"` → Vio el mismo producto 3 veces
- `"carrito_abandonado"` → Agregó al carrito pero no compró

**Suppress Ads (CRÍTICO):**
- Cuando `suppress_ads === true`:
  - **NO** mostrar ads a este usuario en Meta/Google
  - Evita gastar dinero en alguien que ya contactaste manualmente
  - Ahorra presupuesto de publicidad
- Cambiar a `false` solo si el lead se marca como "perdido"

**Flujo de Estados:**
```
nuevo → contactado → en_negociacion → convertido
  ↓                                       ↓
perdido ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

**Estados:**
- `nuevo` → Lead recién capturado, no contactado
- `contactado` → Primera comunicación realizada
- `en_negociacion` → Negociando precio/condiciones
- `convertido` → Lead se convirtió en cliente (compró)
- `perdido` → Lead no interesado o no responde

**Evento Lead en Meta:**
- Enviar evento `Lead` cuando se captura
- Solo enviar si `evento_lead_enviado === false`
- Marcar `evento_lead_enviado = true` después de enviar
- Usar `event_id_meta` para deduplicación
- Incluir `email_hash` y `whatsapp_hash` en user_data

**Cupón Ofrecido:**
- Guardar el código del cupón que se ofreció al capturar
- Permite trackear qué cupones convierten mejor
- Ejemplo: "DESCUENTO10", "PRIMERACOMPRA15"

**Producto de Interés:**
- `id_producto_interes` → SKU del producto que estaba viendo
- Útil para:
  - Personalizar mensaje de contacto
  - Ofrecer descuento específico en ese producto
  - Trackear qué productos generan más leads

**Notas y Seguimiento:**
- `notas` → Comentarios del comercio sobre el lead
- `fecha_ultimo_contacto` → Para calcular tiempo sin contacto
- Útil para automatizar recordatorios de seguimiento

**Integración con Cliente:**
- Si el lead se convierte, crear registro en `Cliente`
- Vincular con `id_cliente`
- Copiar hashes para mantener tracking consistente

---

### 7. **Sorteo** (Raffle/Giveaway)
**Propósito:** Representa un sorteo/concurso creado por un comercio.

```typescript
interface Sorteo {
  id: string;
  _id?: string;
  commerce_code: string;
  
  // Información del Sorteo
  titulo: string;
  descripcion?: string;
  id_producto_premio?: string;         // Producto que se sortea
  
  // Estado
  activo: boolean;
  fecha_sorteo?: string;               // Fecha del sorteo
  ganador_id?: string;                 // ID del ganador
  
  // Estadísticas
  total_participantes?: number;
  
  // Metadatos
  created_at: string;
  updated_at?: string;
}
```

---

### 8. **ConfiguracionComercio** (Commerce Configuration)
**Propósito:** Configuración específica de cada comercio.  
**⚠️ ESQUEMA REAL DE BASE44** - Configuraciones de tienda, diseño y funcionalidades

```typescript
interface ConfiguracionComercio {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_comercio: string;                 // REQUERIDO - Referencia al comercio
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  // === DISEÑO Y BRANDING ===
  colores?: {
    primario?: string;                 // Color primario (default: "#3b82f6")
    secundario?: string;               // Color secundario (default: "#1e40af")
    acento?: string;                   // Color de acento (default: "#f59e0b")
  };
  
  // === ALERTAS Y NOTIFICACIONES ===
  whatsapp_alertas_stock?: string;     // WhatsApp para alertas de stock bajo
  whatsapp_alertas_ventas?: string;    // WhatsApp para notificaciones de nuevas ventas
  
  // === SISTEMA DE REFERIDOS ===
  habilitar_referidos?: boolean;       // Activar sistema de referidos (default: true)
  porcentaje_cupon_referido?: number;  // Porcentaje de descuento para referidos (default: 10)
  
  // === POPUP DE SALIDA ===
  habilitar_popup_salida?: boolean;    // Mostrar popup al intentar salir (default: true)
  texto_popup_salida?: string;         // Texto del popup (default: "¡Espera! No te vayas sin tu descuento exclusivo")
  
  // === ENVÍO ===
  envio_gratis_minimo?: number;        // Mínimo para envío gratis (0 = deshabilitado) (default: 0)
  habilitar_envio_gratis_global?: boolean;  // Mostrar "Envío Gratis" en todos los productos (default: false)
  costo_envio_default?: number;        // Costo de envío por defecto (default: 0)
  
  // === DATOS BANCARIOS ===
  datos_transferencia?: {
    banco?: string;                    // Nombre del banco
    cbu?: string;                      // CBU
    alias?: string;                    // Alias
    titular?: string;                  // Titular de la cuenta
  };
  
  // === VISUALIZACIÓN DE STOCK ===
  mostrar_stock?: boolean;             // Mostrar stock disponible en productos (default: true)
  umbral_escasez?: number;             // Stock para mostrar alerta de escasez (default: 5)
                                       // Ej: "¡Solo quedan 3 unidades!"
  
  // === DESCUENTOS ===
  descuento_base_transferencia?: number;  // Descuento base (%) para pagos por transferencia (default: 10)
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `id_comercio`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- Colores organizados en objeto
- Configuraciones con valores por defecto claros

**Notas Importantes:**

**Diseño y Branding:**
- `colores.primario` → Color principal de la tienda (botones, headers)
- `colores.secundario` → Color secundario (hover states, backgrounds)
- `colores.acento` → Color de acento (badges, alertas, CTAs)
- Todos los colores deben ser códigos hexadecimales válidos

**Alertas WhatsApp:**
- `whatsapp_alertas_stock` → Recibe notificación cuando `stock_actual <= stock_minimo_alerta`
- `whatsapp_alertas_ventas` → Recibe notificación en cada nueva venta
- Formato: `+54XXXXXXXXXX` (normalizado)

**Sistema de Referidos:**
- `habilitar_referidos` → Activa/desactiva el sistema completo
- `porcentaje_cupon_referido` → Descuento que recibe el referido
- El referidor también puede recibir beneficios (configurar en lógica de negocio)

**Popup de Salida:**
- `habilitar_popup_salida` → Mostrar popup cuando el usuario intenta salir
- `texto_popup_salida` → Mensaje personalizable
- Trigger: Movimiento del mouse hacia la barra de direcciones (exit intent)

**Configuración de Envío:**
- `envio_gratis_minimo` → Si el total supera este monto, envío gratis
  - `0` → Envío gratis deshabilitado
  - `> 0` → Monto mínimo para envío gratis
- `habilitar_envio_gratis_global` → Badge "Envío Gratis" en todos los productos
- `costo_envio_default` → Costo fijo de envío si no aplica envío gratis

**Visualización de Stock:**
- `mostrar_stock` → Mostrar "Stock disponible: X" en productos
- `umbral_escasez` → Cuando `stock_actual <= umbral_escasez`:
  - Mostrar: "¡Solo quedan X unidades!"
  - Cambiar color a rojo/naranja
  - Crear urgencia en el comprador

**Descuentos por Método de Pago:**
- `descuento_base_transferencia` → Descuento automático para transferencias
- Ejemplo: Si es 10%, un producto de $1000 se muestra como:
  - Precio lista: $1000
  - Con transferencia: $900 (10% off)

**Datos de Transferencia:**
- Mostrar en checkout cuando el usuario selecciona "Transferencia"
- Todos los campos son opcionales pero recomendados
- Validar CBU (22 dígitos) y Alias (alfanumérico)

---

### 9. **EventoMeta** (Meta CAPI Event)
**Propósito:** Eventos enviados a Meta Conversions API.  
**⚠️ ESQUEMA REAL DE BASE44** - Estructura completa de Meta CAPI con deduplicación

```typescript
interface EventoMeta {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  event_id: string;                    // REQUERIDO - ID único e igual para Pixel y CAPI
                                       // Deduplicación infalible
                                       // Formato: evento_tipo_timestamp (ej: "purchase_abc123_1706918400000")
  
  event_name: EventName;               // REQUERIDO - Nombre del evento estándar de Meta
  
  id_comercio: string;                 // REQUERIDO - Para seleccionar Pixel ID y Access Token correcto
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  id_cliente?: string;                 // Referencia interna para auditoría de eventos
  
  // === TIMING ===
  event_time: number;                  // REQUERIDO - Timestamp Unix (segundos)
                                       // Ej: 1706918400
  
  // === USER DATA (HASHED) ===
  user_data: {
    em?: string;                       // Email hasheado SHA256
    ph?: string;                       // Teléfono normalizado (549...) y hasheado SHA256
    fn?: string;                       // Nombre hasheado SHA256
    ln?: string;                       // Apellido hasheado SHA256
    ct?: string;                       // Ciudad hasheada SHA256
    st?: string;                       // Estado/Provincia hasheado SHA256
    zp?: string;                       // Código Postal hasheado SHA256
    country?: string;                  // País hasheado SHA256
    fbp?: string;                      // Cookie _fbp (Facebook Browser Pixel)
    fbc?: string;                      // Cookie _fbc (Facebook Click ID)
    client_ip_address?: string;        // IP del cliente
    client_user_agent?: string;        // User Agent del navegador
    external_id?: string;              // ID de cliente o session_id
                                       // Para hilvanar el recorrido del usuario
  };
  
  // === CUSTOM DATA ===
  custom_data?: {
    content_ids?: string[];            // SKUs de productos (ej: ["PARRI-001", "PARRI-002"])
    content_name?: string;             // Nombre del producto/página
    content_type?: string;             // Tipo de contenido (default: "product")
    content_category?: string;         // Categoría del producto
    value?: number;                    // Valor monetario real del evento
    currency?: string;                 // Código de moneda (default: "ARS")
    num_items?: number;                // Cantidad de items
    predicted_ltv?: number;            // Lifetime Value predicho
  };
  
  // === METADATA ===
  action_source?: string;              // Fuente de la acción (default: "website")
  event_source_url?: string;           // URL donde ocurrió el evento
  
  // === CONTROL DE ENVÍO ===
  enviado_pixel?: boolean;             // Flag: Evento enviado desde Pixel (default: false)
  enviado_capi?: boolean;              // Flag: Evento enviado desde CAPI (default: false)
  respuesta_capi?: object;             // Respuesta de Meta CAPI (para debugging)
  
  // === TESTING ===
  test_event_code?: string;            // Código de prueba para el gestor de eventos de Meta
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
}

// === TIPOS AUXILIARES ===

type EventName = 
  | "PageView"           // Vista de página
  | "ViewContent"        // Vista de producto
  | "AddToCart"          // Agregar al carrito
  | "InitiateCheckout"   // Iniciar checkout
  | "Purchase"           // Compra completada
  | "Lead"               // Lead capturado
  | "Contact"            // Contacto iniciado
  | "Search";            // Búsqueda realizada
```

**Campos Requeridos:**
- `event_id`
- `event_name`
- `event_time`
- `id_comercio`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- Event ID único para deduplicación
- Estructura completa de Meta CAPI
- Flags de envío para tracking

**Notas Críticas:**

**Deduplicación (CRÍTICO):**
- `event_id` **DEBE SER IDÉNTICO** entre Pixel (frontend) y CAPI (backend)
- Meta usa este ID para evitar contar el mismo evento dos veces
- Formato recomendado: `${event_name}_${unique_identifier}_${timestamp}`
- Ejemplo: `"purchase_ORDER123_1706918400000"`

**Event Time:**
- Debe ser timestamp Unix en **segundos** (no milisegundos)
- JavaScript: `Math.floor(Date.now() / 1000)`
- Debe ser reciente (Meta rechaza eventos muy antiguos)

**User Data (Hashed):**
Todos los campos de `user_data` deben estar hasheados con SHA-256:
```javascript
import crypto from 'crypto';

const hashSHA256 = (value) => {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
};

// Ejemplo
user_data: {
  em: hashSHA256('usuario@example.com'),
  ph: hashSHA256('5491112345678'),  // Normalizado: +54 + código área + número
  fn: hashSHA256('juan'),
  ln: hashSHA256('perez')
}
```

**Normalización de Teléfono:**
- Formato: `+[código país][código área][número]`
- Argentina: `+5491112345678` (sin espacios, guiones ni paréntesis)
- Ejemplo: `+54 9 11 1234-5678` → `5491112345678`

**External ID:**
- Usar `email_hash` o `whatsapp_hash` como external_id
- Permite a Meta vincular eventos del mismo usuario
- Mejora el match quality

**Content IDs:**
- Usar SKUs de productos (`sku_taller_interno`)
- Array de strings: `["PARRI-001", "ACC-002"]`
- Para eventos de producto único: `["PARRI-001"]`

**Eventos Estándar de Meta:**

**PageView:**
```javascript
{
  event_name: "PageView",
  custom_data: {
    content_name: "Home",
    content_type: "page"
  }
}
```

**ViewContent:**
```javascript
{
  event_name: "ViewContent",
  custom_data: {
    content_ids: ["PARRI-001"],
    content_name: "Parrilla Premium",
    content_type: "product",
    content_category: "Parrillas",
    value: 50000,
    currency: "ARS"
  }
}
```

**AddToCart:**
```javascript
{
  event_name: "AddToCart",
  custom_data: {
    content_ids: ["PARRI-001"],
    content_name: "Parrilla Premium",
    value: 50000,
    currency: "ARS",
    num_items: 1
  }
}
```

**Purchase:**
```javascript
{
  event_name: "Purchase",
  custom_data: {
    content_ids: ["PARRI-001", "ACC-002"],
    value: 65000,
    currency: "ARS",
    num_items: 2
  }
}
```

**Lead:**
```javascript
{
  event_name: "Lead",
  custom_data: {
    content_ids: ["PARRI-001"],
    content_name: "Popup Salida",
    value: 0,
    currency: "ARS"
  }
}
```

**Control de Envío:**
- `enviado_pixel: true` → Evento enviado desde frontend (Pixel)
- `enviado_capi: true` → Evento enviado desde backend (CAPI)
- Idealmente ambos deben ser `true` para máxima precisión
- Meta deduplica automáticamente usando `event_id`

**Test Event Code:**
- Usar para debugging en Meta Events Manager
- Obtener de: Meta Events Manager → Test Events → Get Test Code
- Ejemplo: `"TEST12345"`
- Solo usar en desarrollo/staging

**Respuesta CAPI:**
- Guardar respuesta de Meta para debugging
- Incluye: `events_received`, `events_dropped`, `messages`
- Útil para diagnosticar problemas de envío

**Match Quality:**
Mejorar el match quality enviando más datos hasheados:
- **Mínimo:** `em` o `ph` + `fbp`
- **Bueno:** `em` + `ph` + `fbp` + `fbc`
- **Excelente:** Todos los campos de `user_data` completos

**Action Source:**
- `"website"` → Evento desde sitio web (default)
- `"app"` → Evento desde app móvil
- `"phone_call"` → Llamada telefónica
- `"chat"` → Chat/WhatsApp
- `"email"` → Email
- `"other"` → Otro

**Event Source URL:**
- URL completa donde ocurrió el evento
- Ejemplo: `"https://mitienda.com/producto/parrilla-premium"`
- Ayuda a Meta a entender el contexto del evento

---

### 10. **GastoPublicitario** (Ad Spend)
**Propósito:** Registro de gastos en publicidad para cálculo de ROI.  
**⚠️ ESQUEMA REAL DE BASE44** - Tracking de inversión publicitaria

```typescript
interface GastoPublicitario {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_comercio: string;                 // REQUERIDO - Referencia al comercio
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  // === DATOS DEL GASTO ===
  fecha: string;                       // REQUERIDO - Fecha del gasto (formato: YYYY-MM-DD)
  monto: number;                       // REQUERIDO - Monto invertido en ARS
  
  plataforma?: 'meta_ads' | 'google_ads' | 'otro';
                                       // Plataforma publicitaria (default: "meta_ads")
  
  notas?: string;                      // Notas sobre la inversión
                                       // Ej: "Campaña Liquidación Invierno"
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `id_comercio`
- `fecha`
- `monto`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- Fecha en formato estándar
- Múltiples plataformas soportadas

**Notas Importantes:**

**Formato de Fecha:**
- Usar formato ISO: `"YYYY-MM-DD"`
- Ejemplo: `"2026-02-04"`
- Facilita queries por rango de fechas

**Plataformas:**
- `meta_ads` → Facebook/Instagram Ads
- `google_ads` → Google Ads
- `otro` → Otras plataformas (TikTok, LinkedIn, etc.)

**Cálculo de ROI:**
```javascript
// Obtener ventas del período
const ventas = await obtenerVentas(comercio_id, fecha_inicio, fecha_fin);
const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);

// Obtener gastos del período
const gastos = await obtenerGastos(comercio_id, fecha_inicio, fecha_fin);
const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

// Calcular ROI
const roi = ((totalVentas - totalGastos) / totalGastos) * 100;
// Ejemplo: ROI = 250% significa que por cada $1 invertido, ganaste $2.50
```

**Uso Típico:**
```javascript
// Registrar gasto diario
{
  id_comercio: "COM_ABC123",
  fecha: "2026-02-04",
  monto: 5000,
  plataforma: "meta_ads",
  notas: "Campaña de San Valentín - Anuncios de parrillas premium"
}
```

**Reportes Sugeridos:**
- Gasto total por mes
- Gasto por plataforma
- ROI por campaña (cruzando con ventas)
- Tendencia de inversión
- Comparativa entre plataformas
```

---

### 11. **ConfiguracionGlobal** (Global Configuration)
**Propósito:** Configuración global de la plataforma (solo Super Admin).

```typescript
interface ConfiguracionGlobal {
  id: string;
  _id?: string;
  
  // Identificador
  clave: string;                       // Clave única de configuración
  
  // Valor
  valor: any;                          // Valor de la configuración (JSON)
  
  // Metadatos
  descripcion?: string;
  created_at: string;
  updated_at?: string;
}
```

---

### 12. **Cupon** (Coupon)
**Propósito:** Cupones de descuento.  
**⚠️ ESQUEMA REAL DE BASE44** - Con sistema de referidos y tracking de agentes

```typescript
interface Cupon {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  codigo: string;                      // REQUERIDO - Código del cupón (ej: PARRI10, AGENTE30)
  
  id_comercio: string;                 // REQUERIDO - Referencia al comercio
                                       // ✅ Ya usa id_comercio (no commerce_code)
  
  // === TIPO Y VALOR ===
  tipo: 'porcentaje' | 'monto_fijo' | 'envio_gratis';
                                       // REQUERIDO - Tipo de descuento (default: "porcentaje")
  
  valor: number;                       // REQUERIDO - Valor del descuento (monto o %)
                                       // Si tipo = "porcentaje": 10 = 10%
                                       // Si tipo = "monto_fijo": 5000 = $5000
                                       // Si tipo = "envio_gratis": 0
  
  // === CONDICIONES ===
  minimo_compra?: number;              // Mínimo de compra para aplicar (default: 0)
  
  acumulable?: boolean;                // Permite sumarse a otras promociones (default: true)
                                       // Ej: Acumular con descuento por transferencia
  
  // === ORIGEN Y TRACKING ===
  origen: 'popup_emergente' | 'agente_whatsapp' | 'sistema_referidos';
                                       // REQUERIDO - Determina si fue automático o manual
  
  id_creador?: string;                 // ID del agente que emitió el cupón
                                       // Para seguimiento de ventas por agente
  
  // === USOS ===
  usos_maximos?: number;               // Usos máximos permitidos (default: 1)
  usos_actuales?: number;              // Usos actuales (default: 0)
  
  // === VIGENCIA ===
  fecha_inicio?: string;               // Fecha de inicio (YYYY-MM-DD)
  fecha_fin?: string;                  // Fecha de fin (YYYY-MM-DD)
  activo?: boolean;                    // Cupón activo (default: true)
  
  // === SISTEMA DE REFERIDOS ===
  es_referido?: boolean;               // Es cupón de referido (default: false)
  id_cliente_dueno?: string;           // Cliente dueño del cupón (para referidos)
                                       // El que refirió recibe beneficio cuando se usa
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `codigo`
- `id_comercio`
- `tipo`
- `valor`
- `origen`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Ya usa `id_comercio` en lugar de `commerce_code`
- Sistema de referidos integrado
- Tracking de agentes
- Cupones acumulables

**Notas Importantes:**

**Tipos de Cupón:**
- `porcentaje` → Descuento en porcentaje (ej: 10% off)
- `monto_fijo` → Descuento fijo en ARS (ej: $5000 off)
- `envio_gratis` → Envío gratis (valor = 0)

**Origen del Cupón:**
- `popup_emergente` → Generado automáticamente por popup de salida
- `agente_whatsapp` → Creado manualmente por agente de ventas
- `sistema_referidos` → Generado por sistema de referidos

**Acumulable:**
```javascript
// Ejemplo: Producto $10,000
// Cupón PARRI10: 10% off → $9,000
// Descuento transferencia: 10% → $8,100 (si acumulable = true)

if (cupon.acumulable) {
  // Aplicar cupón + descuento transferencia
  precioFinal = precioBase * (1 - cupon.valor/100) * (1 - descuentoTransferencia/100);
} else {
  // Solo aplicar cupón
  precioFinal = precioBase * (1 - cupon.valor/100);
}
```

**Sistema de Referidos:**
```javascript
// Cliente A refiere a Cliente B
// Se crea cupón para Cliente B:
{
  codigo: "REF_CLIENTE_A_123",
  tipo: "porcentaje",
  valor: 10,
  origen: "sistema_referidos",
  es_referido: true,
  id_cliente_dueno: "id_cliente_a",  // Cliente A recibe beneficio
  usos_maximos: 1
}

// Cuando Cliente B usa el cupón:
// 1. Cliente B obtiene 10% de descuento
// 2. Cliente A recibe crédito/cupón como recompensa
```

**Tracking de Agentes:**
```javascript
// Agente crea cupón personalizado para cliente
{
  codigo: "AGENTE_JUAN_50",
  tipo: "monto_fijo",
  valor: 5000,
  origen: "agente_whatsapp",
  id_creador: "id_agente_juan",  // Para comisiones/estadísticas
  usos_maximos: 1
}

// Reportes:
// - Ventas por agente
// - Comisiones por agente
// - Efectividad de cupones por agente
```

**Validación de Cupón:**
```javascript
const validarCupon = (cupon, totalCompra) => {
  // 1. Verificar si está activo
  if (!cupon.activo) return { valido: false, error: "Cupón inactivo" };
  
  // 2. Verificar fechas
  const hoy = new Date();
  if (cupon.fecha_inicio && new Date(cupon.fecha_inicio) > hoy) {
    return { valido: false, error: "Cupón aún no válido" };
  }
  if (cupon.fecha_fin && new Date(cupon.fecha_fin) < hoy) {
    return { valido: false, error: "Cupón expirado" };
  }
  
  // 3. Verificar usos
  if (cupon.usos_actuales >= cupon.usos_maximos) {
    return { valido: false, error: "Cupón agotado" };
  }
  
  // 4. Verificar mínimo de compra
  if (totalCompra < cupon.minimo_compra) {
    return { valido: false, error: `Compra mínima: $${cupon.minimo_compra}` };
  }
  
  return { valido: true };
};
```

**Cálculo de Descuento:**
```javascript
const calcularDescuento = (cupon, subtotal) => {
  switch (cupon.tipo) {
    case 'porcentaje':
      return subtotal * (cupon.valor / 100);
    
    case 'monto_fijo':
      return Math.min(cupon.valor, subtotal); // No puede ser mayor al subtotal
    
    case 'envio_gratis':
      return 0; // El descuento se aplica en costo_envio
    
    default:
      return 0;
  }
};
```

**Uso Típico:**

**Cupón de Popup:**
```javascript
{
  codigo: "PRIMERACOMPRA15",
  id_comercio: "COM_ABC123",
  tipo: "porcentaje",
  valor: 15,
  minimo_compra: 10000,
  acumulable: true,
  origen: "popup_emergente",
  usos_maximos: 1000,
  fecha_fin: "2026-03-31",
  activo: true
}
```

**Cupón de Agente:**
```javascript
{
  codigo: "AGENTE_MARIA_20",
  id_comercio: "COM_ABC123",
  tipo: "porcentaje",
  valor: 20,
  minimo_compra: 0,
  acumulable: false,
  origen: "agente_whatsapp",
  id_creador: "agente_maria_id",
  usos_maximos: 1,
  activo: true
}
```

**Cupón de Referido:**
```javascript
{
  codigo: "REF_JUAN_10",
  id_comercio: "COM_ABC123",
  tipo: "porcentaje",
  valor: 10,
  minimo_compra: 5000,
  acumulable: true,
  origen: "sistema_referidos",
  es_referido: true,
  id_cliente_dueno: "cliente_juan_id",
  usos_maximos: 1,
  activo: true
}
```

---

### 13. **Reseña** (Product Review)
**Propósito:** Reseñas de productos con UGC para anuncios dinámicos.  
**⚠️ ESQUEMA REAL DE BASE44** - Con keywords IA y compra verificada

```typescript
interface Resena {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_producto: string;                 // REQUERIDO - Producto reseñado
  id_cliente: string;                  // REQUERIDO - Cliente que reseña
  id_orden?: string;                   // Orden asociada (garantiza compra verificada)
  id_comercio?: string;                // Comercio al que pertenece
  
  // === DATOS DE LA RESEÑA ===
  estrellas: number;                   // REQUERIDO - Rating 1-5
  titulo?: string;                     // Título de la reseña
  texto?: string;                      // Texto completo de la reseña
  nombre_cliente?: string;             // Nombre del cliente (para mostrar)
  
  // === UGC (USER GENERATED CONTENT) ===
  foto_url?: string;                   // Foto de la reseña
                                       // VITAL para anuncios dinámicos (UGC)
                                       // Meta prioriza ads con contenido real de usuarios
  
  // === INTELIGENCIA ARTIFICIAL ===
  keywords_detectadas?: string[];      // Keywords detectadas por IA
                                       // Para segmentación de anuncios
                                       // Ej: ["calidad", "resistente", "recomendado"]
  
  // === MODERACIÓN ===
  aprobada?: boolean;                  // Reseña aprobada por moderador (default: false)
  destacada?: boolean;                 // Mostrar en slider de Home (default: false)
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `id_producto`
- `id_cliente`
- `estrellas`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Compra verificada con `id_orden`
- UGC para anuncios dinámicos
- Keywords IA para segmentación
- Sistema de moderación

**Notas Importantes:**

**Compra Verificada:**
- Si `id_orden` existe → Badge "Compra Verificada" ✓
- Aumenta confianza del comprador
- Solo clientes que compraron pueden reseñar

**UGC para Meta Ads:**
```javascript
// Reseñas con foto tienen MUCHO mejor performance en Meta
// Meta prioriza contenido generado por usuarios (UGC)

// Ejemplo de ad con UGC:
{
  imagen: resena.foto_url,  // Foto real del cliente usando el producto
  texto: `"${resena.texto}" - ${resena.nombre_cliente}`,
  rating: resena.estrellas
}

// Resultado: +30-50% CTR vs ads sin UGC
```

**Keywords IA:**
```javascript
// IA analiza el texto y detecta keywords
const texto = "Excelente parrilla, muy resistente y fácil de limpiar";

keywords_detectadas: [
  "excelente",
  "resistente", 
  "fácil de limpiar"
]

// Uso en segmentación:
// - Mostrar reseñas con "resistente" a usuarios que buscan durabilidad
// - Mostrar reseñas con "fácil de limpiar" a usuarios que valoran mantenimiento
```

**Sistema de Moderación:**
```javascript
// Flujo de aprobación
1. Cliente deja reseña → aprobada: false
2. Moderador revisa → aprobada: true
3. Si es muy buena → destacada: true (aparece en Home)

// Solo mostrar reseñas aprobadas en público
const resenasPublicas = resenas.filter(r => r.aprobada);
```

**Cálculo de Rating Promedio:**
```javascript
// Actualizar producto con promedio de reseñas
const resenas = await obtenerResenas(id_producto);
const resenasAprobadas = resenas.filter(r => r.aprobada);

const promedio = resenasAprobadas.reduce((sum, r) => sum + r.estrellas, 0) / resenasAprobadas.length;
const totalResenas = resenasAprobadas.length;

await actualizarProducto(id_producto, {
  promedio_estrellas: promedio,
  total_resenas: totalResenas
});
```

**Validación de Reseña:**
```javascript
const validarResena = async (id_cliente, id_producto) => {
  // 1. Verificar que el cliente compró el producto
  const orden = await buscarOrden({
    id_cliente,
    items: { $elemMatch: { id_producto } },
    estado: "entregado"
  });
  
  if (!orden) {
    return { valido: false, error: "Debes comprar el producto para reseñar" };
  }
  
  // 2. Verificar que no haya reseñado antes
  const resenaExistente = await buscarResena({ id_cliente, id_producto });
  
  if (resenaExistente) {
    return { valido: false, error: "Ya reseñaste este producto" };
  }
  
  return { valido: true, id_orden: orden.id };
};
```

**Uso en Anuncios Dinámicos:**
```javascript
// Crear carousel de Meta con reseñas destacadas
const resenasDestacadas = await obtenerResenas({
  destacada: true,
  aprobada: true,
  foto_url: { $exists: true }  // Solo con foto
});

// Generar ads dinámicos
const ads = resenasDestacadas.map(resena => ({
  imagen: resena.foto_url,
  titulo: `⭐ ${resena.estrellas}/5 - ${resena.titulo}`,
  descripcion: resena.texto,
  cta: "Ver Producto",
  link: `/producto/${resena.id_producto}`
}));
```

**Incentivos para Reseñas:**
```javascript
// Ofrecer cupón por dejar reseña con foto
if (resena.foto_url) {
  await crearCupon({
    codigo: `RESENA_${id_cliente}_${Date.now()}`,
    tipo: "porcentaje",
    valor: 5,
    origen: "popup_emergente",
    usos_maximos: 1,
    id_comercio
  });
  
  // Notificar al cliente
  await enviarWhatsApp(cliente.whatsapp, 
    "¡Gracias por tu reseña! Te regalamos un cupón de 5% de descuento: RESENA_XXX"
  );
}
```

**Ejemplo de Uso:**
```javascript
{
  id_producto: "PARRI-001",
  id_cliente: "cliente_123",
  id_orden: "ORDER-456",
  id_comercio: "COM_ABC",
  nombre_cliente: "Juan Pérez",
  estrellas: 5,
  titulo: "Excelente parrilla, superó mis expectativas",
  texto: "La compré hace 3 meses y es increíble. Muy resistente, fácil de limpiar y el emparrillado de acero inoxidable es de primera calidad.",
  foto_url: "https://storage.com/resenas/foto_juan_parrilla.jpg",
  keywords_detectadas: ["excelente", "resistente", "fácil de limpiar", "calidad"],
  aprobada: true,
  destacada: true
}
```

---

### 14. **TrackingEvent** (User Tracking Event)
**Propósito:** Eventos de tracking de usuarios en la tienda.

```typescript
interface TrackingEvent {
  id: string;
  _id?: string;
  
  // Identificadores
  client_id: string;                   // ID anónimo del cliente
  commerce_code: string;
  session_id?: string;
  
  // Evento
  event_type: string;                  // "page_view", "product_view", etc.
  event_data?: object;                 // Datos adicionales del evento
  
  // Contexto
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  
  // Metadatos
  timestamp: string;                   // ISO 8601
  created_at: string;
}
```

---

### 15. **Logs_Configuracion** (Configuration Audit Log)
**Propósito:** Auditoría de cambios en configuración del comercio.  
**⚠️ ESQUEMA REAL DE BASE44** - Para compliance y debugging

```typescript
interface Logs_Configuracion {
  // === IDENTIFICADORES ===
  id: string;
  _id?: string;
  
  id_comercio: string;                 // REQUERIDO - Comercio afectado
  id_admin: string;                    // REQUERIDO - Email del admin que realizó el cambio
  
  // === CAMBIOS ===
  campos_modificados: Record<string, {
    valor_anterior: any;               // Valor antes del cambio
    valor_nuevo: any;                  // Valor después del cambio
  }>;                                  // REQUERIDO - Objeto con cambios
  
  descripcion?: string;                // Descripción legible del cambio
                                       // Ej: "Cambió color primario de #3b82f6 a #ef4444"
  
  // === CONTEXTO ===
  timestamp?: string;                  // ISO 8601 - Fecha y hora del cambio
  ip_address?: string;                 // IP del administrador
  
  // === METADATOS ===
  created_at?: string;                 // ISO 8601
}
```

**Campos Requeridos:**
- `id_comercio`
- `id_admin`
- `campos_modificados`

**✅ BUENAS PRÁCTICAS IMPLEMENTADAS:**
- Auditoría completa de cambios
- Tracking de quién hizo qué
- Valores anteriores y nuevos
- IP para seguridad

**Notas Importantes:**

**Estructura de Campos Modificados:**
```javascript
campos_modificados: {
  "colores.primario": {
    valor_anterior: "#3b82f6",
    valor_nuevo: "#ef4444"
  },
  "whatsapp_alertas_ventas": {
    valor_anterior: "+5491112345678",
    valor_nuevo: "+5491187654321"
  },
  "descuento_base_transferencia": {
    valor_anterior: 10,
    valor_nuevo: 15
  }
}
```

**Uso en Auditoría:**
```javascript
// Registrar cambio de configuración
const registrarCambio = async (id_comercio, id_admin, cambios, ip_address) => {
  const log = {
    id_comercio,
    id_admin,
    campos_modificados: cambios,
    descripcion: generarDescripcion(cambios),
    timestamp: new Date().toISOString(),
    ip_address
  };
  
  await crearLog(log);
};

// Ejemplo de uso
await registrarCambio(
  "COM_ABC123",
  "admin@comercio.com",
  {
    "colores.primario": {
      valor_anterior: "#3b82f6",
      valor_nuevo: "#ef4444"
    }
  },
  "192.168.1.100"
);
```

**Generar Descripción Legible:**
```javascript
const generarDescripcion = (campos_modificados) => {
  const cambios = Object.entries(campos_modificados).map(([campo, valores]) => {
    return `${campo}: ${valores.valor_anterior} → ${valores.valor_nuevo}`;
  });
  
  return cambios.join(", ");
};

// Resultado: "colores.primario: #3b82f6 → #ef4444, descuento_base_transferencia: 10 → 15"
```

**Consultas Útiles:**
```javascript
// Ver historial de cambios de un comercio
const historial = await obtenerLogs({ id_comercio: "COM_ABC123" });

// Ver cambios de un admin específico
const cambiosAdmin = await obtenerLogs({ id_admin: "admin@comercio.com" });

// Ver cambios en un campo específico
const cambiosColor = await obtenerLogs({
  "campos_modificados.colores.primario": { $exists: true }
});

// Ver cambios en las últimas 24 horas
const cambiosRecientes = await obtenerLogs({
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000).toISOString() }
});
```

**Revertir Cambios:**
```javascript
// Función para revertir un cambio
const revertirCambio = async (log_id) => {
  const log = await obtenerLog(log_id);
  
  const valoresAnteriores = {};
  Object.entries(log.campos_modificados).forEach(([campo, valores]) => {
    valoresAnteriores[campo] = valores.valor_anterior;
  });
  
  await actualizarConfiguracion(log.id_comercio, valoresAnteriores);
  
  // Registrar la reversión
  await registrarCambio(
    log.id_comercio,
    "system",
    Object.fromEntries(
      Object.entries(log.campos_modificados).map(([campo, valores]) => [
        campo,
        {
          valor_anterior: valores.valor_nuevo,
          valor_nuevo: valores.valor_anterior
        }
      ])
    ),
    "system"
  );
};
```

**Ejemplo de Uso Completo:**
```javascript
{
  id_comercio: "COM_ABC123",
  id_admin: "admin@micomercio.com",
  campos_modificados: {
    "colores.primario": {
      valor_anterior: "#3b82f6",
      valor_nuevo: "#ef4444"
    },
    "colores.secundario": {
      valor_anterior: "#1e40af",
      valor_nuevo: "#dc2626"
    },
    "descuento_base_transferencia": {
      valor_anterior: 10,
      valor_nuevo: 15
    }
  },
  descripcion: "Cambió esquema de colores a rojo y aumentó descuento por transferencia",
  timestamp: "2026-02-04T01:13:46-03:00",
  ip_address: "192.168.1.100"
}
```

**Beneficios:**
- **Compliance:** Cumplimiento de auditorías
- **Debugging:** Identificar cuándo se rompió algo
- **Seguridad:** Detectar cambios no autorizados
- **Reversión:** Poder volver atrás fácilmente
- **Transparencia:** Saber quién hizo qué y cuándo

---

## 🔐 ENTIDADES DE AUTENTICACIÓN

### 14. **SuperAdmin** (Super Administrator)
**Propósito:** Usuario supremo de la plataforma.

```typescript
interface SuperAdmin {
  id: string;
  _id?: string;
  
  // Credenciales
  email: string;                       // Email único
  password_hash: string;               // Hash SHA-256
  
  // Datos
  nombre?: string;
  
  // Estado
  activo: boolean;
  
  // Metadatos
  created_at: string;
  ultimo_login?: string;
}
```

---

## 📊 RESUMEN DE ENTIDADES

| Entidad | Propósito | Relaciones Principales |
|---------|-----------|------------------------|
| **Comercio** | Tiendas registradas | - |
| **Producto** | Catálogo de productos | → Comercio |
| **AtributoProducto** | Atributos de productos | → Producto |
| **Orden** | Órdenes de compra | → Comercio, → Cliente |
| **Cliente** | Clientes de tiendas | → Comercio |
| **Lead** | Contactos/Leads | → Comercio, → Cliente, → Sorteo |
| **Sorteo** | Sorteos/Concursos | → Comercio, → Producto |
| **ConfiguracionComercio** | Config de tienda | → Comercio |
| **EventoMeta** | Eventos Meta CAPI | → Comercio |
| **GastoPublicitario** | Gastos y créditos | → Comercio |
| **ConfiguracionGlobal** | Config global | - |
| **Cupon** | Cupones de descuento | → Comercio |
| **TrackingEvent** | Tracking de usuarios | → Comercio |
| **SuperAdmin** | Administradores | - |

---

## 🎯 CAMPOS ESTANDARIZADOS

### Identificadores
- **Siempre usar:** `commerce_code` como identificador principal de comercio
- **Opcional:** `id_comercio` como campo adicional
- **IDs de Base44:** `id` o `_id` (ambos válidos)

### Timestamps
- **Formato:** ISO 8601 (`new Date().toISOString()`)
- **Campos estándar:** `created_at`, `updated_at`

### Relaciones
- **Productos → Comercio:** `commerce_code` (obligatorio)
- **Órdenes → Comercio:** `commerce_code` (obligatorio)
- **Clientes → Comercio:** `commerce_code` (obligatorio)

---

**📌 IMPORTANTE:** Este documento es la fuente única de verdad. Cualquier cambio en las entidades debe reflejarse aquí primero.
