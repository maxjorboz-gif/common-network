# 🚀 INICIO DE FASE 2 - CLIENTES API Y COMUNICACIÓN

> **Fecha de inicio:** 2026-02-04  
> **Duración estimada:** 1-2 días  
> **Prioridad:** ALTA

---

## 📋 RESUMEN DE LA FASE

### Objetivos Principales
1. ✅ Verificar y normalizar clientes API existentes
2. ✅ Crear cliente API para Super Admin
3. ✅ Eliminar llamadas `fetch()` directas en componentes
4. ✅ Centralizar manejo de errores

### ¿Por qué es importante esta fase?
- **Consistencia:** Todos los componentes usan la misma forma de comunicarse con el backend
- **Mantenibilidad:** Cambios en la API se hacen en un solo lugar
- **Seguridad:** Tokens se inyectan automáticamente
- **UX:** Manejo de errores estandarizado con toasts

---

## 🎯 TAREAS DETALLADAS

### TAREA 2.1: Verificar commerceApiClient.js

**Archivo:** `src/api/commerceApiClient.js`  
**Tiempo estimado:** 1-2 horas

#### Paso 1: Analizar el código actual

**Verificar:**
- ¿Inyecta automáticamente el token de comercio?
- ¿Maneja errores 401/403?
- ¿Hace logout automático si el token es inválido?
- ¿Tiene retry logic?
- ¿Tiene timeout?

#### Paso 2: Estandarizar el cliente

**Estructura esperada:**
```javascript
// src/api/commerceApiClient.js
import { base44 } from './base44Client';

class CommerceApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://app.base44.com';
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('commerce_token');
  }

  // Método genérico para llamadas
  async request(functionName, data = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No autenticado');
    }

    try {
      const response = await base44.functions.invoke(functionName, {
        ...data,
        token // Inyectar token automáticamente
      });

      // Manejar respuestas de error
      if (response.data && !response.data.success) {
        throw new Error(response.data.error || 'Error en la operación');
      }

      return response.data || response;
    } catch (error) {
      // Manejar errores de autenticación
      if (error.message.includes('Token inválido') || error.message.includes('No autorizado')) {
        // Logout automático
        localStorage.removeItem('commerce_token');
        localStorage.removeItem('commerce_data');
        window.location.href = '/ingreso';
      }
      
      throw error;
    }
  }

  // Métodos específicos
  async obtenerDatosComercio() {
    return this.request('obtenerDatosComercio');
  }

  async actualizarProducto(productoId, productoData) {
    return this.request('actualizarProducto', { productoId, productoData });
  }

  // ... más métodos
}

export const commerceApiClient = new CommerceApiClient();
```

#### Checklist de Tarea 2.1
- [ ] Analizar código actual
- [ ] Verificar inyección de token
- [ ] Implementar manejo de errores 401/403
- [ ] Implementar logout automático
- [ ] Agregar métodos helper
- [ ] Documentar uso
- [ ] Probar con llamadas reales

---

### TAREA 2.2: Verificar base44Client.js

**Archivo:** `src/api/base44Client.js`  
**Tiempo estimado:** 30 minutos - 1 hora

#### Paso 1: Analizar el código actual

**Verificar:**
- ¿Es el cliente oficial de Base44?
- ¿NO inyecta tokens (debe ser público)?
- ¿Maneja errores genéricos?

#### Paso 2: Documentar uso correcto

**Uso esperado:**
```javascript
import { base44 } from '@/api/base44Client';

// Llamar funciones backend públicas
const result = await base44.functions.invoke('registrarInteres', {
  email: 'user@example.com',
  id_comercio: 'ABC123'
});

// Operaciones con entidades (públicas)
const productos = await base44.entities.Producto.filter({
  id_comercio: 'ABC123',
  activo: true
});
```

#### Checklist de Tarea 2.2
- [ ] Analizar código actual
- [ ] Verificar que NO inyecta tokens
- [ ] Verificar manejo de errores
- [ ] Documentar uso correcto
- [ ] Agregar ejemplos

---

### TAREA 2.3: Crear superAdminClient.js

**Archivo:** `src/api/superAdminClient.js` (NUEVO)  
**Tiempo estimado:** 1-2 horas

#### Paso 1: Crear el archivo

```javascript
// src/api/superAdminClient.js
import { base44 } from './base44Client';

class SuperAdminApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://app.base44.com';
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('superadmin_token');
  }

  // Método genérico para llamadas
  async request(functionName, data = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No autenticado como Super Admin');
    }

    try {
      const response = await base44.functions.invoke(functionName, {
        ...data,
        token // Inyectar token automáticamente
      });

      // Manejar respuestas de error
      if (response.data && !response.data.success) {
        throw new Error(response.data.error || 'Error en la operación');
      }

      return response.data || response;
    } catch (error) {
      // Manejar errores de autenticación
      if (error.message.includes('Token inválido') || error.message.includes('No autorizado')) {
        // Logout automático
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_data');
        window.location.href = '/admin-login';
      }
      
      throw error;
    }
  }

  // Métodos específicos para Super Admin
  async obtenerTodosComercios() {
    return this.request('obtenerTodosComercios');
  }

  async suspenderComercio(comercioId) {
    return this.request('suspenderComercio', { comercioId });
  }

  async obtenerEstadisticasGlobales() {
    return this.request('obtenerEstadisticasGlobales');
  }

  // Acceso directo a entidades con Service Role
  async getEntity(entityName, id) {
    const token = this.getToken();
    if (!token) throw new Error('No autenticado');

    // Usar Service Role para acceso completo
    return base44.asServiceRole.entities[entityName].get(id);
  }

  async filterEntity(entityName, filters) {
    const token = this.getToken();
    if (!token) throw new Error('No autenticado');

    return base44.asServiceRole.entities[entityName].filter(filters);
  }

  async updateEntity(entityName, id, data) {
    const token = this.getToken();
    if (!token) throw new Error('No autenticado');

    return base44.asServiceRole.entities[entityName].update(id, data);
  }

  async deleteEntity(entityName, id) {
    const token = this.getToken();
    if (!token) throw new Error('No autenticado');

    return base44.asServiceRole.entities[entityName].delete(id);
  }
}

export const superAdminClient = new SuperAdminApiClient();
```

#### Checklist de Tarea 2.3
- [ ] Crear archivo `superAdminClient.js`
- [ ] Implementar método `request()`
- [ ] Implementar inyección de token
- [ ] Implementar manejo de errores
- [ ] Implementar logout automático
- [ ] Agregar métodos helper
- [ ] Agregar acceso a entidades con Service Role
- [ ] Documentar uso
- [ ] Probar con llamadas reales

---

### TAREA 2.4: Auditar y Refactorizar Componentes

**Archivos:** Todos los componentes en `src/components/` y `src/pages/`  
**Tiempo estimado:** 2-3 horas

#### Paso 1: Buscar llamadas `fetch()` directas

```powershell
# Buscar todos los archivos con fetch()
grep -r "fetch(" src/
```

#### Paso 2: Categorizar llamadas

**Tipos de llamadas:**
1. **Públicas** → Usar `base44.functions.invoke()`
2. **Comercio** → Usar `commerceApiClient.request()`
3. **Super Admin** → Usar `superAdminClient.request()`

#### Paso 3: Refactorizar componentes

**Antes:**
```javascript
// ❌ MAL: fetch() directo
const response = await fetch('/api/obtenerProductos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id_comercio })
});
const data = await response.json();
```

**Después:**
```javascript
// ✅ BIEN: Usar cliente apropiado
import { commerceApiClient } from '@/api/commerceApiClient';

const data = await commerceApiClient.request('obtenerProductos', { id_comercio });
```

#### Checklist de Tarea 2.4
- [ ] Buscar todas las llamadas `fetch()`
- [ ] Categorizar por tipo (público, comercio, super admin)
- [ ] Refactorizar llamadas públicas
- [ ] Refactorizar llamadas de comercio
- [ ] Refactorizar llamadas de super admin
- [ ] Estandarizar manejo de errores con toast
- [ ] Probar cada componente refactorizado

---

## 🧪 TESTING DE LA FASE 2

### Test 1: Commerce API Client
1. Login como comercio
2. Llamar a `commerceApiClient.obtenerDatosComercio()`
3. Verificar que retorna datos correctos
4. Verificar que token se inyecta automáticamente

### Test 2: Super Admin API Client
1. Login como super admin
2. Llamar a `superAdminClient.obtenerTodosComercios()`
3. Verificar que retorna datos correctos
4. Verificar que token se inyecta automáticamente

### Test 3: Manejo de Errores
1. Modificar token en localStorage a uno inválido
2. Intentar hacer una llamada
3. Verificar que hace logout automático
4. Verificar redirección a login

### Test 4: Componentes Refactorizados
1. Probar cada componente que fue refactorizado
2. Verificar que funciona igual que antes
3. Verificar que no hay errores en consola

---

## ✅ CRITERIOS DE ÉXITO

La Fase 2 se considera completada cuando:

- [x] `commerceApiClient.js` verificado y estandarizado
- [x] `base44Client.js` verificado y documentado
- [x] `superAdminClient.js` creado y funcional
- [x] Todas las llamadas `fetch()` refactorizadas
- [x] Manejo de errores centralizado
- [x] Todos los tests pasados
- [x] Documentación actualizada

---

## 📊 PROGRESO DE LA FASE

### Tarea 2.1: Verificar commerceApiClient.js
- [ ] Análisis del código actual
- [ ] Estandarización del cliente
- [ ] Testing

### Tarea 2.2: Verificar base44Client.js
- [ ] Análisis del código actual
- [ ] Documentación de uso

### Tarea 2.3: Crear superAdminClient.js
- [ ] Creación del archivo
- [ ] Implementación de métodos
- [ ] Testing

### Tarea 2.4: Auditar y Refactorizar
- [ ] Búsqueda de llamadas fetch()
- [ ] Categorización
- [ ] Refactorización
- [ ] Testing

---

## 🚀 PRÓXIMOS PASOS

Una vez completada la Fase 2:

1. **Commit y Push**
   ```powershell
   git add .
   git commit -m "✅ Fase 2 completada: Clientes API estandarizados"
   git push origin feature/auth-refactor
   ```

2. **Comenzar Fase 3: Normalización de Backend**
   - Crear plantillas de funciones
   - Normalizar `commerce_code` → `id_comercio`
   - Implementar validaciones estándar

---

**📌 NOTA:** Consulta [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) para detalles completos de todas las fases.
