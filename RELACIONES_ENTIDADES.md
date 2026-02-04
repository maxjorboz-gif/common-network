# 🔗 RELACIONES ENTRE ENTIDADES

> **Mapa de Conexiones y Queries Comunes**  
> Fecha: 2026-02-04  
> **IMPORTANTE:** Entender estas relaciones es crítico para queries eficientes

---

## 📊 DIAGRAMA DE RELACIONES

```
┌─────────────────┐
│    Comercio     │──┐
│  (id_comercio)  │  │
└─────────────────┘  │
         │           │
         │ tiene     │ tiene
         ▼           ▼
┌─────────────────┐  ┌──────────────────┐
│    Producto     │  │ ConfigComercio   │
│  (id_comercio)  │  │  (id_comercio)   │
└─────────────────┘  └──────────────────┘
         │
         │ tiene
         ▼
┌─────────────────┐
│ AtributoProducto│
│  (id_producto)  │
└─────────────────┘
         │
         │ tiene
         ▼
┌─────────────────┐
│     Reseña      │
│  (id_producto)  │
│  (id_cliente)   │
└─────────────────┘

┌─────────────────┐
│    Cliente      │──┐
│  (id_comercio)  │  │
└─────────────────┘  │
         │           │
         │ tiene     │ crea
         ▼           ▼
┌─────────────────┐  ┌──────────────────┐
│     Carrito     │  │      Orden       │
│  (id_comercio)  │  │  (id_comercio)   │
│  (id_cliente)   │  │  (id_cliente)    │
└─────────────────┘  └──────────────────┘
                              │
                              │ genera
                              ▼
                     ┌──────────────────┐
                     │   EventoMeta     │
                     │  (id_comercio)   │
                     │   (id_orden)     │
                     └──────────────────┘

┌─────────────────┐
│      Lead       │
│  (id_comercio)  │
└─────────────────┘

┌─────────────────┐
│      Cupón      │
│  (id_comercio)  │
│  (id_cliente)*  │ * solo si es_referido
└─────────────────┘

┌─────────────────┐
│GastoPublicitario│
│  (id_comercio)  │
└─────────────────┘

┌─────────────────┐
│Logs_Configuracion│
│  (id_comercio)  │
└─────────────────┘
```

---

## 🔑 CAMPOS CLAVE DE RELACIÓN

### **id_comercio**
- **Presente en:** TODAS las entidades (excepto SuperAdmin)
- **Propósito:** Aislar datos entre comercios
- **Tipo:** String
- **Obligatorio:** Sí
- **Índice:** Sí (para queries rápidas)

### **id_cliente**
- **Presente en:** Cliente, Carrito, Orden, Reseña, Cupón (si es_referido)
- **Propósito:** Relacionar acciones del cliente
- **Tipo:** String (ID de Base44)
- **Obligatorio:** Depende de la entidad

### **id_producto**
- **Presente en:** AtributoProducto, Reseña, items de Orden/Carrito
- **Propósito:** Relacionar con productos
- **Tipo:** String (ID de Base44)
- **Obligatorio:** Sí

### **id_orden**
- **Presente en:** EventoMeta
- **Propósito:** Relacionar eventos Meta con órdenes
- **Tipo:** String (ID de Base44)
- **Obligatorio:** Para eventos Purchase

---

## 📋 QUERIES COMUNES

### **1. Obtener todos los productos de un comercio**

```javascript
// Frontend (usuario autenticado como comercio)
const productos = await base44.entities.Producto.filter({
  id_comercio: comercio.id_comercio
});

// Backend (Service Role)
const productos = await base44.asServiceRole.entities.Producto.filter({
  id_comercio: id_comercio
});
```

**Optimización:**
```javascript
// Solo campos necesarios para listado
const productos = await base44.entities.Producto.filter(
  { id_comercio: id_comercio },
  '-created_date',  // Ordenar por más reciente
  50,               // Límite
  0,                // Skip
  ['id', 'titulo', 'precio_estandar', 'stock_actual', 'fotos'] // Solo estos campos
);
```

---

### **2. Obtener configuración de un comercio**

```javascript
const config = await base44.entities.ConfiguracionComercio.filter({
  id_comercio: id_comercio
});

// Debería haber solo 1 registro
const configuracion = config[0];
```

**Nota:** Cada comercio debe tener exactamente 1 registro de ConfiguracionComercio.

---

### **3. Obtener órdenes de un cliente específico**

```javascript
const ordenes = await base44.entities.Orden.filter({
  id_comercio: id_comercio,
  id_cliente: id_cliente
}, '-created_date'); // Más recientes primero
```

**Con paginación:**
```javascript
const ORDERS_PER_PAGE = 10;
const page = 0;

const ordenes = await base44.entities.Orden.filter(
  {
    id_comercio: id_comercio,
    id_cliente: id_cliente
  },
  '-created_date',
  ORDERS_PER_PAGE,
  page * ORDERS_PER_PAGE
);
```

---

### **4. Obtener orden completa con productos**

```javascript
// Paso 1: Obtener orden
const orden = await base44.entities.Orden.get(ordenId);

// Paso 2: Obtener productos de cada item
const productosPromises = orden.items.map(item => 
  base44.entities.Producto.get(item.id_producto)
);
const productos = await Promise.all(productosPromises);

// Paso 3: Combinar datos
const ordenCompleta = {
  ...orden,
  items: orden.items.map((item, index) => ({
    ...item,
    producto: productos[index]
  }))
};

console.log(ordenCompleta);
```

**Optimización (Backend):**
```typescript
// Función backend optimizada
Deno.serve(async (req) => {
  const { ordenId } = await req.json();
  const base44 = createClientFromRequest(req);
  
  // Obtener orden
  const orden = await base44.asServiceRole.entities.Orden.get(ordenId);
  
  // Obtener todos los productos en paralelo
  const productIds = orden.items.map(item => item.id_producto);
  const productos = await Promise.all(
    productIds.map(id => base44.asServiceRole.entities.Producto.get(id))
  );
  
  // Crear mapa para acceso rápido
  const productosMap = {};
  productos.forEach(p => productosMap[p.id] = p);
  
  // Combinar
  const ordenCompleta = {
    ...orden,
    items: orden.items.map(item => ({
      ...item,
      producto: productosMap[item.id_producto]
    }))
  };
  
  return Response.json({ orden: ordenCompleta });
});
```

---

### **5. Obtener cliente con su historial de órdenes**

```javascript
// Paso 1: Obtener cliente
const cliente = await base44.entities.Cliente.get(clienteId);

// Paso 2: Obtener órdenes del cliente
const ordenes = await base44.entities.Orden.filter({
  id_comercio: cliente.id_comercio,
  id_cliente: clienteId
}, '-created_date');

// Paso 3: Calcular estadísticas
const clienteCompleto = {
  ...cliente,
  ordenes: ordenes,
  total_ordenes: ordenes.length,
  total_gastado: ordenes.reduce((sum, orden) => sum + orden.total, 0),
  ultima_compra: ordenes[0]?.created_date || null
};
```

---

### **6. Obtener producto con sus atributos y reseñas**

```javascript
// Paso 1: Obtener producto
const producto = await base44.entities.Producto.get(productoId);

// Paso 2: Obtener atributos
const atributos = await base44.entities.AtributoProducto.filter({
  id_producto: productoId
});

// Paso 3: Obtener reseñas aprobadas
const resenas = await base44.entities.Resena.filter({
  id_producto: productoId,
  estado_moderacion: 'aprobada'
}, '-created_date');

// Paso 4: Combinar
const productoCompleto = {
  ...producto,
  atributos: atributos,
  resenas: resenas,
  total_resenas: resenas.length
};
```

---

### **7. Obtener carrito activo de un cliente**

```javascript
const carritos = await base44.entities.Carrito.filter({
  id_comercio: id_comercio,
  id_cliente: id_cliente,
  activo: true
});

// Debería haber solo 1 carrito activo por cliente
const carritoActivo = carritos[0];

if (!carritoActivo) {
  // Crear nuevo carrito
  const nuevoCarrito = await base44.entities.Carrito.create({
    id_comercio: id_comercio,
    id_cliente: id_cliente,
    items: [],
    activo: true,
    abandonado: false,
    convertido: false
  });
}
```

---

### **8. Obtener leads de un comercio (últimos 30 días)**

```javascript
const hace30Dias = new Date();
hace30Dias.setDate(hace30Dias.getDate() - 30);

const leads = await base44.entities.Lead.filter({
  id_comercio: id_comercio,
  created_date: { $gte: hace30Dias.toISOString() }
}, '-created_date');
```

---

### **9. Obtener cupones activos de un comercio**

```javascript
const ahora = new Date().toISOString();

const cuponesActivos = await base44.entities.Cupon.filter({
  id_comercio: id_comercio,
  activo: true,
  fecha_inicio: { $lte: ahora },
  fecha_fin: { $gte: ahora }
});
```

**Validar cupón específico:**
```javascript
const validarCupon = async (codigo, id_comercio) => {
  const cupones = await base44.entities.Cupon.filter({
    codigo: codigo.toUpperCase(),
    id_comercio: id_comercio,
    activo: true
  });
  
  const cupon = cupones[0];
  
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  const ahora = new Date();
  const inicio = new Date(cupon.fecha_inicio);
  const fin = new Date(cupon.fecha_fin);
  
  if (ahora < inicio || ahora > fin) {
    throw new Error('Cupón expirado');
  }
  
  if (cupon.usos_actuales >= cupon.usos_maximos) {
    throw new Error('Cupón agotado');
  }
  
  return cupon;
};
```

---

### **10. Obtener eventos Meta de una orden**

```javascript
const eventos = await base44.entities.EventoMeta.filter({
  id_comercio: id_comercio,
  id_orden: ordenId
}, '-created_date');

// Verificar qué eventos se enviaron
const eventosEnviados = eventos.filter(e => e.enviado_exitosamente);
console.log('Eventos enviados:', eventosEnviados.map(e => e.event_name));
```

---

### **11. Obtener gastos publicitarios del mes actual**

```javascript
const inicioMes = new Date();
inicioMes.setDate(1);
inicioMes.setHours(0, 0, 0, 0);

const gastos = await base44.entities.GastoPublicitario.filter({
  id_comercio: id_comercio,
  fecha: { $gte: inicioMes.toISOString() }
}, 'fecha');

const totalGastado = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
console.log('Total gastado este mes:', totalGastado);
```

---

### **12. Obtener logs de configuración (auditoría)**

```javascript
const logs = await base44.entities.Logs_Configuracion.filter({
  id_comercio: id_comercio
}, '-timestamp', 50); // Últimos 50 cambios

console.log('Últimos cambios de configuración:');
logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.campo_modificado} cambió de "${log.valor_anterior}" a "${log.valor_nuevo}" por ${log.usuario_email}`);
});
```

---

## 🔄 ESTRATEGIAS DE CARGA

### **Eager Loading (Cargar todo de una vez)**
```javascript
// Útil cuando SIEMPRE necesitas los datos relacionados
const obtenerOrdenCompleta = async (ordenId) => {
  const [orden, cliente] = await Promise.all([
    base44.entities.Orden.get(ordenId),
    base44.entities.Cliente.get(clienteId) // Si ya conoces el ID
  ]);
  
  const productos = await Promise.all(
    orden.items.map(item => base44.entities.Producto.get(item.id_producto))
  );
  
  return { orden, cliente, productos };
};
```

### **Lazy Loading (Cargar bajo demanda)**
```javascript
// Útil cuando NO SIEMPRE necesitas los datos relacionados
const [ordenes, setOrdenes] = useState([]);
const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

// Cargar lista de órdenes (sin productos)
useEffect(() => {
  const cargarOrdenes = async () => {
    const data = await base44.entities.Orden.filter(
      { id_comercio },
      '-created_date',
      20
    );
    setOrdenes(data);
  };
  cargarOrdenes();
}, []);

// Cargar productos solo cuando se selecciona una orden
const verDetalleOrden = async (orden) => {
  const productos = await Promise.all(
    orden.items.map(item => base44.entities.Producto.get(item.id_producto))
  );
  
  setOrdenSeleccionada({
    ...orden,
    items: orden.items.map((item, i) => ({
      ...item,
      producto: productos[i]
    }))
  });
};
```

---

## ⚡ OPTIMIZACIONES

### **1. Usar campos específicos**
```javascript
// ❌ MAL: Trae todos los campos (pesado)
const productos = await base44.entities.Producto.list();

// ✅ BIEN: Solo campos necesarios
const productos = await base44.entities.Producto.list(
  null, null, null,
  ['id', 'titulo', 'precio_estandar', 'stock_actual']
);
```

### **2. Limitar resultados**
```javascript
// ❌ MAL: Trae todos los registros
const ordenes = await base44.entities.Orden.filter({ id_comercio });

// ✅ BIEN: Limitar a lo necesario
const ordenes = await base44.entities.Orden.filter(
  { id_comercio },
  '-created_date',
  20 // Solo las últimas 20
);
```

### **3. Cachear datos que no cambian frecuentemente**
```javascript
// Cachear configuración del comercio (cambia poco)
let configCache = null;
let configCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const obtenerConfiguracion = async (id_comercio) => {
  const ahora = Date.now();
  
  if (configCache && (ahora - configCacheTime) < CACHE_DURATION) {
    return configCache;
  }
  
  const configs = await base44.entities.ConfiguracionComercio.filter({
    id_comercio
  });
  
  configCache = configs[0];
  configCacheTime = ahora;
  
  return configCache;
};
```

### **4. Queries en paralelo cuando sea posible**
```javascript
// ❌ MAL: Secuencial (lento)
const productos = await base44.entities.Producto.filter({ id_comercio });
const ordenes = await base44.entities.Orden.filter({ id_comercio });
const clientes = await base44.entities.Cliente.filter({ id_comercio });

// ✅ BIEN: Paralelo (rápido)
const [productos, ordenes, clientes] = await Promise.all([
  base44.entities.Producto.filter({ id_comercio }),
  base44.entities.Orden.filter({ id_comercio }),
  base44.entities.Cliente.filter({ id_comercio })
]);
```

---

## 🚨 REGLAS DE INTEGRIDAD

### **Cascade Delete (Eliminar en cascada)**

Cuando se elimina un registro, considerar qué hacer con registros relacionados:

#### **Eliminar Comercio:**
```javascript
// Debe eliminar:
// - Todos los Productos
// - Todas las Órdenes
// - Todos los Clientes
// - ConfiguracionComercio
// - Todos los Leads
// - Todos los Cupones
// - Todos los Carritos
// - Todos los EventosMeta
// - Todos los GastosPublicitarios
// - Todos los Logs_Configuracion

// Implementar en función backend
const eliminarComercio = async (id_comercio) => {
  const adminClient = base44.asServiceRole;
  
  // Eliminar todas las entidades relacionadas
  await Promise.all([
    adminClient.entities.Producto.deleteMany({ id_comercio }),
    adminClient.entities.Orden.deleteMany({ id_comercio }),
    adminClient.entities.Cliente.deleteMany({ id_comercio }),
    adminClient.entities.ConfiguracionComercio.deleteMany({ id_comercio }),
    adminClient.entities.Lead.deleteMany({ id_comercio }),
    adminClient.entities.Cupon.deleteMany({ id_comercio }),
    adminClient.entities.Carrito.deleteMany({ id_comercio }),
    adminClient.entities.EventoMeta.deleteMany({ id_comercio }),
    adminClient.entities.GastoPublicitario.deleteMany({ id_comercio }),
    adminClient.entities.Logs_Configuracion.deleteMany({ id_comercio })
  ]);
  
  // Finalmente eliminar el comercio
  await adminClient.entities.Comercio.delete(id_comercio);
};
```

#### **Eliminar Producto:**
```javascript
// Debe eliminar:
// - Todos los AtributoProducto
// - Todas las Reseñas

// NO eliminar órdenes que ya lo compraron (mantener historial)

const eliminarProducto = async (id_producto) => {
  const adminClient = base44.asServiceRole;
  
  await Promise.all([
    adminClient.entities.AtributoProducto.deleteMany({ id_producto }),
    adminClient.entities.Resena.deleteMany({ id_producto })
  ]);
  
  await adminClient.entities.Producto.delete(id_producto);
};
```

#### **Eliminar Cliente:**
```javascript
// Considerar:
// - NO eliminar órdenes (mantener historial de ventas)
// - Eliminar carritos activos
// - Marcar cupones de referido como inactivos

const eliminarCliente = async (id_cliente) => {
  const adminClient = base44.asServiceRole;
  
  // Eliminar carritos
  await adminClient.entities.Carrito.deleteMany({ id_cliente });
  
  // Desactivar cupones de referido
  const cupones = await adminClient.entities.Cupon.filter({
    id_cliente_dueno: id_cliente,
    es_referido: true
  });
  
  await Promise.all(
    cupones.map(cupon => 
      adminClient.entities.Cupon.update(cupon.id, { activo: false })
    )
  );
  
  // Eliminar cliente
  await adminClient.entities.Cliente.delete(id_cliente);
};
```

---

## 📝 NOTAS IMPORTANTES

### **Consistencia de Datos**
- Siempre validar que `id_comercio` coincida en operaciones relacionadas
- Verificar existencia de registros relacionados antes de crear
- Usar transacciones cuando sea posible (próximamente en Base44)

### **Performance**
- Índices en `id_comercio`, `id_cliente`, `id_producto` mejoran queries
- Limitar resultados con paginación
- Usar campos específicos en lugar de traer todo
- Cachear datos que cambian poco

### **Seguridad**
- Siempre validar permisos antes de acceder a datos relacionados
- Un comercio NO debe poder acceder a datos de otro comercio
- Usar Service Role solo en backend, nunca exponer en frontend

---

**📌 NOTA:** Este documento debe actualizarse cuando se agreguen nuevas entidades o relaciones.
