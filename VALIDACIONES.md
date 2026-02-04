# 📋 VALIDACIONES Y REGLAS DE NEGOCIO

> **Fuente Única de Verdad para Validaciones**  
> Fecha: 2026-02-04  
> **IMPORTANTE:** Frontend y Backend deben usar las MISMAS reglas

---

## 🎯 OBJETIVO

Este documento define **todas las validaciones** que deben aplicarse en:
- ✅ Frontend (antes de enviar al backend)
- ✅ Backend (antes de guardar en Base44)
- ✅ Base44 (validaciones de esquema)

**Regla de oro:** Si una validación está aquí, DEBE implementarse en ambos lados.

---

## 📱 FORMATOS ESTÁNDAR

### **Teléfono (Argentina)**
```javascript
// Formato esperado: +54XXXXXXXXXX (sin espacios, guiones ni paréntesis)
// Ejemplos válidos:
// - +5491112345678 (CABA/GBA)
// - +543514567890 (Córdoba)

const normalizeArgentinaPhone = (phone) => {
  // Remover espacios, guiones, paréntesis
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Si empieza con 0, removerlo
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Si no empieza con +54, agregarlo
  if (!cleaned.startsWith('+54')) {
    // Si empieza con 54, agregar +
    if (cleaned.startsWith('54')) {
      cleaned = '+' + cleaned;
    } else {
      // Agregar +54
      cleaned = '+54' + cleaned;
    }
  }
  
  return cleaned;
};

// Validación
const isValidArgentinaPhone = (phone) => {
  const normalized = normalizeArgentinaPhone(phone);
  // Debe tener entre 12-13 dígitos (+54 + 10-11 dígitos)
  return /^\+54\d{10,11}$/.test(normalized);
};
```

### **Email**
```javascript
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const normalizeEmail = (email) => {
  return email.toLowerCase().trim();
};
```

### **Código Postal (Argentina)**
```javascript
const isValidArgentinaZipCode = (zipCode) => {
  // Formato: 4 dígitos (ej: 1425, 5000)
  // O formato nuevo: letra + 4 dígitos + 3 letras (ej: C1425ABC)
  return /^\d{4}$/.test(zipCode) || /^[A-Z]\d{4}[A-Z]{3}$/.test(zipCode);
};
```

### **Fechas**
```javascript
// Formato ISO 8601: YYYY-MM-DD
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Formato ISO 8601 con hora: YYYY-MM-DDTHH:mm:ss.sssZ
const isValidDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date instanceof Date && !isNaN(date);
};
```

### **Colores Hexadecimales**
```javascript
const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};
```

### **URLs**
```javascript
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

---

## 🏢 VALIDACIONES POR ENTIDAD

### **1. Cliente**

#### Campos Requeridos
- `nombre_completo` (string, min: 2, max: 100)
- `email` (string, formato email)
- `whatsapp` (string, formato teléfono Argentina)

#### Validaciones
```javascript
const validateCliente = (cliente) => {
  const errors = {};
  
  // Nombre completo
  if (!cliente.nombre_completo || cliente.nombre_completo.trim().length < 2) {
    errors.nombre_completo = 'El nombre debe tener al menos 2 caracteres';
  }
  if (cliente.nombre_completo && cliente.nombre_completo.length > 100) {
    errors.nombre_completo = 'El nombre no puede exceder 100 caracteres';
  }
  
  // Email
  if (!cliente.email) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(cliente.email)) {
    errors.email = 'El email no es válido';
  }
  
  // WhatsApp
  if (!cliente.whatsapp) {
    errors.whatsapp = 'El WhatsApp es requerido';
  } else if (!isValidArgentinaPhone(cliente.whatsapp)) {
    errors.whatsapp = 'El WhatsApp debe ser un número argentino válido';
  }
  
  // Teléfono de entrega (opcional pero si existe, validar)
  if (cliente.telefono_entrega && !isValidArgentinaPhone(cliente.telefono_entrega)) {
    errors.telefono_entrega = 'El teléfono de entrega no es válido';
  }
  
  // Código postal (opcional pero si existe, validar)
  if (cliente.codigo_postal && !isValidArgentinaZipCode(cliente.codigo_postal)) {
    errors.codigo_postal = 'El código postal no es válido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### Reglas de Negocio
- Email debe ser único por comercio
- WhatsApp debe normalizarse antes de guardar
- Todos los hashes deben generarse con SHA-256
- `puntuacion_ltv` se calcula automáticamente (no editable por usuario)
- `cross_store_trust_score` default: 50 (rango: 1-100)

---

### **2. Producto**

#### Campos Requeridos
- `id_comercio` (string)
- `titulo` (string, min: 3, max: 200)
- `precio_estandar` (number, min: 0)
- `sku_taller_interno` (string, único por comercio)
- `moneda` (string, default: "ARS")

#### Validaciones
```javascript
const validateProducto = (producto) => {
  const errors = {};
  
  // ID Comercio
  if (!producto.id_comercio) {
    errors.id_comercio = 'El ID del comercio es requerido';
  }
  
  // Título
  if (!producto.titulo || producto.titulo.trim().length < 3) {
    errors.titulo = 'El título debe tener al menos 3 caracteres';
  }
  if (producto.titulo && producto.titulo.length > 200) {
    errors.titulo = 'El título no puede exceder 200 caracteres';
  }
  
  // SKU
  if (!producto.sku_taller_interno) {
    errors.sku_taller_interno = 'El SKU es requerido';
  }
  // TODO: Validar unicidad en backend
  
  // Precio
  if (producto.precio_estandar === undefined || producto.precio_estandar === null) {
    errors.precio_estandar = 'El precio es requerido';
  } else if (producto.precio_estandar < 0) {
    errors.precio_estandar = 'El precio no puede ser negativo';
  }
  
  // Stock
  if (producto.stock_actual !== undefined && producto.stock_actual < 0) {
    errors.stock_actual = 'El stock no puede ser negativo';
  }
  
  // Fotos (si existen, validar estructura)
  if (producto.fotos && Array.isArray(producto.fotos)) {
    producto.fotos.forEach((foto, index) => {
      if (!foto.url) {
        errors[`fotos[${index}].url`] = 'La URL de la foto es requerida';
      } else if (!isValidURL(foto.url)) {
        errors[`fotos[${index}].url`] = 'La URL de la foto no es válida';
      }
      
      if (!['principal', 'detalle', 'uso'].includes(foto.tipo)) {
        errors[`fotos[${index}].tipo`] = 'El tipo de foto debe ser: principal, detalle o uso';
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### Reglas de Negocio
- SKU debe ser único por comercio
- `precio_estandar` es el precio base (sin variaciones de atributos)
- `precio_meta_referencia` solo para Meta (no mostrar en frontend)
- Stock no puede ser negativo
- Si `destacado: true`, debe tener al menos 1 foto
- `total_vendidos` se incrementa automáticamente (no editable)
- `promedio_estrellas` se calcula de reseñas aprobadas

---

### **3. Orden**

#### Campos Requeridos
- `id_comercio` (string)
- `items` (array, min: 1)
- `total` (number, min: 0)
- `numero_orden` (string, único)
- `event_id_meta` (string, único)

#### Validaciones
```javascript
const validateOrden = (orden) => {
  const errors = {};
  
  // ID Comercio
  if (!orden.id_comercio) {
    errors.id_comercio = 'El ID del comercio es requerido';
  }
  
  // Items
  if (!orden.items || !Array.isArray(orden.items) || orden.items.length === 0) {
    errors.items = 'Debe haber al menos 1 producto en la orden';
  } else {
    orden.items.forEach((item, index) => {
      if (!item.id_producto) {
        errors[`items[${index}].id_producto`] = 'El ID del producto es requerido';
      }
      if (!item.cantidad || item.cantidad <= 0) {
        errors[`items[${index}].cantidad`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.precio_unitario === undefined || item.precio_unitario < 0) {
        errors[`items[${index}].precio_unitario`] = 'El precio unitario es requerido';
      }
    });
  }
  
  // Total
  if (orden.total === undefined || orden.total < 0) {
    errors.total = 'El total es requerido y no puede ser negativo';
  }
  
  // Número de orden
  if (!orden.numero_orden) {
    errors.numero_orden = 'El número de orden es requerido';
  }
  
  // Event ID Meta
  if (!orden.event_id_meta) {
    errors.event_id_meta = 'El event_id_meta es requerido para tracking';
  }
  
  // Estado
  const estadosValidos = ['pendiente_pago', 'pago_confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
  if (orden.estado && !estadosValidos.includes(orden.estado)) {
    errors.estado = `El estado debe ser uno de: ${estadosValidos.join(', ')}`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### Reglas de Negocio
- `numero_orden` debe ser único globalmente
- `event_id_meta` debe ser idéntico entre Pixel y CAPI
- Solo enviar evento Purchase cuando `estado === "pago_confirmado"`
- Verificar `evento_purchase_enviado === false` antes de enviar
- Calcular `total` = `subtotal` - `descuento` + `costo_envio`
- Validar stock antes de confirmar orden
- Descontar stock solo cuando `estado === "pago_confirmado"`

---

### **4. Cupón**

#### Campos Requeridos
- `codigo` (string, único por comercio)
- `id_comercio` (string)
- `tipo` (enum: porcentaje, monto_fijo, envio_gratis)
- `valor` (number)
- `origen` (enum: popup_emergente, agente_whatsapp, sistema_referidos)

#### Validaciones
```javascript
const validateCupon = (cupon) => {
  const errors = {};
  
  // Código
  if (!cupon.codigo || cupon.codigo.trim().length < 3) {
    errors.codigo = 'El código debe tener al menos 3 caracteres';
  }
  if (cupon.codigo && cupon.codigo.length > 50) {
    errors.codigo = 'El código no puede exceder 50 caracteres';
  }
  // Código debe ser alfanumérico y guiones bajos
  if (cupon.codigo && !/^[A-Z0-9_]+$/.test(cupon.codigo)) {
    errors.codigo = 'El código solo puede contener letras mayúsculas, números y guiones bajos';
  }
  
  // Tipo
  const tiposValidos = ['porcentaje', 'monto_fijo', 'envio_gratis'];
  if (!cupon.tipo || !tiposValidos.includes(cupon.tipo)) {
    errors.tipo = `El tipo debe ser uno de: ${tiposValidos.join(', ')}`;
  }
  
  // Valor
  if (cupon.valor === undefined || cupon.valor === null) {
    errors.valor = 'El valor es requerido';
  } else {
    if (cupon.tipo === 'porcentaje' && (cupon.valor < 0 || cupon.valor > 100)) {
      errors.valor = 'El porcentaje debe estar entre 0 y 100';
    }
    if (cupon.tipo === 'monto_fijo' && cupon.valor < 0) {
      errors.valor = 'El monto no puede ser negativo';
    }
  }
  
  // Fechas
  if (cupon.fecha_inicio && cupon.fecha_fin) {
    if (new Date(cupon.fecha_fin) < new Date(cupon.fecha_inicio)) {
      errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }
  
  // Usos
  if (cupon.usos_maximos !== undefined && cupon.usos_maximos < 1) {
    errors.usos_maximos = 'Los usos máximos deben ser al menos 1';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### Reglas de Negocio
- Código debe ser único por comercio
- Código debe convertirse a mayúsculas antes de guardar
- Si `tipo === "envio_gratis"`, `valor` debe ser 0
- `usos_actuales` se incrementa automáticamente (no editable)
- Validar que `usos_actuales < usos_maximos` antes de aplicar
- Validar que fecha actual esté entre `fecha_inicio` y `fecha_fin`
- Si `es_referido === true`, debe tener `id_cliente_dueno`

---

### **5. Lead**

#### Campos Requeridos
- `id_comercio` (string)
- `whatsapp` (string, formato teléfono)
- `event_id_meta` (string, único)

#### Validaciones
```javascript
const validateLead = (lead) => {
  const errors = {};
  
  // WhatsApp
  if (!lead.whatsapp) {
    errors.whatsapp = 'El WhatsApp es requerido';
  } else if (!isValidArgentinaPhone(lead.whatsapp)) {
    errors.whatsapp = 'El WhatsApp debe ser un número argentino válido';
  }
  
  // Email (opcional pero si existe, validar)
  if (lead.email && !isValidEmail(lead.email)) {
    errors.email = 'El email no es válido';
  }
  
  // Event ID Meta
  if (!lead.event_id_meta) {
    errors.event_id_meta = 'El event_id_meta es requerido';
  }
  
  // Origen
  const origenesValidos = ['popup_salida', 'popup_precio', 'formulario', 'whatsapp_directo'];
  if (lead.origen && !origenesValidos.includes(lead.origen)) {
    errors.origen = `El origen debe ser uno de: ${origenesValidos.join(', ')}`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### Reglas de Negocio
- `event_id_meta` debe ser único
- `suppress_ads` default: true (para evitar gastar en ads)
- Solo cambiar `suppress_ads` a false si `estado === "perdido"`
- `evento_lead_enviado` se marca automáticamente después de enviar a Meta
- WhatsApp debe normalizarse antes de guardar

---

## 🔒 VALIDACIONES DE SEGURIDAD

### **Validación de Permisos**
```javascript
// Backend: Validar que el comercio solo puede modificar sus propios datos
const validateCommerceOwnership = async (resourceId, resourceType, commerce_code) => {
  const resource = await getResource(resourceType, resourceId);
  
  if (!resource) {
    throw new Error('Recurso no encontrado');
  }
  
  if (resource.id_comercio !== commerce_code && resource.commerce_code !== commerce_code) {
    throw new Error('No autorizado para modificar este recurso');
  }
  
  return resource;
};

// Uso:
await validateCommerceOwnership(productoId, 'Producto', commerce_code);
```

### **Sanitización de Inputs**
```javascript
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remover caracteres peligrosos
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .trim();
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
```

---

## 📊 MENSAJES DE ERROR ESTANDARIZADOS

### **Español (para usuarios)**
```javascript
const ERROR_MESSAGES = {
  // Campos requeridos
  REQUIRED_FIELD: 'Este campo es requerido',
  
  // Formatos
  INVALID_EMAIL: 'El email no es válido',
  INVALID_PHONE: 'El teléfono no es válido',
  INVALID_URL: 'La URL no es válida',
  INVALID_DATE: 'La fecha no es válida',
  INVALID_COLOR: 'El color debe ser hexadecimal (ej: #FF0000)',
  
  // Rangos
  MIN_LENGTH: (min) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max) => `No puede exceder ${max} caracteres`,
  MIN_VALUE: (min) => `El valor mínimo es ${min}`,
  MAX_VALUE: (max) => `El valor máximo es ${max}`,
  
  // Unicidad
  DUPLICATE_EMAIL: 'Este email ya está registrado',
  DUPLICATE_SKU: 'Este SKU ya existe',
  DUPLICATE_CODE: 'Este código ya existe',
  
  // Permisos
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'El recurso no fue encontrado',
  
  // Stock
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  OUT_OF_STOCK: 'Producto sin stock',
  
  // Cupones
  COUPON_EXPIRED: 'El cupón ha expirado',
  COUPON_EXHAUSTED: 'El cupón ya fue utilizado',
  COUPON_MIN_PURCHASE: (min) => `Compra mínima requerida: $${min}`,
  
  // Genéricos
  INTERNAL_ERROR: 'Error interno del servidor',
  NETWORK_ERROR: 'Error de conexión. Intenta nuevamente',
};
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend
- [ ] Crear archivo `src/utils/validations.js` con todas las funciones
- [ ] Importar y usar en formularios
- [ ] Mostrar errores en tiempo real (onChange)
- [ ] Deshabilitar submit si hay errores
- [ ] Usar mensajes de ERROR_MESSAGES

### Backend
- [ ] Crear archivo `functions/_utils/validations.ts`
- [ ] Importar en todas las funciones que reciben datos
- [ ] Validar ANTES de guardar en Base44
- [ ] Retornar errores con status 400
- [ ] Usar mensajes de ERROR_MESSAGES

### Testing
- [ ] Crear tests para cada función de validación
- [ ] Probar casos válidos
- [ ] Probar casos inválidos
- [ ] Probar casos edge (null, undefined, strings vacíos)

---

**📌 NOTA:** Este documento debe actualizarse cada vez que se agregue una nueva entidad o regla de negocio.
