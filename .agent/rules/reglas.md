---
trigger: always_on
---

Contexto

En este proyecto de plataforma multicomercio, estilo multitenacy, se implementaron muchas logicas y tipo de soluciones a problemas que jamas se solucionaron.
Basicamente por que es una plataforma q va a correrse desde los servidores de base44 y debe respetar ciertos parametros.

El objetivos es escribir logica de flujo validaciones y posteriormente de marketing para los 3 diferentes tipos de usuarios:
cliente 
comercio
supremo

Para realizar la tarea objetivo el agente debe esperar mis indicaciones. 
Y realizar cada una de ellas siguendo esta lista de reglas.

1- Leer siempre todo el archivo reglas.md y realizar la indicacion respetando estrictamente el archivo reglas.md.

2- No trabajar ni realizar tareas q no tengan relacion con la indicacion escrita en el chat.

3- El Agente NO puede modificar, borrar ni alterar el código de los siguientes archivos núcleo, toda la logica escrita y propuesta por el agente para responder a las indicaciones dadas en el chat, deberan ser escritas respetando las cnfiguraciones de estos archivos nucleo, que vuelvo a repetir no pueden modificarce ni cambiarce.

- **API:** `base44Client.js`
- **Hooks:** `use-mobile.jsx`
- **Lib:** `app-params.js`, `AuthContext.jsx`, `NavigationTracker.jsx`, `PageNotFound.jsx`, `query-client.js`, `utils.js`
- **Raíz y Config:** `App.jsx`, `Layout.jsx`, `main.jsx`, `pages.config.js`, `tailwind.config.js`, `vite.config.js`, `package.json`, `jsconfig.json`.

4- Es imperativo y obligatorio q las src/pages respeten el archivo pages.config.js

5- De los Archivos src/pages y src/components solo debe mantenerce el codigo visual y estructural de la pagina.Y Nombres de entities todo lo q no sea logica de flujo debe respetarce 
Todas las indicaciones y peticiones por el chat deven ser desarrolladas en node.js 
usar React + JavaScript/JSX con Tailwind CSS y shadcn/ui, que es el stack que Base44 maneja internamente. Y deben realizarce y distribuirce en estos dos tipo de archivos pages y componentes .
Utilizando SRC/COMPONENTS/UI existentes.

6- Para q para rescribir toda la logica y toda la funcionalidad de la app en el fronted (src/pages ----src/components ---) 
haciendo uso de las ui existentes.
Vamos a tener en cuenta lo siguiente ademas de todas las reglas anteriores:
src/pages logica de muestreo y flujo del usuario y de datos.
src/componentes logica de validaciones y seguridad de la appa ( siempre haciendo lectura a las herramientas proporcionadas en los archivos intocables del punto 3 )
utilizar ui SEGUN CONTEXTOS Y PREVIA LECTURA DE LA MISMAS siempre antes de realizar una peticion previa escritura del codigo revisar compilacion con ui.

7-No implementies cambio siempre mostrar y desarrollar una breve explicacion de lo q se va a hacer.

8- Simpre realizar codigo compatible con el archivo Entities Schema

9- para realizar un codigo y que este pueda ser corrido en servidores de base44 debe cumplir con los siguiente requisisto:

Estructura de código Base44 (según Project Structure):
src/
  pages/       → Cada archivo es una ruta (Home.jsx → /, Settings.jsx → /settings)
  components/  → Componentes reutilizables (ui/ para componentes pre-built)
  api/         → Configuración del SDK Base44
  hooks/       → Custom React hooks
  lib/         → Configuración e integración Base44
  utils/       → Funciones utilitarias
entities/      → Schemas JSON de entidades
functions/     → Backend functions (TypeScript/Deno)
Prompt para las rules de tu agente en GitHub (Cursor, Copilot, etc.):
# Base44 Coding Rules

## Tech Stack
- React con React Router
- Vite para builds
- Tailwind CSS para estilos
- shadcn/ui como librería de componentes
- Base44 SDK (@base44/sdk) para backend

## Estructura de archivos
- `src/pages/` → Cada archivo JSX es una página/ruta. Home.jsx = /, Settings.jsx = /settings
- `src/components/` → Componentes reutilizables. `ui/` para componentes base (shadcn)
- `src/components/` → Componentes de negocio específicos de la app
- `src/api/` → Solo configuración del cliente Base44 SDK
- `src/hooks/` → Custom hooks para estado y lógica de UI
- `src/lib/` → Configuración de Base44 y app
- `src/utils/` → Funciones helper puras
- `entities/` → Schemas JSON de entidades (no código React)
- `functions/` → Backend functions en TypeScript (runtime Deno)

## Reglas de código

### Pages
- Toda la lógica de negocio y orquestación va en pages
- Cada page importa componentes, hooks y llama al SDK
- Las pages manejan el estado principal y pasan props a componentes
- Ejemplo: `const productos = await base44.entities.Producto.list()`

### Components
- Deben ser reutilizables y sin lógica de negocio
- Reciben datos por props, no llaman al SDK directamente
- Usar Tailwind CSS para estilos, nunca CSS modules ni styled-components
- Usar componentes de shadcn/ui como base

### SDK Base44
- Importar siempre desde: `import { base44 } from "@/api/base44Client"`
- CRUD: `.create()`, `.list()`, `.filter()`, `.get()`, `.update()`, `.delete()`
- Auth: `base44.auth.me()` para obtener usuario actual
- Integraciones: `base44.integrations.Core.InvokeLLM()`, `.UploadFile()`, etc.
- NO crear endpoints REST propios, usar el SDK

### Backend Functions
- Usar `import { createClientFromRequest } from "npm:@base44/sdk"`
- Runtime Deno, no Node.js
- Service role para operaciones admin: `base44.asServiceRole.entities.X.list()`

### Convenciones
- Archivos JSX para componentes React
- PascalCase para componentes y pages
- camelCase para hooks, utils y variables
- Nunca hardcodear IDs o credenciales
- RLS maneja la seguridad de datos, no filtrar manualmente por usuario en el código
- No crear lógica de autenticación propia, usar base44.auth
También puedes conectar el MCP de Base44 Docs:
Según la documentación, puedes dar a tu agente de IA acceso directo a la documentación de Base44 agregando esto a tu configuración MCP:

{
  "mcpServers": {
    "base44-docs": {
      "type": "http",
      "url": "https://docs.base44.com/mcp"
    }
  }
}
Esto permite que Cursor, Claude Desktop o VS Code consulten la documentación de Base44 en tiempo real mientras codifican.