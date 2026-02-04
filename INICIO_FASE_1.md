# 🚀 INICIO DE FASE 1 - AUTENTICACIÓN Y CONTEXTO

> **Fecha de inicio:** 2026-02-04  
> **Duración estimada:** 2-3 días  
> **Prioridad:** CRÍTICA

---

## 📋 RESUMEN DE LA FASE

### Objetivos Principales
1. ✅ Separar completamente los roles de Usuario Supremo y Usuario Comercio
2. ✅ Implementar AuthContext robusto con validaciones
3. ✅ Crear sistema de rutas protegidas

### ¿Por qué es crítica esta fase?
- **Seguridad:** Evitar que un comercio acceda a funciones de super admin
- **Claridad:** Eliminar confusión entre roles
- **Base sólida:** Todas las fases siguientes dependen de esto

---

## 🎯 PREPARACIÓN ANTES DE COMENZAR

### 1. Hacer Backup del Código Actual

```powershell
# Crear backup completo
git add .
git commit -m "Backup antes de Fase 1: Autenticación y Contexto"
git push origin main

# Crear rama para la fase
git checkout -b feature/auth-refactor
```

### 2. Verificar Documentación Necesaria

Asegúrate de tener a mano:
- ✅ [`ARQUITECTURA.md`](./ARQUITECTURA.md) - Sistema de Autenticación
- ✅ [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) - Ejemplos de código
- ✅ [`VALIDACIONES.md`](./VALIDACIONES.md) - Reglas de validación
- ✅ [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) - Plan completo

### 3. Entender el Estado Actual

**Problemas identificados:**
- ❌ `AuthContext` mezcla lógica de superAdmin y comercio
- ❌ Un superAdmin puede "hacerse pasar" por comercio
- ❌ No hay rutas protegidas correctamente
- ❌ Tokens no se validan al cargar la app
- ❌ No hay manejo de expiración de tokens

---

## 📝 TAREAS DETALLADAS

### TAREA 1.1: Refactorizar AuthContext

**Archivo:** `src/lib/AuthContext.jsx`  
**Tiempo estimado:** 4-6 horas

#### Paso 1: Analizar el código actual

```powershell
# Ver el archivo actual
code src/lib/AuthContext.jsx
```

**Buscar:**
- ¿Cómo se almacenan los usuarios actualmente?
- ¿Hay funciones de login separadas?
- ¿Se validan los tokens al cargar?
- ¿Hay manejo de expiración?

#### Paso 2: Crear nueva estructura

**Estado separado:**
```javascript
const [superAdmin, setSuperAdmin] = useState(null);
const [comercio, setComercio] = useState(null);
const [isLoadingAuth, setIsLoadingAuth] = useState(true);
```

**Funciones de login separadas:**
```javascript
const loginSuperAdmin = async (email, password) => {
  try {
    // Llamar a función backend específica de super admin
    const result = await base44.functions.invoke('loginSuperAdmin', {
      email,
      password
    });
    
    if (result.success) {
      setSuperAdmin(result.superAdmin);
      localStorage.setItem('superAdminToken', result.token);
      return { success: true };
    }
  } catch (error) {
    console.error('Error en login super admin:', error);
    return { success: false, error: error.message };
  }
};

const loginComercio = async (email, password) => {
  try {
    // Llamar a función backend específica de comercio
    const result = await base44.functions.invoke('loginComercio', {
      email,
      password
    });
    
    if (result.success) {
      setComercio(result.comercio);
      localStorage.setItem('commerceToken', result.token);
      return { success: true };
    }
  } catch (error) {
    console.error('Error en login comercio:', error);
    return { success: false, error: error.message };
  }
};
```

**Funciones de logout:**
```javascript
const logoutSuperAdmin = () => {
  setSuperAdmin(null);
  localStorage.removeItem('superAdminToken');
};

const logoutComercio = () => {
  setComercio(null);
  localStorage.removeItem('commerceToken');
};
```

**Validación al cargar:**
```javascript
useEffect(() => {
  const validateTokens = async () => {
    setIsLoadingAuth(true);
    
    // Validar token de super admin
    const superAdminToken = localStorage.getItem('superAdminToken');
    if (superAdminToken) {
      try {
        const result = await base44.functions.invoke('validateSuperAdminToken', {
          token: superAdminToken
        });
        if (result.valid) {
          setSuperAdmin(result.superAdmin);
        } else {
          localStorage.removeItem('superAdminToken');
        }
      } catch (error) {
        localStorage.removeItem('superAdminToken');
      }
    }
    
    // Validar token de comercio
    const commerceToken = localStorage.getItem('commerceToken');
    if (commerceToken) {
      try {
        const result = await base44.functions.invoke('validateCommerceToken', {
          token: commerceToken
        });
        if (result.valid) {
          setComercio(result.comercio);
        } else {
          localStorage.removeItem('commerceToken');
        }
      } catch (error) {
        localStorage.removeItem('commerceToken');
      }
    }
    
    setIsLoadingAuth(false);
  };
  
  validateTokens();
}, []);
```

**Context value:**
```javascript
const value = {
  // Estado
  superAdmin,
  comercio,
  isLoadingAuth,
  
  // Validaciones
  isSuperAdminAuthenticated: !!superAdmin,
  isCommerceAuthenticated: !!comercio,
  
  // Funciones
  loginSuperAdmin,
  loginComercio,
  logoutSuperAdmin,
  logoutComercio
};
```

#### Checklist de Tarea 1.1
- [ ] Separar estado de `superAdmin` y `comercio`
- [ ] Crear `loginSuperAdmin()` y `loginComercio()`
- [ ] Crear `logoutSuperAdmin()` y `logoutComercio()`
- [ ] Implementar validación de tokens al cargar
- [ ] Eliminar lógica de "supremo puede ser comercio"
- [ ] Agregar `isLoadingAuth` state
- [ ] Probar login de super admin
- [ ] Probar login de comercio
- [ ] Probar logout de ambos
- [ ] Probar validación al recargar página

---

### TAREA 1.2: Crear Componente ProtectedRoute

**Archivo:** `src/components/ProtectedRoute.jsx` (NUEVO)  
**Tiempo estimado:** 1-2 horas

#### Paso 1: Crear el archivo

```powershell
# Crear archivo
New-Item -Path "src/components/ProtectedRoute.jsx" -ItemType File
```

#### Paso 2: Implementar componentes

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export function ProtectedCommerceRoute({ children }) {
  const { isCommerceAuthenticated, isLoadingAuth } = useAuth();
  
  // Mostrar loading mientras se valida
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validando sesión...</p>
        </div>
      </div>
    );
  }
  
  // Redirigir si no está autenticado
  if (!isCommerceAuthenticated) {
    return <Navigate to="/ingreso" replace />;
  }
  
  // Renderizar contenido protegido
  return children;
}

export function ProtectedSuperAdminRoute({ children }) {
  const { isSuperAdminAuthenticated, isLoadingAuth } = useAuth();
  
  // Mostrar loading mientras se valida
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validando sesión de administrador...</p>
        </div>
      </div>
    );
  }
  
  // Redirigir si no está autenticado
  if (!isSuperAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  
  // Renderizar contenido protegido
  return children;
}
```

#### Checklist de Tarea 1.2
- [ ] Crear archivo `ProtectedRoute.jsx`
- [ ] Implementar `ProtectedCommerceRoute`
- [ ] Implementar `ProtectedSuperAdminRoute`
- [ ] Agregar loading states
- [ ] Agregar redirecciones correctas
- [ ] Probar con usuario autenticado
- [ ] Probar con usuario no autenticado
- [ ] Probar durante loading

---

### TAREA 1.3: Actualizar App.jsx con Rutas Protegidas

**Archivo:** `src/App.jsx`  
**Tiempo estimado:** 1-2 horas

#### Paso 1: Importar componentes

```javascript
import { ProtectedCommerceRoute, ProtectedSuperAdminRoute } from '@/components/ProtectedRoute';
```

#### Paso 2: Proteger rutas

```javascript
// Ruta de Admin Panel (Comercio)
<Route 
  path="/admin-panel" 
  element={
    <ProtectedCommerceRoute>
      <AdminPanel />
    </ProtectedCommerceRoute>
  } 
/>

// Ruta de Admin Supreme (Super Admin)
<Route 
  path="/admin-supreme" 
  element={
    <ProtectedSuperAdminRoute>
      <AdminSupremePanel />
    </ProtectedSuperAdminRoute>
  } 
/>

// Rutas de login (públicas)
<Route path="/ingreso" element={<LoginComercio />} />
<Route path="/admin-login" element={<LoginSuperAdmin />} />
```

#### Checklist de Tarea 1.3
- [ ] Importar componentes de rutas protegidas
- [ ] Proteger `/admin-panel` con `ProtectedCommerceRoute`
- [ ] Proteger `/admin-supreme` con `ProtectedSuperAdminRoute`
- [ ] Verificar que `/ingreso` sea pública
- [ ] Verificar que `/admin-login` sea pública
- [ ] Probar navegación autenticado
- [ ] Probar navegación no autenticado
- [ ] Probar redirecciones automáticas

---

## 🧪 TESTING DE LA FASE 1

### Test 1: Login de Comercio
1. Ir a `/ingreso`
2. Ingresar credenciales de comercio
3. Verificar redirección a `/admin-panel`
4. Verificar que datos del comercio están disponibles
5. Recargar página
6. Verificar que sigue autenticado

### Test 2: Login de Super Admin
1. Ir a `/admin-login`
2. Ingresar credenciales de super admin
3. Verificar redirección a `/admin-supreme`
4. Verificar que datos del super admin están disponibles
5. Recargar página
6. Verificar que sigue autenticado

### Test 3: Rutas Protegidas
1. Sin estar autenticado, intentar acceder a `/admin-panel`
2. Verificar redirección a `/ingreso`
3. Sin estar autenticado, intentar acceder a `/admin-supreme`
4. Verificar redirección a `/admin-login`

### Test 4: Logout
1. Autenticarse como comercio
2. Hacer logout
3. Verificar que se limpia el token
4. Verificar redirección a página pública
5. Repetir con super admin

### Test 5: Separación de Roles
1. Autenticarse como super admin
2. Intentar acceder a `/admin-panel`
3. Verificar que NO puede acceder (debe redirigir)
4. Autenticarse como comercio
5. Intentar acceder a `/admin-supreme`
6. Verificar que NO puede acceder (debe redirigir)

---

## ✅ CRITERIOS DE ÉXITO

La Fase 1 se considera completada cuando:

- [x] **AuthContext refactorizado**
  - Estado separado para superAdmin y comercio
  - Funciones de login/logout separadas
  - Validación de tokens al cargar
  - Manejo de expiración

- [x] **Componentes de rutas protegidas creados**
  - `ProtectedCommerceRoute` funcional
  - `ProtectedSuperAdminRoute` funcional
  - Loading states implementados
  - Redirecciones correctas

- [x] **App.jsx actualizado**
  - Rutas protegidas implementadas
  - Rutas públicas accesibles
  - Navegación fluida

- [x] **Todos los tests pasados**
  - Login de comercio funciona
  - Login de super admin funciona
  - Rutas protegidas funcionan
  - Logout funciona
  - Roles están separados

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Token no se valida al recargar"
**Solución:** Verificar que `useEffect` en AuthContext se ejecute correctamente y que las funciones backend de validación existan.

### Problema 2: "Redirección infinita"
**Solución:** Asegurarse de que `isLoadingAuth` se setee a `false` después de validar tokens.

### Problema 3: "Super admin puede acceder a rutas de comercio"
**Solución:** Verificar que `ProtectedCommerceRoute` use `isCommerceAuthenticated` y NO `isSuperAdminAuthenticated`.

### Problema 4: "Tokens no se limpian al hacer logout"
**Solución:** Verificar que `localStorage.removeItem()` se llame en las funciones de logout.

---

## 📊 PROGRESO DE LA FASE

### Tarea 1.1: Refactorizar AuthContext
- [ ] Análisis del código actual
- [ ] Implementación de estado separado
- [ ] Implementación de funciones de login
- [ ] Implementación de funciones de logout
- [ ] Implementación de validación de tokens
- [ ] Testing

### Tarea 1.2: Crear ProtectedRoute
- [ ] Creación del archivo
- [ ] Implementación de ProtectedCommerceRoute
- [ ] Implementación de ProtectedSuperAdminRoute
- [ ] Testing

### Tarea 1.3: Actualizar App.jsx
- [ ] Importación de componentes
- [ ] Protección de rutas
- [ ] Testing de navegación

---

## 🎯 PRÓXIMOS PASOS

Una vez completada la Fase 1:

1. **Commit y Push**
   ```powershell
   git add .
   git commit -m "Fase 1 completada: Autenticación y Contexto refactorizado"
   git push origin feature/auth-refactor
   ```

2. **Crear Pull Request**
   - Revisar cambios
   - Solicitar code review
   - Mergear a main

3. **Comenzar Fase 2: Clientes API**
   - Crear clientes API estandarizados
   - Implementar manejo de errores
   - Normalizar comunicación frontend-backend

---

**📌 NOTA:** Consulta [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) para detalles completos de todas las fases.
