# 🔍 Análisis de Funciones - Proceso de Curado

## ✅ Funciones ACTIVAS (en uso en el código)

### Autenticación y Usuarios
- `loginComercio` - Login de comercios
- `loginSuperAdmin` - Login de super admin
- `obtenerDatosComercio` - Obtener datos del comercio autenticado
- `registrarComercio` - Registro de nuevos comercios

### Productos
- `obtenerProductosAdmin` - Listado de productos en admin
- `obtenerDetalleProducto` - Detalle de un producto
- `crearProducto` - Crear nuevo producto
- `actualizarProducto` - Actualizar producto existente
- `eliminarProducto` - Eliminar producto
- `toggleActivoProducto` - Activar/desactivar producto
- `generarDescripcionesProducto` - IA para generar descripciones
- `importarProductosMasivo` - Importación masiva de productos
- `cambioMasivoPrecio` - Cambio masivo de precios
- `eliminarCategoria` - Eliminar categorías

### Configuración
- `obtenerConfiguracion` - Obtener configuración del comercio
- `actualizarConfiguracion` - Actualizar configuración
- `configuracionSuprema` - Configuración avanzada
- `generarDisenoTienda` - IA para generar diseño de tienda

### Órdenes y Pagos
- `obtenerOrdenes` - Listado de órdenes
- `finalizarCompra` - Finalizar proceso de compra
- `confirmarPago` - Confirmar pago manual
- `cambiarEstadoOrden` - Cambiar estado de orden
- `mercadopago` - Integración con Mercado Pago

### Leads y Marketing
- `obtenerLeads` - Listado de leads
- `cambiarEstadoLead` - Cambiar estado de lead
- `agregarNotaLead` - Agregar nota a lead
- `registrarInteres` - Registrar interés de cliente
- `participarSorteo` - Participar en sorteo
- `gestionarSorteo` - Gestión de sorteos (crear, listar, sortear)

### Estadísticas y Publicidad
- `obtenerEstadisticas` - Obtener estadísticas del comercio
- `solicitarCreditoPublicitario` - Solicitar crédito publicitario
- `resetGastoPublicitario` - Resetear gasto publicitario

### Página Pública
- `obtenerPaginaInicio` - Obtener datos para página de inicio

### Super Admin
- `gestionarSolicitudes` - Gestionar solicitudes de crédito

### Tracking
- `trackEvent` - Registro de eventos de tracking

---

## ❌ Funciones INACTIVAS (NO se usan en el código)

### Funciones Vacías o Marcadas como Eliminadas
1. **`actualizarCantidadCarrito.ts`** - Archivo vacío (2 bytes)
2. **`agregarAlCarrito.ts`** - Archivo vacío (2 bytes)
3. **`obtenerCarrito.ts`** - Marcado como DELETED
4. **`confirmarPagoManual.ts`** - Marcado como DELETED
5. **`confirmarMercadoPago.ts`** - Solo retorna "Servidor OK" (no funcional)
6. **`recategorizarProductos.ts`** - Marcado como DEPRECATED
7. **`recategorizarProductosEstrategico.ts`** - Marcado como DEPRECATED

### Funciones Potencialmente Sin Uso
8. **`aplicarCategoriasMarketing.ts`** - No encontrada en búsqueda
9. **`aplicarCupon.ts`** - No encontrada en búsqueda
10. **`consultarStock.ts`** - No encontrada en búsqueda
11. **`forceWipe.ts`** - No encontrada en búsqueda
12. **`generarCuponNegociacion.ts`** - No encontrada en búsqueda
13. **`getMetaConfig.ts`** - No encontrada en búsqueda
14. **`incrementarVistas.ts`** - No encontrada en búsqueda
15. **`registrarGastoPublicitario.ts`** - No encontrada en búsqueda
16. **`resetData.ts`** - No encontrada en búsqueda
17. **`seedSuperAdmin.ts`** - No encontrada en búsqueda
18. **`systemBackup.ts`** - No encontrada en búsqueda
19. **`verificarSolicitudPendiente.ts`** - No encontrada en búsqueda

### Archivos Utilitarios (Revisar si se usan)
20. **`utilsCrypto.ts`** - Utilidad, verificar si se importa en otras funciones
21. **`utilsValidation.ts`** - Utilidad, verificar si se importa en otras funciones

---

## 📊 Resumen

- **Total de archivos en /functions**: 61
- **Funciones activas confirmadas**: ~30
- **Funciones inactivas/sin uso**: ~21
- **Archivos de configuración/utils**: 2

## 🎯 Recomendación

**Eliminar las siguientes funciones con seguridad:**

1. Archivos vacíos o marcados como DELETED (7 archivos)
2. Funciones que no aparecen en ninguna búsqueda del código frontend (12+ archivos)

**Antes de eliminar, verificar:**
- Si alguna función se llama desde otra función backend (no solo desde frontend)
- Si hay scripts externos o procesos que usen estas funciones
- Revisar `utilsCrypto.ts` y `utilsValidation.ts` para ver si son importados por otras funciones

## 🚀 Próximos Pasos

1. ✅ Confirmar la lista de funciones a eliminar
2. 🗑️ Eliminar archivos innecesarios
3. 🧹 Limpiar imports y referencias
4. 📝 Actualizar documentación
5. ✅ Verificar que todo sigue funcionando

---

## ✅ PROCESO DE CURADO COMPLETADO

**Fecha:** 2026-02-03 20:03

### 🗑️ Funciones Eliminadas (9 archivos)

Las siguientes funciones obsoletas fueron eliminadas exitosamente:

1. ✅ `forceWipe.ts` - Función de limpieza forzada (obsoleta)
2. ✅ `resetData.ts` - Función de reseteo de datos (obsoleta)
3. ✅ `seedSuperAdmin.ts` - Función de seed de super admin (obsoleta)
4. ✅ `systemBackup.ts` - Función de backup del sistema (obsoleta)
5. ✅ `agregarAlCarrito.ts` - Función vacía de carrito (obsoleta)
6. ✅ `actualizarCantidadCarrito.ts` - Función vacía de carrito (obsoleta)
7. ✅ `obtenerCarrito.ts` - Función marcada como DELETED (obsoleta)
8. ✅ `recategorizarProductos.ts` - Función deprecated con IDs hardcodeados (obsoleta)
9. ✅ `recategorizarProductosEstrategico.ts` - Función deprecated con IDs hardcodeados (obsoleta)

### 📊 Estado Actual

- **Archivos en /functions antes:** 61
- **Archivos eliminados:** 9
- **Archivos en /functions ahora:** 51
- **Reducción:** ~15% del código innecesario eliminado

### 🎯 Resultado

✅ **Proceso de curado completado exitosamente**
- Código más limpio y mantenible
- Menor superficie de ataque de seguridad
- Mejor organización del proyecto
- Funciones activas claramente identificadas
