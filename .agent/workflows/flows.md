---
description: flujo de Los 3 tipos de usuarios
---

USUARIO ENTRA AL LINK
       │
       ▼
  ¿Es Admin? ──SÍ──→ /admin-panel-supremo
       │
      NO
       ▼
  Home (Landing) 
  [REGISTRO] y [INGRESAR]
       │
       ├── REGISTRO (primera vez):
       │   1. Llena formulario (nombre, email, contraseña, datos comercio)
       │   2. Aprieta REGISTRO
       │   3. Se verifica con Google Auth
       │   4. Se genera user_id + id_comercio
       │   5. Se guarda TODO en BD (datos + contraseña hasheada)
       │   6. Recarga página
       │
       └── INGRESAR (ya registrado):
           1. Escribe email + contraseña
           2. Aprieta INGRESAR
           3. Verifica contraseña contra BD
           4. Verifica Google Auth
           5. Si AMBAS pasan → /dashboard-comercio
           6. Si alguna falla → error
