# 🔧 BASE44 SNIPPETS - CÓDIGOS ÚTILES

> **Fuente Única de Verdad para Código Base44**  
> Fecha: 2026-02-04  
> **IMPORTANTE:** Usar estos patrones en todo el código

---

## 📚 ÍNDICE

1. [Cliente Base44](#cliente-base44)
2. [Autenticación](#autenticación)
3. [Entidades (CRUD)](#entidades-crud)
4. [Funciones Backend](#funciones-backend)
5. [Integraciones](#integraciones)
6. [Agentes IA](#agentes-ia)
7. [Conectores (OAuth Tokens)](#conectores-oauth-tokens)
8. [Analytics (Tracking de Eventos)](#analytics-tracking-de-eventos)
9. [App Logs (Registro de Actividad)](#app-logs-registro-de-actividad)
10. [Integraciones Personalizadas](#integraciones-personalizadas)
11. [Autenticación Avanzada](#autenticación-avanzada)
12. [Manejo de Errores](#manejo-de-errores)
13. [Patrones Comunes](#patrones-comunes)
14. [Mejores Prácticas](#mejores-prácticas)


---

## 🎯 CLIENTE BASE44

### **Crear Cliente (Frontend)**
```javascript
// En aplicaciones Base44, el cliente ya está importado
import { base44 } from "@/api/base44Client";

// El cliente está pre-configurado y listo para usar
const user = await base44.auth.me();
```

### **Crear Cliente (Backend - Función Base44)**
```typescript
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Usar con permisos de usuario
  const user = await base44.auth.me();
  
  // Usar con permisos de administrador (Service Role)
  const allData = await base44.asServiceRole.entities.MyEntity.list();
  
  return Response.json({ user, allData });
});
```

### **Crear Cliente (Aplicación Externa)**
```javascript
import { createClient } from "@base44/sdk";

const base44 = createClient({
  appId: "YOUR_APP_ID", // Encontrar en URL del editor
  token: "USER_TOKEN",  // Opcional, para autenticación
});
```

---

## 🔐 AUTENTICACIÓN

### **Obtener Usuario Actual**
```javascript
const user = await base44.auth.me();
console.log(user.email, user.full_name, user.role);
```

### **Verificar si está Autenticado**
```javascript
const isAuthenticated = await base44.auth.isAuthenticated();
if (!isAuthenticated) {
  base44.auth.redirectToLogin(window.location.href);
}
```

### **Login con Email/Password**
```javascript
try {
  const { access_token, user } = await base44.auth.loginViaEmailPassword(
    'user@example.com',
    'password123'
  );
  console.log('Login exitoso!', user);
} catch (error) {
  console.error('Login falló:', error);
}
```

### **Login con Google**
```javascript
// Redirige a Google OAuth y vuelve a la página actual
base44.auth.loginWithProvider('google', window.location.pathname);
```

### **Registro de Nuevo Usuario**
```javascript
await base44.auth.register({
  email: 'newuser@example.com',
  password: 'securePassword123',
  referral_code: 'FRIEND2024' // Opcional
});

// Luego hacer login
const { access_token, user } = await base44.auth.loginViaEmailPassword(
  'newuser@example.com',
  'securePassword123'
);
```

### **Logout**
```javascript
// Logout y recargar página
base44.auth.logout();

// Logout y redirigir a login
base44.auth.logout('/login');

// Logout y redirigir a home
base44.auth.logout('/');
```

### **Actualizar Usuario Actual**
```javascript
const updatedUser = await base44.auth.updateMe({
  full_name: 'Juan Pérez',
  // Agregar campos personalizados definidos en entidad User
  company: 'Mi Empresa',
  phone: '+5491112345678'
});
```

### **Restablecer Contraseña**
```javascript
// Solicitar reset
await base44.auth.resetPasswordRequest('user@example.com');

// Completar reset con token del email
await base44.auth.resetPassword({
  resetToken: 'token-from-email',
  newPassword: 'newSecurePassword456'
});
```

---

## 📊 ENTIDADES (CRUD)

### **Listar Todos los Registros**
```javascript
// Obtener todos
const tasks = await base44.entities.Task.list();

// Con ordenamiento
const tasks = await base44.entities.Task.list('-created_date'); // Descendente
const tasks = await base44.entities.Task.list('priority'); // Ascendente

// Con paginación
const tasks = await base44.entities.Task.list(null, 10, 0); // Primeros 10
const tasks = await base44.entities.Task.list(null, 10, 10); // Siguientes 10

// Con campos específicos
const tasks = await base44.entities.Task.list(null, null, null, ['id', 'title', 'status']);
```

### **Filtrar Registros**
```javascript
// Filtro simple
const activeTasks = await base44.entities.Task.filter({
  status: 'active'
});

// Filtro múltiple
const tasks = await base44.entities.Task.filter({
  status: 'active',
  priority: 'high'
});

// Filtro con ordenamiento y paginación
const tasks = await base44.entities.Task.filter(
  { status: 'active' },
  '-created_date',  // Ordenar por fecha descendente
  10,               // Límite
  0                 // Skip
);
```

### **Obtener por ID**
```javascript
const task = await base44.entities.Task.get('task-123');
console.log(task.title, task.status);
```

### **Crear Registro**
```javascript
const newTask = await base44.entities.Task.create({
  title: 'Completar documentación',
  status: 'pending',
  priority: 'high',
  due_date: '2024-12-31'
});
console.log('Creado con ID:', newTask.id);
```

### **Actualizar Registro**
```javascript
// Actualizar un campo
const updated = await base44.entities.Task.update('task-123', {
  status: 'completed'
});

// Actualizar múltiples campos
const updated = await base44.entities.Task.update('task-123', {
  status: 'in-progress',
  priority: 'medium',
  notes: 'Trabajando en esto'
});
```

### **Eliminar Registro**
```javascript
await base44.entities.Task.delete('task-123');
```

### **Eliminar Múltiples Registros**
```javascript
const result = await base44.entities.Task.deleteMany({
  status: 'completed',
  priority: 'low'
});
console.log('Eliminados:', result);
```

### **Crear Múltiples Registros (Bulk)**
```javascript
const tasks = await base44.entities.Task.bulkCreate([
  { title: 'Tarea 1', status: 'pending' },
  { title: 'Tarea 2', status: 'pending' },
  { title: 'Tarea 3', status: 'in-progress' }
]);
```

### **Importar desde Archivo CSV**
```javascript
// En React
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    const result = await base44.entities.Task.importEntities(file);
    console.log(`Importados ${result.output.length} registros`);
  }
};
```

### **Suscribirse a Cambios en Tiempo Real**
```javascript
const unsubscribe = base44.entities.Task.subscribe((event) => {
  console.log(`Task ${event.id} fue ${event.type}:`, event.data);
  // event.type puede ser: 'create', 'update', 'delete'
});

// Limpiar suscripción cuando no se necesite más
unsubscribe();
```

---

## ⚙️ FUNCIONES BACKEND

### **Invocar Función Backend**
```javascript
const result = await base44.functions.invoke('processOrder', {
  orderId: '123',
  action: 'fulfill'
});
console.log(result.data);
```

### **Función Backend con Carga de Archivo**
```javascript
// En React
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const result = await base44.functions.invoke('processDocument', {
    file: file,
    documentType: 'invoice'
  });
  
  console.log(result.data);
};
```

### **Plantilla de Función Backend Estándar**
```typescript
// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * NOMBRE_FUNCION
 * Descripción de lo que hace
 */
Deno.serve(async (req) => {
  try {
    // 1. CORS
    if (req.method === 'OPTIONS') {
      return new Response("OK", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    // 2. PARSEAR REQUEST
    const body = await req.json();
    const { campo1, campo2 } = body;

    // 3. VALIDAR INPUTS
    if (!campo1 || !campo2) {
      return Response.json({ 
        error: 'Campos requeridos faltantes' 
      }, { status: 400 });
    }

    // 4. INICIALIZAR CLIENTE
    const base44 = createClientFromRequest(req);
    
    // 5. VALIDAR AUTENTICACIÓN (opcional)
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        error: 'No autorizado' 
      }, { status: 401 });
    }

    // 6. LÓGICA DE NEGOCIO
    const result = await base44.entities.MyEntity.create({
      campo1,
      campo2,
      user_id: user.id
    });

    // 7. RESPUESTA
    return Response.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error en nombreFuncion:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
```

---

## 🔌 INTEGRACIONES

### **Generar Texto con IA**
```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Escribe un email de bienvenida para un nuevo usuario"
});
console.log(response);
```

### **Generar Texto con Contexto de Internet**
```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "¿Cuál es el clima actual en Buenos Aires?",
  useInternetContext: true
});
```

### **Generar JSON Estructurado con IA**
```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Genera información de un producto de parrilla",
  responseFormat: "json",
  schema: {
    type: "object",
    properties: {
      nombre: { type: "string" },
      precio: { type: "number" },
      descripcion: { type: "string" },
      caracteristicas: { 
        type: "array",
        items: { type: "string" }
      }
    }
  }
});
console.log(response); // Objeto JSON estructurado
```

### **Generar Imagen con IA**
```javascript
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "Una parrilla moderna de acero inoxidable en un jardín"
});
console.log(url); // URL de la imagen generada
```

### **Subir Archivo Público**
```javascript
// En React
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  console.log(file_url); // URL pública del archivo
};
```

### **Subir Archivo Privado**
```javascript
// Subir archivo privado
const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });

// Crear URL firmada temporal (válida por 2 horas)
const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
  file_uri: file_uri,
  expires_in: 7200
});

console.log(signed_url); // URL temporal para acceder al archivo
```

### **Extraer Datos de Archivo con IA**
```javascript
// Primero subir el archivo
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Luego extraer datos estructurados
const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
  file_url: file_url,
  json_schema: {
    type: "object",
    properties: {
      invoice_number: { type: "string" },
      total_amount: { type: "number" },
      date: { type: "string" },
      vendor_name: { type: "string" }
    }
  }
});

console.log(result); // { invoice_number: "INV-12345", total_amount: 1250.00, ... }
```

### **Enviar Email**
```javascript
await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "Bienvenido a nuestra app",
  body: "Gracias por registrarte!",
  isHtml: true
});
```

---

## 🤖 AGENTES IA

### **Crear Conversación con Agente**
```javascript
const conversation = await base44.agents.createConversation({
  agent_name: "support-agent",
  metadata: {
    order_id: "ORD-789",
    category: "technical-support"
  }
});
```

### **Enviar Mensaje al Agente**
```javascript
const message = await base44.agents.addMessage(conversation, {
  role: "user",
  content: "Hola, necesito ayuda con mi pedido #12345"
});
```

### **Suscribirse a Respuestas en Tiempo Real**
```javascript
const unsubscribe = base44.agents.subscribeToConversation(
  conversation.id,
  (updatedConversation) => {
    const latestMessage = updatedConversation.messages[
      updatedConversation.messages.length - 1
    ];
    console.log("Nuevo mensaje:", latestMessage.content);
  }
);

// Limpiar suscripción
unsubscribe();
```

### **Obtener Conversación por ID**
```javascript
const conversation = await base44.agents.getConversation("conv-123");
console.log(`Conversación tiene ${conversation.messages.length} mensajes`);
```

### **Listar Conversaciones con Filtros**
```javascript
const recentConversations = await base44.agents.listConversations({
  limit: 10,
  sort: "-created_date"
});
```

---

## ⚠️ MANEJO DE ERRORES

### **Patrón Estándar de Manejo de Errores**
```javascript
import { Base44Error } from "@base44/sdk";

try {
  const result = await base44.entities.Task.list();
} catch (error) {
  if (error instanceof Base44Error) {
    console.error(`Status: ${error.status}`);
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code}`);
  } else {
    console.error("Error inesperado:", error);
  }
}
```

---

## 🎨 PATRONES COMUNES

### **Validar Permisos de Comercio (Backend)**
```typescript
// Validar que el comercio solo puede modificar sus propios datos
const validateCommerceOwnership = async (resourceId, resourceType, commerce_code) => {
  const adminClient = base44.asServiceRole;
  const resource = await adminClient.entities[resourceType].get(resourceId);
  
  if (!resource) {
    throw new Error('Recurso no encontrado');
  }
  
  if (resource.id_comercio !== commerce_code && resource.commerce_code !== commerce_code) {
    throw new Error('No autorizado para modificar este recurso');
  }
  
  return resource;
};

// Uso
await validateCommerceOwnership(productoId, 'Producto', commerce_code);
```

### **Obtener Datos Relacionados**
```javascript
// Obtener orden con items de productos
const orden = await base44.entities.Orden.get(ordenId);

// Obtener productos de cada item
const productosPromises = orden.items.map(item => 
  base44.entities.Producto.get(item.id_producto)
);
const productos = await Promise.all(productosPromises);

// Combinar datos
const ordenCompleta = {
  ...orden,
  items: orden.items.map((item, index) => ({
    ...item,
    producto: productos[index]
  }))
};
```

### **Paginación Infinita**
```javascript
const [items, setItems] = useState([]);
const [page, setPage] = useState(0);
const ITEMS_PER_PAGE = 20;

const loadMore = async () => {
  const newItems = await base44.entities.Task.list(
    '-created_date',
    ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  setItems([...items, ...newItems]);
  setPage(page + 1);
};
```

### **Búsqueda con Debounce**
```javascript
import { useState, useEffect } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [results, setResults] = useState([]);

useEffect(() => {
  const delayDebounceFn = setTimeout(async () => {
    if (searchTerm) {
      const results = await base44.entities.Producto.filter({
        titulo: { $regex: searchTerm, $options: 'i' }
      });
      setResults(results);
    }
  }, 500); // Esperar 500ms después de que el usuario deje de escribir

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);
```

---

---

## 🔗 CONECTORES (OAuth Tokens)

### **Obtener Token de Google Calendar**
```javascript
// Solo disponible en backend con Service Role
const googleToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

// Usar el token para llamar a la API de Google
const response = await fetch(
  'https://www.googleapis.com/calendar/v3/calendars/primary/events',
  {
    headers: { Authorization: `Bearer ${googleToken}` }
  }
);

const events = await response.json();
```

### **Obtener Token de Slack**
```javascript
const slackToken = await base44.asServiceRole.connectors.getAccessToken('slack');

// Enviar mensaje a Slack
const response = await fetch('https://slack.com/api/chat.postMessage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${slackToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    channel: '#general',
    text: 'Hola desde Base44!'
  })
});
```

**Nota:** Los conectores solo están disponibles con Service Role en funciones backend.

---

## 📊 ANALYTICS (Tracking de Eventos)

### **Trackear Evento Personalizado**
```javascript
// Trackear clic en botón
base44.analytics.track({
  eventName: 'signup_button_click'
});

// Trackear con propiedades
base44.analytics.track({
  eventName: 'purchase_completed',
  properties: {
    product_id: 'PROD-123',
    price: 1500,
    currency: 'ARS',
    is_first_purchase: true
  }
});
```

### **Trackear Eventos de Comercio**
```javascript
// Producto visto
base44.analytics.track({
  eventName: 'product_view',
  properties: {
    id_comercio: comercio.id_comercio,
    id_producto: producto.id,
    titulo: producto.titulo,
    precio: producto.precio_estandar
  }
});

// Agregar al carrito
base44.analytics.track({
  eventName: 'add_to_cart',
  properties: {
    id_comercio: comercio.id_comercio,
    id_producto: producto.id,
    cantidad: 1,
    precio_total: producto.precio_estandar
  }
});

// Checkout iniciado
base44.analytics.track({
  eventName: 'checkout_start',
  properties: {
    id_comercio: comercio.id_comercio,
    cart_value: 3500,
    items_count: 3
  }
});
```

**Nota:** Los eventos aparecen como tarjetas en el panel de Analytics.

---

## 📝 APP LOGS (Registro de Actividad)

### **Registrar Visita a Página**
```javascript
// Registrar que el usuario visitó una página
await base44.appLogs.logUserInApp('home');
await base44.appLogs.logUserInApp('productos');
await base44.appLogs.logUserInApp('checkout');
```

### **Registrar Uso de Funcionalidades**
```javascript
// Registrar acciones específicas
await base44.appLogs.logUserInApp('features-section');
await base44.appLogs.logUserInApp('button-click-comprar');
await base44.appLogs.logUserInApp('modal-cupon-abierto');
```

**Nota:** Los logs se reflejan en la página de Analytics del panel.

---

## 🔌 INTEGRACIONES PERSONALIZADAS

### **Llamar a API Externa Configurada**
```javascript
// Llamar a integración de CRM personalizada
const response = await base44.integrations.custom.call(
  "my-crm",              // slug de la integración
  "get:/contacts",       // operationId (método:ruta)
  { 
    queryParams: { limit: 10 } 
  }
);

if (response.success) {
  console.log("Contactos:", response.data);
}
```

### **Llamar con Parámetros de Ruta y Body**
```javascript
const response = await base44.integrations.custom.call(
  "my-api",
  "post:/users/{userId}/orders",
  {
    pathParams: { userId: "123" },
    queryParams: { include: "items" },
    body: {
      product_id: "PROD-456",
      quantity: 2
    }
  }
);
```

**Nota:** Las integraciones personalizadas deben ser configuradas por un administrador del workspace.

---

## 🔐 AUTENTICACIÓN AVANZADA

### **Invitar Usuario a la Aplicación**
```javascript
try {
  await base44.auth.inviteUser('newuser@example.com', 'user');
  console.log('Invitación enviada!');
} catch (error) {
  console.error('Error al enviar invitación:', error);
}
```

### **Verificar OTP (One-Time Password)**
```javascript
try {
  await base44.auth.verifyOtp({
    email: 'user@example.com',
    otpCode: '123456'
  });
  console.log('Email verificado!');
} catch (error) {
  console.error('Código OTP inválido o expirado');
}
```

### **Reenviar OTP**
```javascript
try {
  await base44.auth.resendOtp('user@example.com');
  console.log('OTP reenviado! Revisa tu email.');
} catch (error) {
  console.error('Error al reenviar OTP:', error);
}
```

### **Cambiar Contraseña (Usuario Autenticado)**
```javascript
try {
  await base44.auth.changePassword({
    userId: user.id,
    currentPassword: 'oldPassword123',
    newPassword: 'newSecurePassword456'
  });
  console.log('Contraseña cambiada exitosamente!');
} catch (error) {
  console.error('Error al cambiar contraseña:', error);
}
```

### **Login con Microsoft**
```javascript
// Redirige a Microsoft OAuth
base44.auth.loginWithProvider('microsoft', window.location.pathname);
```

### **Login con Facebook**
```javascript
// Redirige a Facebook Login
base44.auth.loginWithProvider('facebook', window.location.pathname);
```

### **Establecer Token Manualmente**
```javascript
// Establecer token y guardarlo en localStorage
base44.auth.setToken('eyJhbGciOiJIUzI1NiIs...', true);

// Establecer token sin guardarlo
base44.auth.setToken('eyJhbGciOiJIUzI1NiIs...', false);
```

---

## 📝 NOTAS IMPORTANTES

### **Límites**
- Máximo 5000 registros por request en `list()` y `filter()`
- Para más registros, usar paginación
- Emails personalizados usan 2 créditos (emails estándar usan 1)

### **Service Role**
- Solo disponible en funciones backend de Base44
- No disponible en aplicaciones externas
- Proporciona permisos de administrador
- Acceso a módulo `connectors`

### **Entidad User**
- No se puede crear con `entities.User.create()`
- Usar `auth.register()` o `auth.inviteUser()` en su lugar
- Usuarios solo pueden leer/actualizar su propio registro
- Con Service Role se puede leer/actualizar/eliminar cualquier usuario

### **Autenticación**
- Tokens se guardan automáticamente en localStorage
- `redirectToLogin()` y `logout()` solo funcionan en navegador
- Backend usa `createClientFromRequest()` para obtener contexto de usuario
- Proveedores OAuth soportados: Google (default), Microsoft, Facebook

### **Analytics y Logs**
- `analytics.track()` solo funciona con usuarios autenticados
- `appLogs.logUserInApp()` funciona en todos los modos
- Los eventos aparecen en el panel de Analytics

### **Integraciones**
- **Core**: Funciones predefinidas de Base44 (IA, archivos, emails)
- **Custom**: APIs externas configuradas por administrador
- **Conectores**: Tokens OAuth para llamar APIs directamente

### **Archivos**
- `UploadFile()`: Archivo público, URL permanente
- `UploadPrivateFile()`: Archivo privado, requiere URL firmada
- URLs firmadas expiran (default: 2 horas)
- `importEntities()`: Solo funciona en navegador, no en backend

---

## 🚀 MEJORES PRÁCTICAS

### **Naming Conventions**
```javascript
// ✅ BIEN: Nombres descriptivos en snake_case
base44.analytics.track({ eventName: 'purchase_completed' });
base44.analytics.track({ eventName: 'signup_button_click' });

// ❌ MAL: Nombres genéricos
base44.analytics.track({ eventName: 'click' });
base44.analytics.track({ eventName: 'event1' });
```

### **Manejo de Errores Robusto**
```javascript
import { Base44Error } from "@base44/sdk";

try {
  const result = await base44.entities.Orden.create(orderData);
} catch (error) {
  if (error instanceof Base44Error) {
    // Error de Base44
    if (error.status === 401) {
      // No autenticado
      base44.auth.redirectToLogin(window.location.href);
    } else if (error.status === 403) {
      // Sin permisos
      alert('No tienes permisos para realizar esta acción');
    } else if (error.status === 404) {
      // No encontrado
      alert('Recurso no encontrado');
    } else {
      // Otro error de API
      console.error('Error de API:', error.message);
    }
  } else {
    // Error inesperado
    console.error('Error inesperado:', error);
  }
}
```

### **Optimización de Queries**
```javascript
// ❌ MAL: Múltiples queries secuenciales
const productos = await base44.entities.Producto.filter({ id_comercio });
const ordenes = await base44.entities.Orden.filter({ id_comercio });
const clientes = await base44.entities.Cliente.filter({ id_comercio });

// ✅ BIEN: Queries en paralelo
const [productos, ordenes, clientes] = await Promise.all([
  base44.entities.Producto.filter({ id_comercio }),
  base44.entities.Orden.filter({ id_comercio }),
  base44.entities.Cliente.filter({ id_comercio })
]);
```

### **Seguridad en Backend**
```typescript
// ✅ BIEN: Validar autenticación y permisos
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Validar autenticación
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // Validar permisos
  const { id_comercio, productoId } = await req.json();
  const producto = await base44.asServiceRole.entities.Producto.get(productoId);
  
  if (producto.id_comercio !== id_comercio) {
    return Response.json({ error: 'Sin permisos' }, { status: 403 });
  }
  
  // Continuar con lógica...
});
```

---

**📌 NOTA:** Este documento debe actualizarse cuando se descubran nuevos patrones o mejores prácticas.
