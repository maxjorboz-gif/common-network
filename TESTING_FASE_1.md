# 🧪 GUÍA DE TESTING - FASE 1

> **Fecha:** 2026-02-04  
> **Objetivo:** Validar autenticación de Super Admin y rutas protegidas

---

## 📋 PRE-REQUISITOS

### 1. Instalar Dependencias
```powershell
npm install
```

### 2. Iniciar Servidor de Desarrollo
```powershell
npm run dev
```

### 3. Crear Super Admin en Base44

Antes de hacer testing, necesitas crear un Super Admin en la entidad `SuperAdmin` de Base44:

**Opción A: Desde el panel de Base44**
1. Ir a https://app.base44.com
2. Navegar a la entidad `SuperAdmin`
3. Crear un nuevo registro:
   ```json
   {
     "email": "admin@test.com",
     "password": "admin123",
     "nombre": "Super Admin Test",
     "estado": "activo",
     "permisos": ["all"]
   }
   ```

**Opción B: Crear función de seed**
Crear `functions/seedSuperAdmin.ts`:
```typescript
import { createClientFromRequest } from "npm:@base44/sdk";
import { crypto } from "jsr:@std/crypto";

const PASSWORD_SALT = "v4_SUPER_SECRET_SALT_2026_PROTECT_BASE44_SYSTEM_#99282";

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const adminClient = base44.asServiceRole;

    const passwordHash = await hashPassword("admin123");

    const superAdmin = await adminClient.entities.SuperAdmin.create({
        email: "admin@test.com",
        password_hash: passwordHash,
        nombre: "Super Admin Test",
        estado: "activo",
        permisos: ["all"],
        creado_en: new Date().toISOString()
    });

    return Response.json({
        success: true,
        message: "Super Admin creado exitosamente",
        superAdmin: {
            id: superAdmin.id,
            email: superAdmin.email,
            nombre: superAdmin.nombre
        }
    });
});
```

---

## 🧪 TESTS A REALIZAR

### ✅ TEST 1: Acceso a Página de Login

**Pasos:**
1. Abrir navegador
2. Ir a `http://localhost:5173/admin-login`
3. Verificar que la página carga correctamente

**Resultado esperado:**
- ✅ Página de login con diseño premium (fondo púrpura con animaciones)
- ✅ Formulario con campos de email y contraseña
- ✅ Botón "Iniciar Sesión"

**Screenshot esperado:**
- Fondo degradado púrpura/índigo
- Card blanco centrado
- Icono de candado en la parte superior
- Título "Super Admin"

---

### ✅ TEST 2: Login con Credenciales Inválidas

**Pasos:**
1. En `/admin-login`
2. Ingresar email: `wrong@test.com`
3. Ingresar password: `wrongpass`
4. Click en "Iniciar Sesión"

**Resultado esperado:**
- ✅ Mensaje de error: "Credenciales inválidas"
- ✅ No redirige a ninguna página
- ✅ Formulario permanece visible

---

### ✅ TEST 3: Login con Credenciales Válidas

**Pasos:**
1. En `/admin-login`
2. Ingresar email: `admin@test.com`
3. Ingresar password: `admin123`
4. Click en "Iniciar Sesión"

**Resultado esperado:**
- ✅ Loading spinner aparece brevemente
- ✅ Redirección automática a `/admin-supreme`
- ✅ Token guardado en localStorage (`superadmin_token`)
- ✅ Datos del super admin guardados en localStorage (`superadmin_data`)

**Verificar en DevTools (Console):**
```javascript
localStorage.getItem('superadmin_token')
// Debe retornar un token base64

localStorage.getItem('superadmin_data')
// Debe retornar JSON con datos del admin
```

---

### ✅ TEST 4: Protección de Ruta `/admin-supreme`

**Pasos:**
1. Abrir navegador en modo incógnito (sin sesión)
2. Ir directamente a `http://localhost:5173/admin-supreme`

**Resultado esperado:**
- ✅ Loading spinner aparece brevemente
- ✅ Redirección automática a `/admin-login`
- ✅ NO se muestra el contenido de AdminSupremePanel

---

### ✅ TEST 5: Persistencia de Sesión

**Pasos:**
1. Login exitoso en `/admin-login`
2. Verificar redirección a `/admin-supreme`
3. Recargar la página (F5)

**Resultado esperado:**
- ✅ Loading spinner aparece brevemente
- ✅ Sesión se mantiene
- ✅ NO redirige a login
- ✅ Contenido de `/admin-supreme` se muestra correctamente

**Verificar en Network (DevTools):**
- Debe haber una llamada a `validarSuperAdmin` con el token
- La respuesta debe ser `{ success: true, valid: true, superAdmin: {...} }`

---

### ✅ TEST 6: Logout de Super Admin

**Pasos:**
1. Estando autenticado en `/admin-supreme`
2. Buscar botón de logout (si existe en AdminSupremePanel)
3. Click en logout

**Resultado esperado:**
- ✅ Token eliminado de localStorage
- ✅ Datos eliminados de localStorage
- ✅ Redirección a `/` (home)

**Verificar en DevTools:**
```javascript
localStorage.getItem('superadmin_token')
// Debe retornar null

localStorage.getItem('superadmin_data')
// Debe retornar null
```

---

### ✅ TEST 7: Separación de Roles (Super Admin vs Commerce)

**Pasos:**
1. Login como Super Admin
2. Intentar acceder a `/adminpanel` (panel de comercio)

**Resultado esperado:**
- ✅ Redirección a `/ingreso` (login de comercio)
- ✅ NO puede acceder al panel de comercio

**Pasos inversos:**
1. Logout de Super Admin
2. Login como Comercio (si existe)
3. Intentar acceder a `/admin-supreme`

**Resultado esperado:**
- ✅ Redirección a `/admin-login`
- ✅ NO puede acceder al panel de super admin

---

### ✅ TEST 8: Expiración de Token

**Pasos:**
1. Login exitoso
2. Abrir DevTools > Application > Local Storage
3. Copiar el token de `superadmin_token`
4. Decodificar el token (base64)
5. Verificar el timestamp

**Resultado esperado:**
- Token debe tener formato: `superadmin:{id}:{timestamp}:{firma}`
- Timestamp debe ser reciente (menos de 24 horas)

**Para simular expiración:**
1. Modificar manualmente el timestamp en el token (poner uno de hace 25 horas)
2. Recargar la página

**Resultado esperado:**
- ✅ Validación falla
- ✅ Token eliminado
- ✅ Redirección a `/admin-login`

---

### ✅ TEST 9: Token Inválido/Corrupto

**Pasos:**
1. Abrir DevTools > Application > Local Storage
2. Modificar `superadmin_token` a un valor aleatorio: `"abc123invalid"`
3. Recargar la página

**Resultado esperado:**
- ✅ Validación falla
- ✅ Token eliminado
- ✅ Redirección a `/admin-login`
- ✅ No hay errores en consola (manejo graceful)

---

### ✅ TEST 10: Migración Automática de Password

**Pasos:**
1. Crear Super Admin con password en texto plano:
   ```json
   {
     "email": "admin2@test.com",
     "password": "plaintext123",
     "nombre": "Admin Legacy",
     "estado": "activo"
   }
   ```
2. Login con esas credenciales
3. Verificar en Base44 que el registro se actualizó

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Campo `password` eliminado (null)
- ✅ Campo `password_hash` creado con hash SHA-256
- ✅ Campo `migracion_seguridad` con timestamp

---

## 📊 CHECKLIST DE VALIDACIÓN

### Funcionalidad
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas muestra error
- [ ] Redirección a `/admin-supreme` después de login
- [ ] Protección de ruta `/admin-supreme` funciona
- [ ] Persistencia de sesión al recargar página
- [ ] Logout limpia tokens y redirige
- [ ] Separación de roles (Super Admin ≠ Commerce)
- [ ] Expiración de token funciona
- [ ] Manejo de tokens inválidos/corruptos
- [ ] Migración automática de passwords

### UI/UX
- [ ] Página de login tiene diseño premium
- [ ] Loading states se muestran correctamente
- [ ] Mensajes de error son claros
- [ ] Animaciones funcionan suavemente
- [ ] Responsive design (mobile, tablet, desktop)

### Seguridad
- [ ] Passwords se hashean con SHA-256
- [ ] Tokens tienen firma criptográfica
- [ ] Tokens expiran después de 24 horas
- [ ] No se pueden manipular tokens
- [ ] Delay anti-timing en credenciales inválidas

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Cannot find module 'react-router-dom'"
**Solución:**
```powershell
npm install react-router-dom
```

### Problema 2: "base44.functions.invoke is not a function"
**Solución:** Verificar que las funciones `loginSuperAdmin` y `validarSuperAdmin` estén desplegadas en Base44.

### Problema 3: "Token inválido" inmediatamente después de login
**Solución:** Verificar que `JWT_SECRET_SUPERADMIN` sea el mismo en ambas funciones (`loginSuperAdmin.ts` y `validarSuperAdmin.ts`).

### Problema 4: Redirección infinita
**Solución:** Verificar que `isLoadingSuperAdmin` se setee a `false` después de validar el token en `AuthContext.jsx`.

### Problema 5: "Super Admin no encontrado" en validación
**Solución:** Verificar que el ID del super admin en el token coincida con un registro existente en la entidad `SuperAdmin`.

---

## 📝 NOTAS PARA EL DESARROLLADOR

### Credenciales de Prueba
```
Email: admin@test.com
Password: admin123
```

### Endpoints de Backend
- `loginSuperAdmin` - Login de super admin
- `validarSuperAdmin` - Validación de token

### LocalStorage Keys
- `superadmin_token` - Token de autenticación
- `superadmin_data` - Datos del super admin (JSON)

### Rutas
- `/admin-login` - Login de super admin (pública)
- `/admin-supreme` - Panel de super admin (protegida)
- `/adminpanel` - Panel de comercio (protegida)

---

## ✅ CRITERIOS DE ÉXITO

El testing se considera exitoso cuando:

- [x] Todos los 10 tests pasan
- [x] No hay errores en consola
- [x] Tokens se generan y validan correctamente
- [x] Rutas protegidas funcionan
- [x] Separación de roles es efectiva
- [x] UI/UX es premium y fluida

---

**📌 NOTA:** Una vez completado el testing, documentar cualquier bug encontrado y proceder con la Fase 2.
