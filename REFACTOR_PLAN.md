# Plan de Refactorización: Arquitectura Profesional "Database as Truth"

## Objetivo
Unificar la gestión de estado y autenticación, eliminando `localStorage` como fuente de verdad y estableciendo la Base de Datos (Base44 Auth + Entities) como la única autoridad.

## Diagnóstico Actual
1. **Recursos Mezclados**: Se usa `localStorage` ('comercio_session') para el Admin de Comercios, pero `AuthContext` para otras cosas.
2. **Identidad Débil**: Los comercios son entidades en la DB, pero no tienen un usuario de autenticación real asociado, lo que obliga a "simular" el login.
3. **AdminPanel Roto**: Intenta consumir funciones que esperan contexto (`obtenerDatosComercio`), pero no recibe las credenciales correctas.

## Hoja de Ruta (Step-by-Step)

### FASE 1: Definición del Modelo de Datos (Core)
*Objetivo: Que cada Comercio tenga una identidad real.*

1. **Estandarizar Entidad Comercio**: Asegurar que cada registro de comercio tenga un `owner_id` (ID de usuario de Auth) o credenciales seguras.
2. **Validación de Unicidad**: Asegurar que `commerce_code` y `email` sean únicos en la DB.

### FASE 2: Backend - Autenticación Robusta (Functions)
*Objetivo: Que el login valide contra la DB y devuelva credenciales reales, no JSON plano.*

1. **Refactorizar `functions/loginComercio.ts`**:
   - Validar credenciales contra la colección `Comercio`.
   - **CRÍTICO**: Generar/Devolver un token de sesión válido o usar el sistema de usuarios de Base44.
   - *Propuesta*: Migrar el login de comercio para que use el sistema nativo de usuarios (`base44.auth.login`), vinculando el usuario al comercio.

2. **Refactorizar `functions/obtenerDatosComercio.ts`**:
   - Dejar de depender de parámetros en el body.
   - Leer el `user_id` directamente del token de autorización (contexto de seguridad).

### FASE 3: Frontend - AuthContext Unificado
*Objetivo: Que el frontend tenga un solo "cerebro" de seguridad.*

1. **Actualizar `AuthContext.jsx`**:
   - Integrar la detección de usuario de comercio.
   - Si el usuario es un comercio, cargar su perfil de comercio automáticamente en `user.commerce`.
   - Exponer métodos claros: `loginComercio`, `logout`, `user`, `isCommerce`.

2. **Limpiar `localStorage`**:
   - Eliminar manualmente los sets/gets de `comercio_session`.
   - Dejar que `AuthContext` persista la sesión (vía SDK o cookies seguras).

### FASE 4: Componentes Críticos
*Objetivo: Conectar la UI a la nueva verdad.*

1. **`LoginModal.jsx`**:
   - Conectar a la nueva función de login.
   - Al recibir OK, actualizar el `AuthContext` inmediatamente.
   - Redirigir al panel.

2. **`AdminPanel.jsx`**:
   - Eliminar `useEffect` de carga manual.
   - Usar `const { user, loading } = useAuth()`.
   - Si `user.commerce` existe, mostrar el panel. Si no, redirigir.

3. **`Layout.jsx`**:
   - Renderizado condicional basado en `AuthContext`.

## Paso Inicial Recomendado
**Refactorizar `functions/loginComercio.ts` y `functions/obtenerDatosComercio.ts`**.
Es la base. Si el backend no devuelve la verdad de forma segura, el frontend seguirá usando parches.

¿Procedemos con la FASE 2 (Backend)?
