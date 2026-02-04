# 🏗️ ARQUITECTURA Y ESTÁNDARES DE LA APLICACIÓN

> **Documento de Reconstrucción y Normalización**  
> Fecha: 2026-02-03  
> Versión: 2.0

---

## 🎯 CONTEXTO DEL PROYECTO

### Descripción
Plataforma multi-tenant de e-commerce donde cada comercio puede:
- Publicar productos y gestionar su catálogo
- Automatizar estrategias de marketing con IA
- Conectarse con Meta Ads para optimizar rendimientos
- Gestionar ventas, leads y estadísticas

### Tipos de Usuarios

| Usuario | Descripción | Autenticación |
|---------|-------------|---------------|
| **Usuario Supremo** | Administrador de la plataforma | Google Auth + Login Blindado |
| **Usuario Comercio** | Dueño de tienda | Registro + Login Blindado |
| **Usuario Cliente** | Comprador final | Sin autenticación (anónimo) |

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### 1. Usuario Supremo (Super Admin)

#### Autenticación
- **Método:** Google OAuth + Login blindado
- **Validación:** Email debe estar en lista blanca de Super Admins
- **Token:** JWT almacenado en `localStorage.superadmin_token`
- **Datos:** Almacenados en `localStorage.superadmin_data`

#### Flujo de Login
```
1. Usuario hace clic en botón "Login Supremo" (solo visible para admin)
2. Autenticación con Google OAuth
3. Backend valida email contra tabla SuperAdmin
4. Si válido: genera JWT y retorna datos
5. Frontend almacena token y redirige a /admin-supreme
```

#### Reglas
- ✅ **PUEDE:** Gestionar comercios, aprobar solicitudes, ver estadísticas globales
- ❌ **NO PUEDE:** Actuar como comercio (separación total de roles)
- 🔒 **Blindaje:** Botón de login solo visible mediante flag especial

---

### 2. Usuario Comercio (Merchant)

#### Autenticación
- **Método:** Email + Password (registro propio)
- **Validación:** Email único, password hasheado (SHA-256 + salt)
- **Token:** JWT almacenado en `localStorage.commerce_token`
- **Datos:** Almacenados en `localStorage.commerce_data`

#### Flujo de Registro
```
1. Usuario completa formulario de registro
2. Backend valida email único
3. Backend hashea password con salt
4. Backend genera commerce_code único
5. Backend crea registro en tabla Comercio
6. Backend retorna commerce_code y datos básicos
7. Frontend redirige a login
```

#### Flujo de Login
```
1. Usuario ingresa email + password
2. Backend busca comercio por email
3. Backend valida password hash
4. Backend genera JWT con commerce_code
5. Backend retorna token + datos del comercio
6. Frontend almacena token y redirige a /admin-panel
```

#### Reglas
- ✅ **DEBE:** Tener `commerce_code` generado al registrarse
- ✅ **DEBE:** Tener `id_comercio` (puede ser igual a `id` de Base44)
- 🔒 **Blindaje:** Todas las operaciones validan token JWT
- 📊 **Datos:** Tabla Comercio debe contener todos los campos del registro

---

### 3. Usuario Cliente (Customer)

#### Autenticación
- **Método:** Sin autenticación (navegación anónima)
- **Identificación:** `client_id` anónimo generado en frontend
- **Datos:** Capturados en checkout (nombre, email, whatsapp)

#### Flujo de Compra
```
1. Cliente accede a URL del comercio (ej: /tienda/COMMERCE_CODE)
2. Frontend renderiza tienda basada en commerce_code de la URL
3. Cliente navega catálogo sin login
4. Cliente agrega productos al carrito (localStorage)
5. Cliente completa checkout con datos personales
6. Backend crea/actualiza registro en tabla Cliente
7. Backend crea Orden y procesa pago
```

#### Reglas
- ✅ **PUEDE:** Navegar, comprar, participar en sorteos sin login
- 📝 **Datos:** Se guardan en tabla Cliente al finalizar compra
- 🔒 **Validación:** Backend valida stock y precios (frontend solo muestra)

---

## 🛣️ SISTEMA DE RUTAS Y NAVEGACIÓN

### Rutas Públicas (Sin Autenticación)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `Home.jsx` | Landing page principal |
| `/tienda/:commerce_code` | `Home.jsx` | Tienda de un comercio específico |
| `/producto/:id` | `Producto.jsx` | Detalle de producto |
| `/checkout` | `Checkout.jsx` | Proceso de compra |
| `/registro` | `MerchantRegister.jsx` | Registro de comercios |

### Rutas Protegidas - Comercio

| Ruta | Componente | Requiere | Validación |
|------|------------|----------|------------|
| `/admin-panel` | `AdminPanel.jsx` | `commerce_token` | JWT válido + commerce_code |
| `/ingreso` | `CommerceLogin.jsx` | - | Redirige si ya autenticado |

### Rutas Protegidas - Super Admin

| Ruta | Componente | Requiere | Validación |
|------|------------|----------|------------|
| `/admin-supreme` | `AdminSupremePanel.jsx` | `superadmin_token` | JWT válido + email en whitelist |
| `/admin-login` | `AdminLogin.jsx` | - | Redirige si ya autenticado |

---

## 📡 SISTEMA DE COMUNICACIÓN FRONTEND ↔ BACKEND

### Regla de Oro
> **Frontend muestra, Backend valida**

### Arquitectura de Capas

```
┌─────────────────────────────────────────┐
│         FRONTEND (React)                │
│  - Muestra datos                        │
│  - Captura input del usuario            │
│  - Valida formato básico (UI/UX)        │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP Request (JSON)
                  │ + JWT Token (si aplica)
                  │
┌─────────────────▼───────────────────────┐
│    BACKEND (Base44 Functions)          │
│  - Valida autenticación (JWT)           │
│  - Valida permisos (commerce_code)      │
│  - Valida datos de negocio              │
│  - Ejecuta lógica de negocio            │
│  - Interactúa con Base de Datos         │
└─────────────────┬───────────────────────┘
                  │
                  │ Response (JSON)
                  │
┌─────────────────▼───────────────────────┐
│       BASE44 DATABASE                   │
│  - Entidades (ver ENTITIES_SCHEMA.md)   │
└─────────────────────────────────────────┘
```

### Cliente HTTP Estandarizado

#### Para Comercios (Autenticado)
```javascript
// src/api/commerceApiClient.js
import { commerceClient } from '@/api/commerceApiClient';

// Uso
const response = await commerceClient.post('nombreFuncion', {
  // payload
});
```

**Características:**
- ✅ Inyecta automáticamente `Authorization: Bearer <token>`
- ✅ Maneja errores 401/403 (logout automático)
- ✅ Centraliza headers y base URL

#### Para Público (No Autenticado)
```javascript
// src/api/base44Client.js
import { base44 } from '@/api/base44Client';

// Uso
const response = await base44.functions.invoke('nombreFuncion', {
  // payload
});
```

**Características:**
- ✅ Sin autenticación
- ✅ Para llamadas públicas (catálogo, checkout, etc.)

---

## 🔒 SISTEMA DE VALIDACIONES

### Niveles de Validación

#### 1. Frontend (UI/UX)
**Propósito:** Mejorar experiencia de usuario, feedback inmediato

```javascript
// Ejemplo: Validación de email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

if (!isValidEmail(email)) {
  toast.error('Email inválido');
  return;
}
```

**Reglas:**
- ✅ Validar formato (email, teléfono, números)
- ✅ Validar campos requeridos
- ✅ Mostrar errores claros al usuario
- ❌ **NO** confiar en estas validaciones para seguridad

#### 2. Backend (Seguridad y Negocio)
**Propósito:** Garantizar integridad, seguridad y lógica de negocio

```typescript
// Ejemplo: Validación de stock en backend
const producto = await adminClient.entities.Producto.get(productoId);

if (producto.stock_actual < cantidadSolicitada) {
  return Response.json({ 
    error: 'Stock insuficiente' 
  }, { status: 400 });
}
```

**Reglas:**
- ✅ **SIEMPRE** validar autenticación (JWT)
- ✅ **SIEMPRE** validar permisos (commerce_code)
- ✅ **SIEMPRE** validar datos de negocio (stock, precios, etc.)
- ✅ **SIEMPRE** sanitizar inputs
- ✅ **SIEMPRE** validar existencia de recursos

---

## 🎯 ESTÁNDARES DE CÓDIGO

### Nomenclatura de Campos

#### Identificadores de Comercio
```typescript
// ✅ CORRECTO - Usar siempre
commerce_code: string;  // Identificador principal

// ✅ ACEPTABLE - Como campo adicional
id_comercio: string;    // Puede ser igual a id de Base44

// ❌ EVITAR - No usar variaciones
commerceCode, idComercio, merchant_id, etc.
```

#### Identificadores de Base44
```typescript
// ✅ Ambos son válidos (Base44 puede retornar cualquiera)
id: string;
_id: string;

// ✅ Uso seguro
const entityId = entity.id || entity._id;
```

### Estructura de Funciones Backend

```typescript
// Plantilla estándar para funciones Base44
// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    // 1. CORS
    if (req.method === 'OPTIONS') return new Response("OK");

    // 2. PARSEAR REQUEST
    const body = await req.json();
    const { campo1, campo2, commerce_code } = body;

    // 3. VALIDAR INPUTS
    if (!campo1 || !commerce_code) {
      return Response.json({ 
        error: 'Campos requeridos faltantes' 
      }, { status: 400 });
    }

    // 4. INICIALIZAR CLIENTE BASE44
    const base44 = createClientFromRequest(req);
    const adminClient = base44.asServiceRole;

    // 5. LÓGICA DE NEGOCIO
    // ... operaciones con adminClient.entities ...

    // 6. RESPUESTA EXITOSA
    return Response.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    // 7. MANEJO DE ERRORES
    console.error('Error en nombreFuncion:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
```

### Estructura de Componentes Frontend

```javascript
// Plantilla estándar para componentes de Admin
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'react-hot-toast';

export default function ComponenteAdmin({ comercio }) {
  const queryClient = useQueryClient();

  // 1. QUERIES (Lectura)
  const { data, isLoading } = useQuery({
    queryKey: ['clave-unica', comercio.commerce_code],
    queryFn: async () => {
      const response = await base44.functions.invoke('obtenerDatos', {
        commerce_code: comercio.commerce_code
      });
      return response.data || response;
    }
  });

  // 2. MUTATIONS (Escritura)
  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await base44.functions.invoke('actualizarDatos', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clave-unica']);
      toast.success('Actualizado correctamente');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // 3. HANDLERS
  const handleAction = async () => {
    mutation.mutate({ commerce_code: comercio.commerce_code });
  };

  // 4. RENDER
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

---

## 🚀 FLUJOS PRINCIPALES

### Flujo 1: Registro de Comercio

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario completa formulario en /registro                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend valida formato (email, password, etc.)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend llama: base44.functions.invoke(                │
│      'registrarComercio', { email, password, ... }          │
│    )                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend (registrarComercio.ts):                         │
│    - Valida email único                                     │
│    - Hashea password (SHA-256 + salt)                       │
│    - Genera commerce_code único                             │
│    - Crea registro en tabla Comercio                        │
│    - Retorna { success, commerce_code }                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend muestra éxito y redirige a /ingreso            │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 2: Login de Comercio

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa email + password en /ingreso            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend llama: base44.functions.invoke(                │
│      'loginComercio', { email, password }                   │
│    )                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend (loginComercio.ts):                             │
│    - Busca comercio por email                               │
│    - Valida password hash                                   │
│    - Genera JWT con commerce_code                           │
│    - Actualiza ultimo_login                                 │
│    - Retorna { token, comercio: {...} }                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend (AuthContext):                                 │
│    - Almacena token en localStorage.commerce_token          │
│    - Almacena datos en localStorage.commerce_data           │
│    - Actualiza estado de autenticación                      │
│    - Redirige a /admin-panel                                │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 3: Compra de Cliente

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Cliente accede a /tienda/COMMERCE_CODE                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend obtiene commerce_code de URL                   │
│    Llama: obtenerPaginaInicio({ commerce_code })            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend muestra catálogo de productos                  │
│    Cliente navega y agrega al carrito (localStorage)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Cliente va a /checkout                                  │
│    Completa datos: nombre, email, whatsapp, dirección       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend llama: finalizarCompra({                       │
│      commerce_code, items, cliente, metodo_pago, ...        │
│    })                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend (finalizarCompra.ts):                           │
│    - Valida stock de productos                              │
│    - Valida precios (recalcula desde DB)                    │
│    - Crea/actualiza Cliente (upsert por whatsapp)           │
│    - Crea Orden con estado PAGO_PENDIENTE                   │
│    - Registra evento Meta (InitiateCheckout)                │
│    - Retorna { success, orden }                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend muestra confirmación y datos de pago           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE NORMALIZACIÓN

### Fase 1: Entidades y Esquemas ✅
- [x] Documentar todas las entidades en `ENTITIES_SCHEMA.md`
- [x] Definir campos estándar (`commerce_code`, `id_comercio`, etc.)
- [x] Establecer relaciones entre entidades

### Fase 2: Autenticación y Rutas 🔄
- [ ] Implementar AuthContext con separación de roles
- [ ] Crear ProtectedRoute para comercios
- [ ] Crear ProtectedRoute para super admin
- [ ] Normalizar almacenamiento de tokens
- [ ] Implementar logout y renovación de tokens

### Fase 3: Clientes API 🔄
- [ ] Verificar `commerceApiClient.js` (autenticado)
- [ ] Verificar `base44Client.js` (público)
- [ ] Verificar `superAdminClient.js` (super admin)
- [ ] Eliminar llamadas fetch() directas en componentes

### Fase 4: Funciones Backend 🔄
- [ ] Normalizar todas las funciones con plantilla estándar
- [ ] Validar uso consistente de `commerce_code`
- [ ] Implementar validaciones de autenticación
- [ ] Implementar validaciones de permisos
- [ ] Implementar validaciones de negocio

### Fase 5: Frontend 🔄
- [ ] Normalizar componentes de Admin Panel
- [ ] Normalizar componentes de Super Admin
- [ ] Normalizar componentes públicos (tienda)
- [ ] Implementar manejo de errores consistente
- [ ] Implementar loading states consistentes

---

## 📝 PRÓXIMOS PASOS

1. **Revisar y corregir AuthContext** para separar roles correctamente
2. **Crear rutas protegidas** con validación de tokens
3. **Normalizar todas las funciones backend** con validaciones
4. **Eliminar lógica de "supremo como comercio"**
5. **Implementar sistema de permisos** basado en roles
6. **Testing de flujos completos** (registro, login, compra)

---

**📌 IMPORTANTE:** Este documento define la arquitectura objetivo. Cualquier desviación debe ser documentada y justificada.
