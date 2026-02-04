**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

# 🛍️ Plataforma Multi-Tenant de E-Commerce

> **Socio Tecnológico para Comercios**  
> Automatización de Marketing + IA + Meta Ads Integration

---

## 🎯 Descripción del Proyecto

Plataforma SaaS multi-tenant donde cada comercio puede:
- 📦 Publicar y gestionar su catálogo de productos
- 🤖 Automatizar estrategias de marketing con IA
- 📊 Conectarse con Meta Ads para optimizar rendimientos
- 💰 Gestionar ventas, leads y estadísticas en tiempo real
- 🎯 Maximizar conversiones con tracking avanzado

---

## 👥 Tipos de Usuarios

| Usuario | Descripción | Acceso |
|---------|-------------|--------|
| **Usuario Supremo** | Administrador de la plataforma | Panel de gestión global |
| **Usuario Comercio** | Dueño de tienda | Panel de administración de su tienda |
| **Usuario Cliente** | Comprador final | Tienda pública (sin login) |

---

## 🚀 Estado Actual

### ✅ Completado
- [x] Proceso de curado (9 funciones obsoletas eliminadas)
- [x] Documentación completa de arquitectura
- [x] Definición de entidades (14 entidades documentadas)
- [x] Plan de implementación detallado
- [x] ~30 funciones backend operativas
- [x] Sistema de tracking de eventos
- [x] Integración con Meta CAPI

### 🔄 En Progreso
- [ ] Normalización de autenticación
- [ ] Estandarización de validaciones
- [ ] Separación completa de roles

### ⏳ Pendiente
- [ ] Sistema de pagos (plataforma y comercios)
- [ ] Integración con correo/logística de envíos
- [ ] Optimización de UX comercio y cliente
- [ ] Agente de IA completo

---

## 📚 Documentación

### 🎯 Inicio Rápido
1. **Nuevos en el proyecto:** [`INDICE_DOCUMENTACION.md`](./INDICE_DOCUMENTACION.md)
2. **Vista general:** [`RESUMEN_EJECUTIVO.md`](./RESUMEN_EJECUTIVO.md)
3. **Arquitectura:** [`ARQUITECTURA.md`](./ARQUITECTURA.md)

### 📖 Documentos Principales

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| [`INDICE_DOCUMENTACION.md`](./INDICE_DOCUMENTACION.md) | Índice de toda la documentación | Todos |
| [`RESUMEN_EJECUTIVO.md`](./RESUMEN_EJECUTIVO.md) | Estado actual y próximos pasos | Todos |
| [`ENTITIES_SCHEMA.md`](./ENTITIES_SCHEMA.md) | Fuente única de verdad de datos | Desarrolladores |
| [`ARQUITECTURA.md`](./ARQUITECTURA.md) | Estándares y reglas | Desarrolladores |
| [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) | Roadmap de implementación | Dev + PM |
| [`ANALISIS_FUNCIONES.md`](./ANALISIS_FUNCIONES.md) | Análisis de funciones | Desarrolladores |

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **State Management:** React Query (TanStack Query)
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast

### Backend
- **Platform:** Base44 (BaaS)
- **Runtime:** Deno (Edge Functions)
- **SDK:** @base44/sdk
- **Database:** Base44 Entities (NoSQL)

### Integraciones
- **Meta Ads:** Conversions API (CAPI)
- **Analytics:** Tracking de eventos personalizado
- **Payments:** Mercado Pago + Transferencia (en desarrollo)

---

## 🏗️ Estructura del Proyecto

```
.
├── 📁 functions/              # Backend (Base44 Functions)
│   ├── 📁 _core/              # Utilidades compartidas
│   ├── utilsCrypto.ts         # Criptografía (SHA-256, hashing)
│   ├── utilsValidation.ts     # Validaciones (teléfono, email)
│   └── ... (51 funciones)
│
├── 📁 src/                    # Frontend (React)
│   ├── 📁 api/                # Clientes API
│   ├── 📁 components/         # Componentes React
│   ├── 📁 pages/              # Páginas principales
│   ├── 📁 lib/                # Librerías y contextos
│   └── 📁 utils/              # Utilidades frontend
│
└── 📁 docs/                   # Documentación (archivos .md)
```

---

## 🚦 Cómo Empezar

### 1. Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd "Nueva carpeta (4)"

# Instalar dependencias
npm install
```

### 2. Configuración

```bash
# Copiar variables de entorno
cp .env.example .env

# Configurar Base44 credentials
# APP_ID=tu_app_id
# API_KEY=tu_api_key
```

### 3. Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

### 4. Leer Documentación

```bash
# Comenzar por el índice
cat INDICE_DOCUMENTACION.md

# O abrir en tu editor favorito
code INDICE_DOCUMENTACION.md
```

---

## 🔐 Autenticación

### Usuario Comercio
- **Registro:** `/registro`
- **Login:** `/ingreso`
- **Panel:** `/admin-panel`

### Usuario Supremo
- **Login:** `/admin-login` (botón oculto)
- **Panel:** `/admin-supreme`

### Usuario Cliente
- **Tienda:** `/tienda/:commerce_code`
- **Checkout:** `/checkout`
- **Sin autenticación requerida**

---

## 📊 Entidades Principales

| Entidad | Descripción |
|---------|-------------|
| **Comercio** | Tiendas registradas |
| **Producto** | Catálogo de productos |
| **Orden** | Órdenes de compra |
| **Cliente** | Clientes de tiendas |
| **Lead** | Contactos/Leads |
| **Sorteo** | Sorteos/Concursos |
| **EventoMeta** | Eventos Meta CAPI |

Ver [`ENTITIES_SCHEMA.md`](./ENTITIES_SCHEMA.md) para detalles completos.

---

## 🎯 Roadmap

### Fase 1: Autenticación (2-3 días) 🔄
- Refactorizar AuthContext
- Crear rutas protegidas
- Separar roles completamente

### Fase 2: Clientes API (1-2 días) ⏳
- Normalizar clientes HTTP
- Eliminar fetch() directo
- Centralizar manejo de errores

### Fase 3: Backend (3-4 días) ⏳
- Normalizar funciones
- Implementar validaciones
- Estandarizar commerce_code

### Fase 4: Frontend (3-4 días) ⏳
- Normalizar componentes
- Estandarizar estados
- Mejorar UX

### Fase 5: Testing (2-3 días) ⏳
- Probar flujos completos
- Validar seguridad
- Corregir bugs

### Fase 6: Optimización (2-3 días) ⏳
- Optimizar rendimiento
- Mejorar UX
- Documentar código

**Duración total estimada:** 2.5-4 semanas

Ver [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) para detalles.

---

## 🤝 Contribuir

### Antes de Contribuir
1. Lee [`INDICE_DOCUMENTACION.md`](./INDICE_DOCUMENTACION.md)
2. Revisa [`ARQUITECTURA.md`](./ARQUITECTURA.md)
3. Consulta [`ENTITIES_SCHEMA.md`](./ENTITIES_SCHEMA.md)

### Estándares de Código
- Seguir plantillas de [`ARQUITECTURA.md`](./ARQUITECTURA.md)
- Validar en backend, mostrar en frontend
- Usar `commerce_code` como identificador estándar
- Documentar cambios importantes

### Proceso
1. Crear branch desde `main`
2. Implementar cambios siguiendo estándares
3. Probar localmente
4. Actualizar documentación si es necesario
5. Crear Pull Request

---

## 📝 Notas Importantes

### Nomenclatura Estándar
- ✅ **Usar:** `commerce_code` (identificador principal)
- ✅ **Aceptable:** `id_comercio` (campo adicional)
- ❌ **Evitar:** `commerceCode`, `merchant_id`, variaciones

### Validaciones
- **Frontend:** Validar formato (UX)
- **Backend:** Validar seguridad y negocio (SIEMPRE)

### Seguridad
- Passwords hasheados con SHA-256 + salt
- JWT tokens con expiración
- Validación de permisos por commerce_code
- Sanitización de inputs

---

## 📞 Soporte

### Documentación
- Consultar [`INDICE_DOCUMENTACION.md`](./INDICE_DOCUMENTACION.md) primero
- Revisar código existente similar
- Buscar en documentación técnica

### Problemas
- Verificar configuración
- Reproducir el problema
- Documentar pasos
- Crear issue con detalles

---

## 📄 Licencia

[Definir licencia]

---

## 🎉 Agradecimientos

Proyecto en desarrollo activo. Documentación completa disponible en archivos `.md` del proyecto.

**Última actualización:** 2026-02-03
