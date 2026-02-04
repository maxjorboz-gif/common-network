# 🚨 CAMBIOS CRÍTICOS DETECTADOS - MIGRACIÓN DE ESQUEMAS

> **Análisis de diferencias entre código actual y esquemas reales de Base44**  
> Fecha: 2026-02-04  
> **Estado:** En progreso (6/15 entidades analizadas)

---

## 📊 RESUMEN EJECUTIVO

### Entidades Analizadas
1. ✅ Cliente
2. ✅ Carrito (NUEVA - no estaba en código)
3. ✅ Comercio
4. ✅ Producto
5. ✅ Orden
6. ✅ ConfiguracionComercio

### Problemas Críticos Encontrados
- 🔴 **Alta Prioridad:** 8 problemas
- 🟡 **Media Prioridad:** 12 problemas
- 🟢 **Baja Prioridad:** 5 problemas

---

## 🔴 PROBLEMAS CRÍTICOS (ALTA PRIORIDAD)

### 1. **Migración `commerce_code` → `id_comercio`**
**Entidades afectadas:** Todas  
**Impacto:** Alto  
**Estado:** Parcial (algunas entidades ya usan `id_comercio`)

**Situación actual:**
- `Comercio` tiene ambos campos: `commerce_code` (legacy) + `id_comercio` (nuevo)
- `Producto`, `Orden`, `ConfiguracionComercio` ya usan `id_comercio` ✅
- Código usa ambos nombres indistintamente ❌

**Plan de acción:**
1. Agregar campo `id_comercio` a todas las entidades que aún no lo tienen
2. Copiar valores de `commerce_code` → `id_comercio`
3. Actualizar TODO el código para usar solo `id_comercio`
4. Mantener `commerce_code` como legacy (no eliminar todavía)

---

### 2. **Password sin hashear en Comercio**
**Entidad:** Comercio  
**Impacto:** CRÍTICO - Seguridad

**Problema:**
- Base44 tiene campo `password` (texto plano) ⚠️
- Debería ser `password_hash` con SHA-256

**Riesgo:**
- Contraseñas expuestas en base de datos
- Violación de buenas prácticas de seguridad

**Solución:**
1. Crear campo `password_hash`
2. Migrar passwords existentes (hashear con SHA-256 + salt)
3. Actualizar funciones de login/registro
4. Eliminar campo `password` después de migración

---

### 3. **Estados de Orden inconsistentes**
**Entidad:** Orden  
**Impacto:** Alto

**Problema:**
- **Código actual:** `"PAGO_PENDIENTE"`, `"PAGADA"`, `"ENVIADA"` (mayúsculas)
- **Base44 real:** `"pendiente_pago"`, `"pago_confirmado"`, `"enviado"` (minúsculas)

**Impacto:**
- Todas las comparaciones de estado fallarán
- Filtros de órdenes no funcionarán
- Estadísticas incorrectas

**Solución:**
1. Migrar datos existentes (mayúsculas → minúsculas)
2. Actualizar TODO el código que compara estados
3. Actualizar frontend (filtros, badges, etc.)

---

### 4. **Event ID Meta no implementado correctamente**
**Entidad:** Orden  
**Impacto:** Alto - Métricas de Meta duplicadas

**Problema:**
- `event_id_meta` es REQUERIDO pero probablemente no se genera correctamente
- Debe ser idéntico entre Pixel (frontend) y CAPI (backend)

**Consecuencia:**
- Meta cuenta el mismo evento dos veces
- Métricas infladas (conversiones duplicadas)
- Costo de ads mal calculado

**Solución:**
1. Generar `event_id_meta` en frontend: `${numero_orden}_${timestamp}`
2. Pasar el mismo ID al backend
3. Usar el mismo ID en Pixel y CAPI
4. Implementar flag `evento_purchase_enviado` para evitar duplicados

---

### 5. **Estructura de Fotos/Videos cambió**
**Entidad:** Producto  
**Impacto:** Alto

**Problema:**
- **Código actual:** `fotos: string[]` (solo URLs)
- **Base44 real:** `fotos: ProductPhoto[]` (objetos con tipo y orden)

```typescript
// ❌ Código actual
fotos: ["url1.jpg", "url2.jpg"]

// ✅ Base44 real
fotos: [
  { url: "url1.jpg", tipo: "principal", orden: 0 },
  { url: "url2.jpg", tipo: "detalle", orden: 1 }
]
```

**Impacto:**
- Componentes de producto romperán
- Funciones de crear/actualizar producto fallarán
- Imágenes no se mostrarán correctamente

**Solución:**
1. Migrar datos existentes (string[] → ProductPhoto[])
2. Actualizar `crearProducto.ts` y `actualizarProducto.ts`
3. Actualizar componentes frontend que muestran fotos
4. Actualizar componentes de upload de imágenes

---

### 6. **Carrito NO está implementado en Base44**
**Entidad:** Carrito (NUEVA)  
**Impacto:** Alto

**Problema:**
- Código actual usa `localStorage` para carrito
- Base44 tiene entidad `Carrito` completa con:
  - Persistencia en servidor
  - Tracking de abandono
  - Recuperación de carritos
  - Flags para emails/WhatsApp

**Funcionalidades faltantes:**
- ❌ Persistencia de carritos en servidor
- ❌ Recuperación de carritos abandonados
- ❌ Emails de recuperación
- ❌ WhatsApp de recuperación
- ❌ Tracking de abandono para Meta CAPI

**Solución:**
1. Implementar funciones backend para gestión de carritos
2. Migrar lógica de `localStorage` a Base44
3. Implementar sistema de recuperación de carritos
4. Implementar eventos de abandono para Meta

---

### 7. **Colores en ConfiguracionComercio cambió estructura**
**Entidad:** ConfiguracionComercio  
**Impacto:** Medio-Alto

**Problema:**
- **Código actual:** `color_primario`, `color_secundario` (campos separados)
- **Base44 real:** `colores: { primario, secundario, acento }` (objeto)

**Impacto:**
- Queries de configuración fallarán
- Componentes que usan colores romperán
- Personalización de tienda no funcionará

**Solución:**
1. Migrar datos (campos separados → objeto)
2. Actualizar `actualizarConfiguracion.ts`
3. Actualizar componentes que leen colores
4. Actualizar panel de configuración

---

### 8. **Campos movidos de ConfiguracionComercio a Comercio**
**Entidades:** ConfiguracionComercio, Comercio  
**Impacto:** Medio

**Campos que se movieron:**
- `logo_url` → Ahora en `Comercio`
- `meta_pixel_id` → Ahora en `Comercio`
- `meta_access_token` → Ahora en `Comercio`
- `meta_dataset_id` → Ahora en `Comercio`

**Problema:**
- Código busca estos campos en `ConfiguracionComercio`
- Realmente están en `Comercio`

**Solución:**
1. Actualizar código para leer de `Comercio` en lugar de `ConfiguracionComercio`
2. Migrar datos si existen en `ConfiguracionComercio`
3. Eliminar campos obsoletos de `ConfiguracionComercio`

---

## 🟡 PROBLEMAS MEDIOS (MEDIA PRIORIDAD)

### 9. **Cliente tiene MUCHOS más campos**
**Entidad:** Cliente  
**Impacto:** Medio

**Campos nuevos NO usados:**
- `google_id` - Para Google Ads
- `telefono_entrega` + hash
- Datos geográficos completos (dirección, ciudad, provincia, CP)
- Todos los hashes geográficos para Meta CAPI
- `puntuacion_ltv` - Lifetime Value
- `cross_store_trust_score` - Para red de comercios
- `perfil_comprador` - Perfiles de IA
- `lead_source_original` - Atribución
- `referido_por` - Sistema de referidos
- `total_gastado`

**Oportunidad:**
- Mejorar tracking de Meta CAPI con más datos
- Implementar sistema de referidos
- Calcular LTV para optimización de ads
- Perfiles de comprador para personalización

---

### 10. **Funcionalidades de ConfiguracionComercio NO implementadas**
**Entidad:** ConfiguracionComercio  
**Impacto:** Medio

**Funcionalidades faltantes:**
1. Sistema de Referidos
2. Popup de Salida (exit intent)
3. Alertas WhatsApp (stock y ventas)
4. Envío Gratis Condicional
5. Alertas de Escasez
6. Descuento automático por Transferencia

**Oportunidad:**
- Aumentar conversiones con popup de salida
- Automatizar alertas de stock
- Implementar envío gratis para aumentar ticket promedio
- Crear urgencia con alertas de escasez

---

### 11. **Orden tiene campos de comisiones NO usados**
**Entidad:** Orden  
**Impacto:** Bajo-Medio

**Campos nuevos:**
- `comision_plataforma`
- `margen_vendedor`
- `costo_envio`

**Oportunidad:**
- Calcular comisiones automáticamente
- Reportes de márgenes para comercios
- Transparencia en costos

---

### 12. **Número de orden debe tener formato específico**
**Entidad:** Orden  
**Impacto:** Medio

**Formato esperado:** `"PARRI-1025"` (prefijo + número)

**Verificar:**
- ¿Se genera con este formato?
- ¿Es único?
- ¿Se usa para `event_id_meta`?

---

## 🟢 PROBLEMAS BAJOS (BAJA PRIORIDAD)

### 13. **Timestamps inconsistentes**
**Entidades:** Varias  
**Impacto:** Bajo

**Problema:**
- Algunos usan `created_at`, otros `created_date`
- Algunos tienen `updated_at`, otros no

**Solución:**
- Estandarizar a `created_at` y `updated_at`
- Formato ISO 8601

---

### 14. **IDs de Base44 inconsistentes**
**Entidades:** Todas  
**Impacto:** Bajo

**Problema:**
- Algunas entidades usan `id`, otras `_id`
- Código debe manejar ambos: `entity.id || entity._id`

**Solución:**
- Estandarizar manejo en código
- Siempre usar: `const entityId = entity.id || entity._id`

---

## 📋 PLAN DE MIGRACIÓN SUGERIDO

### Fase 1: Cambios Críticos (1-2 semanas)
1. ✅ Migrar `commerce_code` → `id_comercio`
2. ✅ Hashear passwords en `Comercio`
3. ✅ Normalizar estados de `Orden`
4. ✅ Implementar `event_id_meta` correctamente
5. ✅ Migrar estructura de fotos/videos en `Producto`

### Fase 2: Implementar Carrito (1 semana)
1. ✅ Crear funciones backend para carrito
2. ✅ Migrar de `localStorage` a Base44
3. ✅ Implementar recuperación de carritos
4. ✅ Implementar eventos de abandono

### Fase 3: Actualizar Configuraciones (3-5 días)
1. ✅ Migrar estructura de colores
2. ✅ Mover campos de `ConfiguracionComercio` a `Comercio`
3. ✅ Actualizar código que lee configuraciones

### Fase 4: Nuevas Funcionalidades (2-3 semanas)
1. ✅ Sistema de Referidos
2. ✅ Popup de Salida
3. ✅ Alertas WhatsApp
4. ✅ Envío Gratis Condicional
5. ✅ Alertas de Escasez
6. ✅ Descuento por Transferencia

### Fase 5: Optimizaciones (1-2 semanas)
1. ✅ Implementar campos de Cliente para Meta CAPI
2. ✅ Calcular LTV
3. ✅ Perfiles de comprador
4. ✅ Comisiones y márgenes en Orden

---

## 📊 MÉTRICAS DE IMPACTO

### Código a Actualizar
- **Funciones Backend:** ~30 funciones
- **Componentes Frontend:** ~15 componentes
- **Queries/Mutations:** ~25 queries

### Datos a Migrar
- **Comercio:** ~X registros (passwords, colores, meta config)
- **Producto:** ~X registros (fotos/videos)
- **Orden:** ~X registros (estados)
- **ConfiguracionComercio:** ~X registros (estructura completa)

### Tiempo Estimado Total
- **Mínimo:** 4-5 semanas
- **Realista:** 6-8 semanas
- **Con testing completo:** 8-10 semanas

---

**📌 NOTA:** Este documento se actualizará a medida que se analicen las entidades restantes.
