---
trigger: always_on
---

🔒 REGLA BASE44: Row-Level Security (RLS) Multi-Comercio
📌 Concepto Principal
Base44 filtra AUTOMÁTICAMENTE los datos por id_comercio usando Row-Level Security (RLS).

TU CÓDIGO NO NECESITA FILTRAR MANUALMENTE - El backend lo hace por ti.

Campos clave de la entidad Comercio:
user_id: ID del usuario establecido por Auth de Google (automático)
id_comercio: Código único de la tienda (lo creamos nosotros, 10 caracteres alfanuméricos)
logo_url, whatsapp_negocio, email_negocio, etc.: Configuración visual del comercio
✅ Cómo Funciona el RLS de Base44
Configuración (se hace en el Dashboard de Base44):
User Schema: El usuario tiene user_id (Auth de Google) y id_comercio asignado
Entity Schema: Cada entidad (Producto, Orden, Config) tiene campo id_comercio
RLS Rule: "Entity-User Field Comparison"
Campo de la entidad: data.id_comercio
Propiedad del usuario: {{user.data.id_comercio}}
Resultado:
Cuando un usuario inicia sesión con Google Auth, TODAS las operaciones (.list(), .filter(), .create()) se filtran automáticamente por su id_comercio.

🎯 Reglas para Escribir Código Compatible
REGLA #1: Programar como si fuera para UN SOLO comercio
NO necesitas:

❌ URLs dinámicas por comercio (/comercio/:id_comercio/productos)
❌ Filtros manuales por id_comercio al leer datos
❌ Lógica condicional según comercio en el código
❌ Rutas especiales por comercio
Escribis el código una vez, como si fuera para un solo e-commerce, y el RLS se encarga del multi-tenancy.

REGLA #2: EL id_comercio debe ser creado cuando el comercio realiza el registro en la pages merchantregister.jsx

jsx
// ✅ CORRECTO
const user = await base44.auth.me();  // Devuelve user_id (Google) y id_comercio asignado
const nuevoProducto = await base44.entities.Producto.create({
  nombre: "Pizza Margherita",
  precio: 12.99,
  id_comercio: user.id_comercio  // 👈 OBLIGATORIO
});
// ❌ INCORRECTO (falta id_comercio)
const nuevoProducto = await base44.entities.Producto.create({
  nombre: "Pizza Margherita",
  precio: 12.99
  // Sin id_comercio = ERROR o dato huérfano
});
REGLA #3: NO agregar filtros manuales al LEER
El RLS filtra automáticamente. NO necesitas agregar filtros por id_comercio:

jsx
// ✅ CORRECTO - El RLS filtra automáticamente
const productos = await base44.entities.Producto.list();
// Solo devuelve productos del comercio del usuario logueado
const activos = await base44.entities.Producto.filter({
  status: "activo"
});
// Solo devuelve productos activos DEL comercio del usuario
// ❌ INCORRECTO (filtro manual innecesario)
const user = await base44.auth.me();
const productos = await base44.entities.Producto.filter({
  id_comercio: user.id_comercio  // 👈 REDUNDANTE, el RLS ya lo hace
});
REGLA #4: Personalización visual por comercio
La configuración visual (logo, colores, nombre, WhatsApp, etc.) viene de la misma entidad Comercio:

jsx
// Schema real de Comercio (campos de configuración visual)
{
  id_comercio: "string",
  user_id: "string",  // ID del Auth de Google
  nombre: "string",
  slug: "string",
  logo_url: "string",
  whatsapp_negocio: "string",
  email_negocio: "string",
  descripcion: "string",
  direccion: "string",
  ciudad: "string",
  activo: "boolean"
}
// Al cargar la configuración del comercio logueado
const user = await base44.auth.me();
const comercio = await base44.entities.Comercio.filter({
  user_id: user.id  // Filtrar por el user_id del Auth de Google
});
// O si id_comercio ya está en el user:
const comercio = await base44.entities.Comercio.list();
// El RLS devuelve SOLO el comercio del usuario logueado
// Uso en la UI
<img src={comercio[0].logo_url} alt={comercio[0].nombre} />
<a href={`https://wa.me/${comercio[0].whatsapp_negocio}`}>WhatsApp</a>
📋 Workflow Completo
1. Registro de Comercio
jsx
// Al registrar un nuevo comercio
const generateIdComercio = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
// Primero crear usuario con Google Auth
const nuevoUsuario = await base44.auth.googleSignIn();  // Retorna user_id
// Luego crear el comercio vinculado
const nuevoComercio = await base44.entities.Comercio.create({
  id_comercio: generateIdComercio(),  // Generar código único
  user_id: nuevoUsuario.id,  // 👈 Vincular al user_id de Google Auth
  nombre: form.nombreComercio,
  email_negocio: form.email,
  whatsapp_negocio: form.whatsapp,
  estado_registro: 'borrador',
  activo: true
});
2. Login
jsx
// Al hacer login con Google
const user = await base44.auth.googleSignIn();
// Obtener el comercio del usuario
const comercio = await base44.entities.Comercio.filter({
  user_id: user.id
});
// El user tiene su user_id (Google) y el comercio tiene id_comercio
// Todas las llamadas a entidades se filtran por id_comercio automáticamente
3. CRUD de Productos
jsx
// Crear producto (SIEMPRE incluir id_comercio)
const user = await base44.auth.me();
const comercio = await base44.entities.Comercio.filter({ user_id: user.id });
const producto = await base44.entities.Producto.create({
  nombre: "Parrilla Grande",
  precio: 15000,
  id_comercio: comercio[0].id_comercio  // 👈 Obligatorio
});
// Listar productos (NO filtrar manualmente)
const productos = await base44.entities.Producto.list();
// Base44 devuelve SOLO los productos de este comercio (RLS automático)
// Actualizar producto
await base44.entities.Producto.update(producto.id, {
  precio: 16000
});
// El RLS verifica que el producto pertenezca al comercio antes de actualizar
// Eliminar producto
await base44.entities.Producto.delete(producto.id);
// El RLS verifica que el producto pertenezca al comercio antes de eliminar
🚫 Errores Comunes a EVITAR
❌ ERROR #1: Filtrar manualmente por id_comercio
jsx
// ❌ MAL
const productos = await base44.entities.Producto.filter({
  id_comercio: comercio.id_comercio  // REDUNDANTE
});
// ✅ BIEN
const productos = await base44.entities.Producto.list();
// El RLS ya filtra automáticamente
❌ ERROR #2: Olvidar incluir id_comercio al crear
jsx
// ❌ MAL
const producto = await base44.entities.Producto.create({
  nombre: "Pizza"
  // Falta id_comercio
});
// ✅ BIEN
const user = await base44.auth.me();
const comercio = await base44.entities.Comercio.filter({ user_id: user.id });
const producto = await base44.entities.Producto.create({
  nombre: "Pizza",
  id_comercio: comercio[0].id_comercio
});
❌ ERROR #3: Crear URLs dinámicas por comercio
jsx
// ❌ MAL (innecesario)
<Route path="/comercio/:id_comercio/productos" />
// ✅ BIEN (RLS se encarga)
<Route path="/productos" />
// Cada usuario solo ve SUS productos automáticamente
🎨 Resumen Visual
Operación	¿Incluir id_comercio?	¿Filtrado automático?
create()	✅ SÍ (obligatorio)	-
list()	❌ NO	✅ SÍ
filter()	❌ NO	✅ SÍ
update()	❌ NO	✅ SÍ (verifica permisos)
delete()	❌ NO	✅ SÍ (verifica permisos)
📦 Checklist: ¿Mi código es compatible con Base44 RLS?
 Al crear registros, SIEMPRE incluyo id_comercio del comercio del usuario logueado
 NO agrego filtros manuales por id_comercio al leer datos
 Programo como si fuera para UN SOLO comercio
 NO creo URLs dinámicas por comercio (ej: /comercio/:code/productos)
 Uso la entidad Comercio directamente para obtener configuración visual (logo_url, whatsapp_negocio, etc.)
 Distingo entre user_id (Auth de Google) y id_comercio (código único del comercio)
 Confío en el RLS para filtrar datos automáticamente
🔗 Integración con Reglas Existentes
Estas reglas NO reemplazan las reglas anteriores. Se suman a ellas:

✅ Seguir respetando archivos inamovibles
✅ Usar solo componentes de @/components/ui/
✅ Seguir el sistema de routing con 
pages.config.js
✅ Extraer solo entidades y campos del código viejo
Nueva adición: Programar compatible con RLS de Base44 (incluir id_comercio al crear, no filtrar al leer, usar user_id para vincular con Auth de Google).