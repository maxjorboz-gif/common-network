// @ts-nocheck

/* ======================================================
   FORCE_WIPE — CONSTITUCIÓN DEL SISTEMA
   ESTE ARCHIVO NO ES CÓDIGO EJECUTABLE
   ====================================================== */

/* ======================================================
   CARRITO — FUENTE DE VERDAD
   ======================================================
REGLA:
- El carrito es CLIENT-FIRST.

IMPLICANCIAS:
- El frontend es la única fuente del estado del carrito.
- El backend:
  - valida
  - confirma
  - cobra

PROHIBICIÓN:
- El backend NUNCA es fuente del estado del carrito.
*/

/* ======================================================
   FUNCTIONS (DENO) — AUTORIDAD
   ======================================================
Las funciones se separan FÍSICAMENTE por nivel de autoridad.

Estructura esperada:
- functions/public/
  - sin auth o auth mínima
  - nunca muta estado crítico

- functions/commerce/
  - requiere token de comercio
  - muta solo estado del comercio propio

- functions/superadmin/
  - requiere token supremo
  - operaciones globales

PROHIBICIÓN:
- Una función no puede escalar autoridad.
*/

/* ======================================================
   FRONTEND — RESPONSABILIDADES
   ======================================================
AuthContext:
- Es la única fuente del estado de autenticación del comercio.
- No hace fetch manual.
- No mezcla SDKs.
- El token define la sesión.

Layout:
- Renderiza UI.
- No decide seguridad.
- No valida tokens.

Landing Page:
- Dominio comprador exclusivamente.
- No depende de auth.
- Solo lectura pública.
*/

/* ======================================================
   ENTIDADES — BASE44
   ======================================================

   Lista oficial de entidades soportadas por el sistema.
   Esta lista es la ÚNICA válida para operaciones de limpieza o mantenimiento.
*/

/* ESQUEMA OFICIAL: COMERCIO */
interface Comercio {
    nombre: string;              // REQUIRED
    commerce_code: string;       // REQUIRED
    nombre_usuario: string;
    user_id?: string;
    password?: string;
    estado_registro: "borrador" | "pendiente_pago" | "pendiente_aprobacion" | "activo" | "rechazado"; // default: "borrador"
    numero_operacion?: string;
    slug?: string;
    logo_url?: string;
    descripcion?: string;
    whatsapp_negocio?: string;
    email_negocio?: string;
    direccion?: string;
    ciudad?: string;
    plan: "bronce" | "plata" | "oro"; // default: "bronce"
    comision_porcentaje: number;      // default: 5
    activo: boolean;                  // default: false
    meta_pixel_id?: string;
    meta_dataset_id?: string;
    meta_access_token?: string;
    meta_test_event_code?: string;
    total_ventas: number;             // default: 0
    total_ordenes: number;            // default: 0
    configuracion_avanzada?: {
        usa_capi: boolean;              // default: true
    };
}

/* ESQUEMA OFICIAL: CLIENTE */
interface Cliente {
    // Identificadores y Contacto
    google_id?: string;
    email: string; // REQUIRED
    email_hash?: string; // SHA256 (Meta CAPI: em)
    whatsapp: string; // REQUIRED
    whatsapp_hash?: string; // SHA256 (Meta CAPI: ph)
    telefono_entrega?: string;
    telefono_entrega_hash?: string; // SHA256 (Meta CAPI: ph)

    // Datos Personales
    nombre_completo: string; // REQUIRED (Meta CAPI: fn/ln)
    nombre_hash?: string; // SHA256
    apellido_hash?: string; // SHA256

    // Ubicación Geo
    ciudad?: string; // (Meta CAPI: ct)
    ciudad_hash?: string; // SHA256
    provincia_estado?: string; // (Meta CAPI: st)
    provincia_hash?: string; // SHA256
    pais?: string; // default: "AR" (Meta CAPI: country)
    pais_hash?: string; // SHA256
    direccion?: string;
    codigo_postal?: string; // (Meta CAPI: zp)
    codigo_postal_hash?: string; // SHA256

    // Tracking Meta Advanced
    fbp?: string; // _fbp
    fbc?: string; // fbclid

    // Atribución de Negocio
    lead_source_original?: "google_ads" | "meta_ads" | "organico" | "referido" | "directo";
    referido_por?: string; // ID Cliente

    // Métricas y Scoring IA
    puntuacion_ltv: number; // default: 0 (Meta LTV)
    cross_store_trust_score: number; // default: 50 (1-100)
    perfil_comprador: "visual_emocional" | "tecnico_racional" | "buscador_precio" | "indefinido"; // default: "indefinido"
    total_compras: number; // default: 0
    total_gastado: number; // default: 0
}

const ENTITIES = [
    "AtributoProducto",
    "Carrito",
    "Cliente",
    "Comercio",
    "ConfiguracionComercio",
    "Cupon",
    "EventoMeta",
    "GastoPublicitario",
    "Lead",
    "Logs_Configuracion",
    "Orden",
    "Producto",
    "Resena"
];

/* ======================================================
   PRINCIPIO FINAL
   ======================================================
   El sistema no se rompe por bugs.
   Se rompe por ambigüedad permitida.

   Si algo no está declarado aquí:
   → Está prohibido.
*/
