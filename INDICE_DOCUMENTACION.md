# 📖 ÍNDICE DE DOCUMENTACIÓN DEL PROYECTO

> **Centro de Documentación Técnica**  
> Última actualización: 2026-02-04

---

## 🎯 INICIO RÁPIDO

### Para Desarrolladores Nuevos
1. Lee primero: [`RESUMEN_EJECUTIVO.md`](./RESUMEN_EJECUTIVO.md)
2. Luego: [`ARQUITECTURA.md`](./ARQUITECTURA.md)
3. Consulta: [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) para código
4. Finalmente: [`ENTITIES_SCHEMA.md`](./ENTITIES_SCHEMA.md)

### Para Continuar el Desarrollo
1. Revisa: [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md)
2. Consulta: [`VALIDACIONES.md`](./VALIDACIONES.md) al implementar
3. Usa: [`RELACIONES_ENTIDADES.md`](./RELACIONES_ENTIDADES.md) para queries
4. Sigue: [`ARQUITECTURA.md`](./ARQUITECTURA.md) para estándares

---

## 📚 DOCUMENTOS PRINCIPALES

### 1. [`RESUMEN_EJECUTIVO.md`](./RESUMEN_EJECUTIVO.md)
**Propósito:** Vista general del estado del proyecto  
**Audiencia:** Todos  
**Contenido:**
- Logros del día
- Estado actual del proyecto
- Próximos pasos recomendados
- Métricas del proyecto
- Puntos críticos identificados

**Cuándo leer:**
- ✅ Al comenzar a trabajar en el proyecto
- ✅ Para entender el estado actual
- ✅ Para decidir qué hacer a continuación

---

### 2. [`ENTITIES_SCHEMA.md`](./ENTITIES_SCHEMA.md)
**Propósito:** Fuente única de verdad para esquemas de datos  
**Audiencia:** Desarrolladores  
**Contenido:**
- 14 entidades completamente documentadas
- Interfaces TypeScript para cada entidad
- Campos estándar y sus tipos
- Relaciones entre entidades
- Tabla resumen de entidades

**Cuándo consultar:**
- ✅ Al crear nuevas funciones backend
- ✅ Al trabajar con datos en frontend
- ✅ Al diseñar nuevas features
- ✅ Al debuggear problemas de datos

**Entidades documentadas:**
1. Comercio
2. Producto
3. AtributoProducto
4. Orden
5. Cliente
6. Lead
7. Sorteo
8. ConfiguracionComercio
9. EventoMeta
10. GastoPublicitario
11. ConfiguracionGlobal
12. Cupon
13. TrackingEvent
14. SuperAdmin

---

### 3. [`ARQUITECTURA.md`](./ARQUITECTURA.md)
**Propósito:** Definir estándares y reglas de la aplicación  
**Audiencia:** Desarrolladores  
**Contenido:**
- Contexto del proyecto
- Sistema de autenticación (3 tipos de usuarios)
- Sistema de rutas y navegación
- Sistema de comunicación Frontend ↔ Backend
- Sistema de validaciones
- Estándares de código
- Flujos principales
- Checklist de normalización

**Cuándo consultar:**
- ✅ Al implementar autenticación
- ✅ Al crear nuevas rutas
- ✅ Al escribir funciones backend
- ✅ Al crear componentes frontend
- ✅ Al implementar validaciones

**Secciones clave:**
- **Sistema de Autenticación:** Cómo funcionan los 3 tipos de usuarios
- **Sistema de Rutas:** Rutas públicas vs protegidas
- **Comunicación Frontend ↔ Backend:** Clientes API estandarizados
- **Sistema de Validaciones:** Frontend muestra, Backend valida
- **Estándares de Código:** Plantillas y nomenclatura

---

### 4. [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md)
**Propósito:** Roadmap detallado de reconstrucción  
**Audiencia:** Desarrolladores y Project Managers  
**Contenido:**
- 6 fases de implementación
- Tareas detalladas con checklist
- Cronograma estimado
- Métricas de éxito
- Riesgos y mitigación
- Próximos pasos inmediatos

**Cuándo consultar:**
- ✅ Al planificar el trabajo de la semana
- ✅ Al comenzar una nueva fase
- ✅ Para trackear progreso
- ✅ Para estimar tiempos

**Fases:**
1. **Fase 1:** Autenticación y Contexto (2-3 días)
2. **Fase 2:** Clientes API (1-2 días)
3. **Fase 3:** Normalización Backend (3-4 días)
4. **Fase 4:** Normalización Frontend (3-4 días)
5. **Fase 5:** Testing y Validación (2-3 días)
6. **Fase 6:** Optimización (2-3 días)

**Duración total:** 2.5-4 semanas

---

### 5. [`CAMBIOS_CRITICOS_MIGRACION.md`](./CAMBIOS_CRITICOS_MIGRACION.md)
**Propósito:** Documentar discrepancias y plan de migración  
**Audiencia:** Desarrolladores  
**Contenido:**
- Discrepancias críticas detectadas
- Plan de migración `commerce_code` → `id_comercio`
- Cambios en estructuras de datos
- Vulnerabilidades de seguridad
- Nuevas funcionalidades descubiertas

**Cuándo consultar:**
- ✅ Antes de comenzar la migración
- ✅ Al encontrar inconsistencias en el código
- ✅ Para entender cambios críticos
- ✅ Para planificar refactorización

---

### 6. [`VALIDACIONES.md`](./VALIDACIONES.md)
**Propósito:** Fuente única de verdad para validaciones  
**Audiencia:** Desarrolladores  
**Contenido:**
- Formatos estándar (teléfono, email, DNI, CUIT, etc.)
- Validaciones por entidad (14 entidades)
- Reglas de negocio
- Validaciones de seguridad
- Mensajes de error estandarizados

**Cuándo consultar:**
- ✅ Al implementar formularios
- ✅ Al validar datos en backend
- ✅ Al mostrar mensajes de error
- ✅ Al crear nuevas entidades

**Secciones clave:**
- **Formatos Estándar:** Regex y funciones de validación
- **Validaciones por Entidad:** Reglas específicas para cada entidad
- **Reglas de Negocio:** Lógica de validación compleja
- **Mensajes de Error:** Textos estandarizados para el usuario

---

### 7. [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md)
**Propósito:** Códigos útiles y patrones del SDK Base44  
**Audiencia:** Desarrolladores  
**Contenido:**
- Cliente Base44 (frontend, backend, externo)
- Autenticación completa (login, registro, OAuth, OTP)
- Entidades CRUD (list, filter, create, update, delete)
- Funciones backend (plantillas y ejemplos)
- Integraciones Core (IA, imágenes, archivos, emails)
- Agentes IA (conversaciones y mensajes)
- Conectores OAuth (Google, Slack, etc.)
- Analytics y App Logs
- Integraciones personalizadas
- Manejo de errores
- Patrones comunes
- Mejores prácticas

**Cuándo consultar:**
- ✅ Al usar el SDK de Base44
- ✅ Al implementar autenticación
- ✅ Al trabajar con entidades
- ✅ Al crear funciones backend
- ✅ Al integrar servicios externos
- ✅ Al implementar tracking de eventos

**Secciones clave:**
- **Cliente Base44:** Cómo inicializarlo en diferentes contextos
- **Autenticación:** Todos los métodos de auth disponibles
- **Entidades CRUD:** Operaciones completas con ejemplos
- **Integraciones:** IA, archivos, emails, OAuth
- **Mejores Prácticas:** Patrones optimizados y seguros

---

### 8. [`RELACIONES_ENTIDADES.md`](./RELACIONES_ENTIDADES.md)
**Propósito:** Mapa de conexiones entre entidades  
**Audiencia:** Desarrolladores  
**Contenido:**
- Diagrama visual de relaciones
- Campos clave de relación (id_comercio, id_cliente, id_producto)
- 12 queries comunes optimizados
- Estrategias de carga (Eager vs Lazy)
- Optimizaciones de performance
- Reglas de Cascade Delete
- Reglas de integridad referencial

**Cuándo consultar:**
- ✅ Al diseñar queries complejas
- ✅ Al trabajar con datos relacionados
- ✅ Al optimizar performance
- ✅ Al implementar eliminación de registros
- ✅ Al entender el modelo de datos

**Queries documentados:**
1. Obtener productos de un comercio
2. Obtener configuración de un comercio
3. Obtener órdenes de un cliente
4. Obtener orden completa con productos
5. Obtener cliente con historial
6. Obtener producto con atributos y reseñas
7. Obtener carrito activo
8. Obtener leads recientes
9. Obtener cupones activos
10. Obtener eventos Meta de una orden
11. Obtener gastos publicitarios del mes
12. Obtener logs de configuración

---

### 9. [`ANALISIS_FUNCIONES.md`](./ANALISIS_FUNCIONES.md)
**Propósito:** Análisis de funciones activas vs obsoletas  
**Audiencia:** Desarrolladores  
**Contenido:**
- Lista de funciones activas (~30)
- Lista de funciones inactivas (~21)
- Proceso de curado completado
- Funciones eliminadas (9)

**Cuándo consultar:**
- ✅ Para saber qué funciones están en uso
- ✅ Para evitar usar funciones obsoletas
- ✅ Para entender el proceso de curado

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

```
Nueva carpeta (4)/
│
├── 📄 README.md                       # Introducción al proyecto
├── 📄 INDICE_DOCUMENTACION.md         # Este archivo - Punto de entrada
├── 📄 RESUMEN_EJECUTIVO.md            # Vista general del estado
│
├── 📁 Documentación de Datos
│   ├── 📄 ENTITIES_SCHEMA.md          # ⭐ Fuente única de verdad de datos
│   ├── 📄 RELACIONES_ENTIDADES.md     # ⭐ Mapa de conexiones y queries
│   └── 📄 VALIDACIONES.md             # ⭐ Reglas de validación
│
├── 📁 Documentación de Arquitectura
│   ├── 📄 ARQUITECTURA.md             # Estándares y reglas
│   ├── 📄 BASE44_SNIPPETS.md          # ⭐ Códigos útiles del SDK
│   └── 📄 CAMBIOS_CRITICOS_MIGRACION.md # Plan de migración
│
├── 📁 Documentación de Proyecto
│   ├── 📄 PLAN_IMPLEMENTACION.md      # Roadmap de implementación
│   ├── 📄 INICIO_FASE_1.md            # ⭐ Guía para comenzar Fase 1
│   └── 📄 ANALISIS_FUNCIONES.md       # Análisis de funciones
│
├── 📁 functions/                      # Funciones backend (Base44)
│   ├── 📁 _core/                      # Utilidades compartidas
│   ├── 📁 _templates/                 # Plantillas de funciones
│   ├── 📄 utilsCrypto.ts              # Utilidades de criptografía
│   ├── 📄 utilsValidation.ts          # Utilidades de validación
│   └── ... (51 funciones)
│
├── 📁 src/                            # Código frontend
│   ├── 📁 api/                        # Clientes API
│   │   ├── 📄 base44Client.js         # Cliente público
│   │   ├── 📄 commerceApiClient.js    # Cliente autenticado (comercio)
│   │   └── 📄 superAdminClient.js     # Cliente super admin
│   │
│   ├── 📁 components/                 # Componentes React
│   │   ├── 📁 admin/                  # Componentes de admin panel
│   │   └── 📁 ui/                     # Componentes UI reutilizables
│   │
│   ├── 📁 pages/                      # Páginas principales
│   │   ├── 📄 Home.jsx                # Landing/Tienda
│   │   ├── 📄 AdminPanel.jsx          # Panel de comercio
│   │   ├── 📄 AdminSupremePanel.jsx   # Panel de super admin
│   │   └── ...
│   │
│   ├── 📁 lib/                        # Librerías y contextos
│   │   ├── 📄 AuthContext.jsx         # Contexto de autenticación
│   │   └── ...
│   │
│   └── 📁 utils/                      # Utilidades frontend
│
└── 📁 scripts/                        # Scripts de desarrollo
```

---

## 🔍 GUÍA DE BÚSQUEDA RÁPIDA

### "¿Cómo implemento autenticación?"
→ Lee [`ARQUITECTURA.md`](./ARQUITECTURA.md) sección "Sistema de Autenticación"  
→ Consulta [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) sección "Autenticación"

### "¿Qué campos tiene la entidad Producto?"
→ Consulta [`ENTITIES_SCHEMA.md`](./ENTITIES_SCHEMA.md) sección "Producto"

### "¿Cómo valido un email/teléfono/DNI?"
→ Consulta [`VALIDACIONES.md`](./VALIDACIONES.md) sección "Formatos Estándar"

### "¿Cómo obtengo órdenes de un cliente?"
→ Consulta [`RELACIONES_ENTIDADES.md`](./RELACIONES_ENTIDADES.md) query #3

### "¿Cómo uso el SDK de Base44?"
→ Consulta [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) para ejemplos completos

### "¿Qué debo hacer esta semana?"
→ Revisa [`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) y el cronograma

### "¿Cuál es el estado actual del proyecto?"
→ Lee [`RESUMEN_EJECUTIVO.md`](./RESUMEN_EJECUTIVO.md)

### "¿Qué funciones backend existen?"
→ Consulta [`ANALISIS_FUNCIONES.md`](./ANALISIS_FUNCIONES.md)

### "¿Cómo escribo una función backend?"
→ Lee [`ARQUITECTURA.md`](./ARQUITECTURA.md) sección "Estructura de Funciones Backend"  
→ Consulta [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) sección "Funciones Backend"

### "¿Cómo creo un componente de admin?"
→ Lee [`ARQUITECTURA.md`](./ARQUITECTURA.md) sección "Estructura de Componentes Frontend"

### "¿Qué validaciones debo implementar?"
→ Lee [`VALIDACIONES.md`](./VALIDACIONES.md) para la entidad específica

### "¿Cómo optimizo mis queries?"
→ Consulta [`RELACIONES_ENTIDADES.md`](./RELACIONES_ENTIDADES.md) sección "Optimizaciones"

### "¿Cuáles son los cambios críticos?"
→ Lee [`CAMBIOS_CRITICOS_MIGRACION.md`](./CAMBIOS_CRITICOS_MIGRACION.md)

### "¿Cómo trackeo eventos de analytics?"
→ Consulta [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) sección "Analytics"

### "¿Cómo subo archivos con IA?"
→ Consulta [`BASE44_SNIPPETS.md`](./BASE44_SNIPPETS.md) sección "Integraciones"

---

## 📋 CHECKLIST DE ONBOARDING

Para nuevos desarrolladores que se unan al proyecto:

### Día 1: Entender el Contexto
- [ ] Leer `RESUMEN_EJECUTIVO.md` completo
- [ ] Leer `ARQUITECTURA.md` sección "Contexto del Proyecto"
- [ ] Revisar estructura de archivos
- [ ] Configurar ambiente de desarrollo

### Día 2: Profundizar en Arquitectura
- [ ] Leer `ARQUITECTURA.md` completo
- [ ] Entender los 3 tipos de usuarios
- [ ] Entender el sistema de autenticación
- [ ] Revisar flujos principales

### Día 3: Familiarizarse con Datos
- [ ] Leer `ENTITIES_SCHEMA.md` completo
- [ ] Entender relaciones entre entidades
- [ ] Revisar funciones backend existentes
- [ ] Probar queries en Base44

### Día 4: Prepararse para Desarrollar
- [ ] Leer `PLAN_IMPLEMENTACION.md`
- [ ] Entender la fase actual
- [ ] Revisar tareas pendientes
- [ ] Elegir primera tarea

### Día 5: Primera Contribución
- [ ] Implementar tarea pequeña
- [ ] Seguir estándares de código
- [ ] Hacer PR para revisión
- [ ] Recibir feedback

---

## 🔄 MANTENIMIENTO DE DOCUMENTACIÓN

### Cuándo Actualizar

**`ENTITIES_SCHEMA.md`:**
- ✅ Al agregar nueva entidad
- ✅ Al modificar campos de entidad existente
- ✅ Al cambiar relaciones entre entidades

**`ARQUITECTURA.md`:**
- ✅ Al cambiar sistema de autenticación
- ✅ Al agregar nuevas rutas
- ✅ Al cambiar estándares de código
- ✅ Al modificar flujos principales

**`PLAN_IMPLEMENTACION.md`:**
- ✅ Al completar una fase
- ✅ Al completar tareas importantes
- ✅ Al cambiar prioridades
- ✅ Al ajustar cronograma

**`RESUMEN_EJECUTIVO.md`:**
- ✅ Al final de cada día de trabajo
- ✅ Al completar hitos importantes
- ✅ Al cambiar estado del proyecto

---

## 💡 MEJORES PRÁCTICAS

### Al Escribir Código
1. ✅ Consultar `ENTITIES_SCHEMA.md` para nombres de campos
2. ✅ Seguir plantillas de `ARQUITECTURA.md`
3. ✅ Validar en backend según estándares
4. ✅ Usar clientes API estandarizados

### Al Hacer Cambios
1. ✅ Actualizar documentación relevante
2. ✅ Seguir checklist de la fase actual
3. ✅ Probar cambios antes de commit
4. ✅ Documentar decisiones importantes

### Al Resolver Problemas
1. ✅ Consultar documentación primero
2. ✅ Verificar que sigues estándares
3. ✅ Revisar funciones similares existentes
4. ✅ Documentar solución si es nueva

---

## 📞 CONTACTO Y SOPORTE

### Para Preguntas Técnicas
- Consultar documentación primero
- Revisar código existente similar
- Preguntar en canal de desarrollo

### Para Reportar Problemas
- Verificar que no es un problema de configuración
- Reproducir el problema
- Documentar pasos para reproducir
- Crear issue con detalles

---

## 🎯 OBJETIVOS DEL PROYECTO

### Corto Plazo (1 mes)
- ✅ Completar Fase 0: Documentación
- 🔄 Completar Fase 1: Autenticación
- 🔄 Completar Fase 2: Clientes API
- ⏳ Completar Fase 3: Backend

### Mediano Plazo (2-3 meses)
- ⏳ Completar todas las fases
- ⏳ Testing exhaustivo
- ⏳ Deployment a producción
- ⏳ Onboarding de primeros comercios

### Largo Plazo (6 meses)
- ⏳ Integración con Meta Ads completa
- ⏳ Agente de IA implementado
- ⏳ Sistema de pagos integrado
- ⏳ Logística de envíos integrada

---

**📌 ESTE DOCUMENTO ES EL PUNTO DE ENTRADA A TODA LA DOCUMENTACIÓN DEL PROYECTO**

Mantenlo actualizado y úsalo como referencia constante.
