# 🚀 PLAN DE IMPLEMENTACIÓN - RECONSTRUCCIÓN DE LA APP

> **Roadmap de Normalización y Estandarización**  
> Fecha de inicio: 2026-02-03  
> Prioridad: CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

### Objetivo
Reconstruir la arquitectura de autenticación, validaciones y flujos de la aplicación siguiendo estándares claros y eliminando deuda técnica acumulada.

### Problema Actual
- ❌ Múltiples nombres para el mismo concepto (`commerce_code`, `id_comercio`, `commerceCode`)
- ❌ Validaciones inconsistentes entre frontend y backend
- ❌ Caminos rotos y lógica mezclada entre roles
- ❌ Deuda técnica por intentos fallidos de "mejoras"

### Solución
- ✅ Establecer **fuente única de verdad** para entidades
- ✅ Definir **arquitectura clara** de autenticación y permisos
- ✅ Implementar **validaciones estándar** en todos los niveles
- ✅ Separar **roles completamente** (Supremo ≠ Comercio)

---

## 🎯 FASES DEL PROYECTO

### ✅ FASE 0: DOCUMENTACIÓN (COMPLETADA)

**Estado:** ✅ Completada  
**Duración:** 1 día

**Entregables:**
- [x] `ENTITIES_SCHEMA.md` - Fuente única de verdad de entidades
- [x] `ARQUITECTURA.md` - Estándares y reglas de la aplicación
- [x] `PLAN_IMPLEMENTACION.md` - Este documento

---

### 🔄 FASE 1: AUTENTICACIÓN Y CONTEXTO

**Estado:** 🔄 Pendiente  
**Duración estimada:** 2-3 días  
**Prioridad:** CRÍTICA

#### Objetivos
1. Separar completamente los roles de Usuario Supremo y Usuario Comercio
2. Implementar AuthContext robusto con validaciones
3. Crear sistema de rutas protegidas

#### Tareas

##### 1.1 Revisar y Refactorizar AuthContext
**Archivo:** `src/lib/AuthContext.jsx`

**Cambios necesarios:**
```javascript
// Estado separado para cada tipo de usuario
const [superAdmin, setSuperAdmin] = useState(null);
const [comercio, setComercio] = useState(null);

// Funciones separadas
const loginSuperAdmin = async (email, password) => { ... };
const loginComercio = async (email, password) => { ... };
const logoutSuperAdmin = () => { ... };
const logoutComercio = () => { ... };

// Validaciones
const isSuperAdminAuthenticated = !!superAdmin;
const isCommerceAuthenticated = !!comercio;
```

**Checklist:**
- [ ] Separar estado de superAdmin y comercio
- [ ] Crear funciones de login separadas
- [ ] Crear funciones de logout separadas
- [ ] Implementar validación de tokens al cargar app
- [ ] Eliminar lógica de "supremo puede ser comercio"
- [ ] Agregar manejo de expiración de tokens

##### 1.2 Crear Componente ProtectedRoute
**Archivo:** `src/components/ProtectedRoute.jsx`

```javascript
export function ProtectedCommerceRoute({ children }) {
  const { isCommerceAuthenticated } = useAuth();
  
  if (!isCommerceAuthenticated) {
    return <Navigate to="/ingreso" replace />;
  }
  
  return children;
}

export function ProtectedSuperAdminRoute({ children }) {
  const { isSuperAdminAuthenticated } = useAuth();
  
  if (!isSuperAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
}
```

**Checklist:**
- [ ] Crear `ProtectedCommerceRoute`
- [ ] Crear `ProtectedSuperAdminRoute`
- [ ] Implementar redirecciones correctas
- [ ] Agregar loading state durante validación

##### 1.3 Actualizar App.jsx con Rutas Protegidas
**Archivo:** `src/App.jsx`

```javascript
<Route 
  path="/admin-panel" 
  element={
    <ProtectedCommerceRoute>
      <AdminPanel />
    </ProtectedCommerceRoute>
  } 
/>

<Route 
  path="/admin-supreme" 
  element={
    <ProtectedSuperAdminRoute>
      <AdminSupremePanel />
    </ProtectedSuperAdminRoute>
  } 
/>
```

**Checklist:**
- [ ] Proteger `/admin-panel` con `ProtectedCommerceRoute`
- [ ] Proteger `/admin-supreme` con `ProtectedSuperAdminRoute`
- [ ] Verificar redirecciones automáticas
- [ ] Agregar rutas de login si no existen

---

### 🔄 FASE 2: CLIENTES API Y COMUNICACIÓN

**Estado:** 🔄 Pendiente  
**Duración estimada:** 1-2 días  
**Prioridad:** ALTA

#### Objetivos
1. Verificar y normalizar clientes API existentes
2. Eliminar llamadas fetch() directas en componentes
3. Centralizar manejo de errores

#### Tareas

##### 2.1 Verificar commerceApiClient.js
**Archivo:** `src/api/commerceApiClient.js`

**Checklist:**
- [ ] Verificar inyección automática de token
- [ ] Verificar manejo de errores 401/403
- [ ] Verificar logout automático en caso de token inválido
- [ ] Agregar refresh token si es necesario
- [ ] Documentar uso correcto

##### 2.2 Verificar base44Client.js
**Archivo:** `src/api/base44Client.js`

**Checklist:**
- [ ] Verificar que NO inyecta tokens (público)
- [ ] Verificar manejo de errores genéricos
- [ ] Documentar uso correcto

##### 2.3 Crear/Verificar superAdminClient.js
**Archivo:** `src/api/superAdminClient.js`

**Checklist:**
- [ ] Crear cliente similar a commerceClient
- [ ] Inyectar `superadmin_token`
- [ ] Manejar errores específicos de super admin
- [ ] Documentar uso correcto

##### 2.4 Auditar y Refactorizar Componentes
**Archivos:** Todos los componentes en `src/components/` y `src/pages/`

**Checklist:**
- [ ] Buscar todas las llamadas `fetch()` directas
- [ ] Reemplazar con cliente apropiado (commerceClient, base44, superAdminClient)
- [ ] Verificar que se usan los hooks correctos (useQuery, useMutation)
- [ ] Estandarizar manejo de errores con toast

---

### 🔄 FASE 3: NORMALIZACIÓN DE BACKEND

**Estado:** 🔄 Pendiente  
**Duración estimada:** 3-4 días  
**Prioridad:** ALTA

#### Objetivos
1. Normalizar todas las funciones backend con plantilla estándar
2. Implementar validaciones consistentes
3. Estandarizar uso de `commerce_code`

#### Tareas

##### 3.1 Crear Plantilla de Función Estándar
**Archivo:** `functions/_templates/standard-function.ts`

```typescript
// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * NOMBRE_FUNCION
 * Descripción de lo que hace la función
 */
Deno.serve(async (req) => {
  try {
    // 1. CORS
    if (req.method === 'OPTIONS') return new Response("OK");

    // 2. PARSEAR REQUEST
    const body = await req.json();
    const { campo1, commerce_code } = body;

    // 3. VALIDAR INPUTS
    if (!campo1 || !commerce_code) {
      return Response.json({ 
        error: 'Campos requeridos faltantes' 
      }, { status: 400 });
    }

    // 4. INICIALIZAR CLIENTE
    const base44 = createClientFromRequest(req);
    const adminClient = base44.asServiceRole;

    // 5. VALIDAR AUTENTICACIÓN (si aplica)
    // const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    // if (!token) throw new Error('No autorizado');

    // 6. LÓGICA DE NEGOCIO
    // ...

    // 7. RESPUESTA
    return Response.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error en nombreFuncion:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
```

**Checklist:**
- [ ] Crear plantilla estándar
- [ ] Documentar cada sección
- [ ] Crear ejemplos de uso

##### 3.2 Normalizar Funciones Críticas

**Prioridad 1 - Autenticación:**
- [ ] `loginComercio.ts` - Validar estructura y respuesta
- [ ] `loginSuperAdmin.ts` - Validar estructura y respuesta
- [ ] `registrarComercio.ts` - Validar generación de commerce_code
- [ ] `obtenerDatosComercio.ts` - Validar uso de commerce_code

**Prioridad 2 - Productos:**
- [ ] `crearProducto.ts` - Validar commerce_code obligatorio
- [ ] `actualizarProducto.ts` - Validar permisos por commerce_code
- [ ] `eliminarProducto.ts` - Validar permisos por commerce_code
- [ ] `obtenerProductosAdmin.ts` - Filtrar por commerce_code

**Prioridad 3 - Órdenes:**
- [ ] `finalizarCompra.ts` - Validar stock y precios
- [ ] `confirmarPago.ts` - Validar permisos
- [ ] `obtenerOrdenes.ts` - Filtrar por commerce_code
- [ ] `cambiarEstadoOrden.ts` - Validar permisos

**Prioridad 4 - Configuración:**
- [ ] `obtenerConfiguracion.ts` - Filtrar por commerce_code
- [ ] `actualizarConfiguracion.ts` - Validar permisos

##### 3.3 Implementar Validaciones de Seguridad

**Para TODAS las funciones que modifican datos:**

```typescript
// Validar que el comercio solo puede modificar sus propios datos
const producto = await adminClient.entities.Producto.get(productoId);

if (producto.commerce_code !== commerce_code) {
  return Response.json({ 
    error: 'No autorizado para modificar este recurso' 
  }, { status: 403 });
}
```

**Checklist:**
- [ ] Auditar todas las funciones de escritura (create, update, delete)
- [ ] Agregar validación de commerce_code en cada una
- [ ] Agregar validación de existencia de recursos
- [ ] Agregar validación de permisos

---

### 🔄 FASE 4: NORMALIZACIÓN DE FRONTEND

**Estado:** 🔄 Pendiente  
**Duración estimada:** 3-4 días  
**Prioridad:** MEDIA

#### Objetivos
1. Normalizar componentes de Admin Panel
2. Normalizar componentes de Super Admin
3. Estandarizar manejo de estados y errores

#### Tareas

##### 4.1 Normalizar AdminPanel.jsx
**Archivo:** `src/pages/AdminPanel.jsx`

**Checklist:**
- [ ] Verificar que usa `useAuth()` correctamente
- [ ] Verificar que obtiene `commerce_code` del contexto
- [ ] Verificar que pasa `comercio` a componentes hijos
- [ ] Eliminar lógica de "supremo como comercio"
- [ ] Estandarizar estructura del componente

##### 4.2 Normalizar Componentes de Admin
**Archivos:** `src/components/admin/*.jsx`

**Para cada componente:**
- [ ] Verificar que recibe `comercio` como prop
- [ ] Verificar que usa `comercio.commerce_code` en queries
- [ ] Estandarizar useQuery con queryKey consistente
- [ ] Estandarizar useMutation con invalidación correcta
- [ ] Implementar loading states
- [ ] Implementar error states
- [ ] Usar toast para feedback

**Componentes a revisar:**
- [ ] `AdminProductos.jsx`
- [ ] `AdminOrdenes.jsx`
- [ ] `AdminLeads.jsx`
- [ ] `AdminEstadisticas.jsx`
- [ ] `AdminConfiguracion.jsx`
- [ ] `AdminSorteos.jsx`
- [ ] `AdminAdWallet.jsx`

##### 4.3 Normalizar AdminSupremePanel.jsx
**Archivo:** `src/pages/AdminSupremePanel.jsx`

**Checklist:**
- [ ] Verificar que usa `useAuth()` correctamente
- [ ] Verificar que obtiene datos de `superAdmin`
- [ ] Eliminar cualquier lógica de comercio
- [ ] Implementar funcionalidades de gestión de comercios
- [ ] Agregar botón de borrado con doble confirmación

##### 4.4 Normalizar Componentes Públicos
**Archivos:** `src/pages/Home.jsx`, `src/pages/Producto.jsx`, `src/pages/Checkout.jsx`

**Checklist:**
- [ ] Verificar que obtienen `commerce_code` de URL o contexto
- [ ] Verificar que usan `base44Client` (no autenticado)
- [ ] Implementar manejo de errores cuando comercio no existe
- [ ] Estandarizar estructura de componentes

---

### 🔄 FASE 5: TESTING Y VALIDACIÓN

**Estado:** 🔄 Pendiente  
**Duración estimada:** 2-3 días  
**Prioridad:** ALTA

#### Objetivos
1. Probar todos los flujos críticos
2. Validar seguridad y permisos
3. Corregir bugs encontrados

#### Tareas

##### 5.1 Testing de Autenticación

**Flujo de Registro de Comercio:**
- [ ] Registrar nuevo comercio con datos válidos
- [ ] Verificar que se genera `commerce_code` único
- [ ] Verificar que se hashea password correctamente
- [ ] Verificar que se crea registro en tabla Comercio
- [ ] Intentar registrar con email duplicado (debe fallar)

**Flujo de Login de Comercio:**
- [ ] Login con credenciales correctas
- [ ] Verificar que se genera token JWT
- [ ] Verificar que se almacena en localStorage
- [ ] Verificar redirección a /admin-panel
- [ ] Intentar login con credenciales incorrectas (debe fallar)
- [ ] Verificar que token expira correctamente

**Flujo de Login de Super Admin:**
- [ ] Login con Google OAuth
- [ ] Verificar validación de email en whitelist
- [ ] Verificar que se genera token separado
- [ ] Verificar redirección a /admin-supreme
- [ ] Intentar acceder sin autenticación (debe redirigir)

##### 5.2 Testing de Permisos

**Comercio A no puede modificar datos de Comercio B:**
- [ ] Crear producto en Comercio A
- [ ] Intentar modificar producto de Comercio A con token de Comercio B (debe fallar)
- [ ] Intentar eliminar producto de Comercio A con token de Comercio B (debe fallar)
- [ ] Verificar que órdenes solo muestran las del comercio autenticado

**Super Admin puede gestionar todos los comercios:**
- [ ] Listar todos los comercios
- [ ] Aprobar/rechazar solicitudes
- [ ] Pausar/activar comercios
- [ ] Ver estadísticas globales

##### 5.3 Testing de Flujo de Compra

**Cliente Anónimo:**
- [ ] Acceder a tienda de comercio (URL con commerce_code)
- [ ] Ver catálogo de productos
- [ ] Agregar productos al carrito
- [ ] Ir a checkout
- [ ] Completar datos personales
- [ ] Finalizar compra
- [ ] Verificar que se crea Cliente en DB
- [ ] Verificar que se crea Orden con estado PAGO_PENDIENTE
- [ ] Verificar que se registra evento en Meta

**Validaciones de Stock:**
- [ ] Intentar comprar producto sin stock (debe fallar)
- [ ] Intentar comprar más unidades que stock disponible (debe fallar)
- [ ] Verificar que stock se descuenta al confirmar pago

##### 5.4 Testing de Seguridad

**Inyección SQL/NoSQL:**
- [ ] Intentar inyectar código en campos de texto
- [ ] Verificar sanitización de inputs

**XSS:**
- [ ] Intentar inyectar scripts en descripciones de productos
- [ ] Verificar que se escapan correctamente

**CSRF:**
- [ ] Verificar que tokens JWT tienen expiración
- [ ] Verificar que se validan correctamente

---

### 🔄 FASE 6: OPTIMIZACIÓN Y PULIDO

**Estado:** 🔄 Pendiente  
**Duración estimada:** 2-3 días  
**Prioridad:** BAJA

#### Objetivos
1. Optimizar rendimiento
2. Mejorar UX
3. Documentar código

#### Tareas

##### 6.1 Optimización de Queries
- [ ] Implementar paginación en listados largos
- [ ] Agregar índices en campos de búsqueda frecuente
- [ ] Implementar caché en queries que no cambian frecuentemente

##### 6.2 Mejoras de UX
- [ ] Agregar skeletons en lugar de "Cargando..."
- [ ] Mejorar mensajes de error (más descriptivos)
- [ ] Agregar confirmaciones en acciones destructivas
- [ ] Implementar undo en acciones críticas

##### 6.3 Documentación
- [ ] Documentar todas las funciones backend
- [ ] Documentar componentes principales
- [ ] Crear guía de uso para comercios
- [ ] Crear guía de administración para super admin

---

## 📊 MÉTRICAS DE ÉXITO

### Técnicas
- ✅ 100% de funciones backend con validaciones de seguridad
- ✅ 0 llamadas fetch() directas en componentes
- ✅ 100% de rutas protegidas con validación de tokens
- ✅ Separación completa de roles (Supremo ≠ Comercio)

### Funcionales
- ✅ Registro de comercio funcional
- ✅ Login de comercio funcional
- ✅ Login de super admin funcional
- ✅ Flujo de compra completo funcional
- ✅ Gestión de productos funcional
- ✅ Gestión de órdenes funcional

### Seguridad
- ✅ Comercio A no puede acceder a datos de Comercio B
- ✅ Cliente anónimo no puede acceder a admin panel
- ✅ Tokens JWT expiran correctamente
- ✅ Passwords hasheados con salt

---

## 🚨 RIESGOS Y MITIGACIÓN

### Riesgo 1: Romper funcionalidad existente
**Probabilidad:** Alta  
**Impacto:** Alto  
**Mitigación:**
- Hacer backup completo antes de cada fase
- Probar en ambiente de desarrollo primero
- Implementar cambios de forma incremental
- Mantener versión anterior funcionando en paralelo

### Riesgo 2: Incompatibilidad con Base44
**Probabilidad:** Media  
**Impacto:** Alto  
**Mitigación:**
- Consultar documentación oficial de Base44
- Probar cambios en entidades de prueba primero
- Mantener compatibilidad con SDK actual

### Riesgo 3: Pérdida de datos durante migración
**Probabilidad:** Baja  
**Impacto:** Crítico  
**Mitigación:**
- Backup completo de Base44 antes de cambios
- No eliminar campos antiguos hasta confirmar que nuevos funcionan
- Implementar migración de datos si es necesario

---

## 📅 CRONOGRAMA ESTIMADO

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| Fase 0: Documentación | 1 día | 2026-02-03 | 2026-02-03 ✅ |
| Fase 1: Autenticación | 2-3 días | 2026-02-04 | 2026-02-06 |
| Fase 2: Clientes API | 1-2 días | 2026-02-07 | 2026-02-08 |
| Fase 3: Backend | 3-4 días | 2026-02-09 | 2026-02-12 |
| Fase 4: Frontend | 3-4 días | 2026-02-13 | 2026-02-16 |
| Fase 5: Testing | 2-3 días | 2026-02-17 | 2026-02-19 |
| Fase 6: Optimización | 2-3 días | 2026-02-20 | 2026-02-22 |

**Duración total estimada:** 13-19 días (2.5-4 semanas)

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **Revisar documentación creada:**
   - [ ] Leer `ENTITIES_SCHEMA.md` completo
   - [ ] Leer `ARQUITECTURA.md` completo
   - [ ] Aprobar plan de implementación

2. **Comenzar Fase 1:**
   - [ ] Hacer backup del código actual
   - [ ] Crear branch `feature/auth-refactor`
   - [ ] Comenzar con AuthContext

3. **Preparar ambiente:**
   - [ ] Verificar que Base44 está accesible
   - [ ] Verificar que hay datos de prueba
   - [ ] Preparar herramientas de testing

---

**📌 NOTA IMPORTANTE:** Este plan es flexible y puede ajustarse según se encuentren problemas o se identifiquen nuevas necesidades. Lo importante es mantener la dirección clara hacia una arquitectura sólida y estandarizada.
