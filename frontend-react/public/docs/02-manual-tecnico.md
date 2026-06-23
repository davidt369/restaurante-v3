# 🔧 Manual Técnico — Sistema de Gestión de Restaurante

> **Versión:** 1.0  
> **Fecha:** Junio 2026  
> **Proyecto:** Charquería Oruro — Sistema de Gestión de Restaurante

---

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Tecnologías Utilizadas](#2-tecnologías-utilizadas)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura de Carpetas](#4-estructura-de-carpetas)
5. [Variables de Entorno](#5-variables-de-entorno)
6. [Instalación y Configuración](#6-instalación-y-configuración)
7. [Base de Datos](#7-base-de-datos)
8. [Autenticación y Autorización](#8-autenticación-y-autorización)
9. [API REST — Endpoints](#9-api-rest--endpoints)
10. [WebSockets (Tiempo Real)](#10-websockets-tiempo-real)
11. [Frontend — Detalles Técnicos](#11-frontend--detalles-técnicos)
12. [Despliegue](#12-despliegue)
13. [Testing](#13-testing)

---

## 1. Descripción General

El sistema es una aplicación web **fullstack** con arquitectura **cliente-servidor** separada en dos proyectos independientes:

| Componente | Tecnología | Puerto |
|-----------|-----------|--------|
| **Backend (API)** | NestJS + TypeScript | 3000 |
| **Frontend (SPA)** | React + Vite + TypeScript | 5173 |
| **Base de Datos** | PostgreSQL 17 | 5435 (local) / 5432 (Docker) |

La comunicación entre el frontend y el backend se realiza mediante una **API REST** (HTTP + JSON) con autenticación **JWT**. Adicionalmente, la vista de cocina se actualiza en **tiempo real** mediante **WebSocket** (Socket.IO).

---

## 2. Tecnologías Utilizadas

### 2.1 Backend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Node.js** | 22.x | Runtime de JavaScript del lado del servidor |
| **NestJS** | 11.x | Framework backend con arquitectura modular (inyección de dependencias) |
| **TypeScript** | 5.7.x | Superset tipado de JavaScript |
| **Drizzle ORM** | 0.45.x | ORM type-safe para PostgreSQL |
| **Drizzle Kit** | 0.31.x | Herramienta de migraciones y generación de esquema |
| **PostgreSQL** | 17 | Base de datos relacional |
| **pg** | 8.18.x | Driver nativo de PostgreSQL para Node.js |
| **Passport.js** | 0.7.x | Middleware de autenticación |
| **passport-jwt** | 4.0.x | Estrategia JWT para Passport |
| **passport-local** | 1.0.x | Estrategia local (usuario/contraseña) |
| **@nestjs/jwt** | 11.x | Módulo JWT para NestJS |
| **bcrypt** | 6.x | Hash de contraseñas (bcrypt) |
| **class-validator** | 0.14.x | Validación de DTOs |
| **class-transformer** | 0.5.x | Transformación de objetos |
| **Swagger** | 11.x | Documentación interactiva de la API |
| **Socket.IO** | 4.8.x | WebSocket bidireccional para tiempo real |
| **nanoid** | 5.x | Generación de IDs únicos |
| **date-fns** | 4.x | Manipulación de fechas |
| **date-fns-tz** | 3.x | Manejo de zonas horarias |

### 2.2 Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 19.2.x | Librería de UI (con React Compiler) |
| **Vite** (Rolldown) | 7.2.x | Bundler y servidor de desarrollo |
| **TypeScript** | 5.9.x | Tipado estático |
| **TailwindCSS** | 4.1.x | Framework CSS utility-first |
| **Radix UI** | 1.4.x | Componentes primitivos accesibles |
| **shadcn/ui** | — | Sistema de componentes sobre Radix UI |
| **React Router** | 7.13.x | Enrutamiento SPA |
| **React Hook Form** | 7.71.x | Gestión de formularios |
| **Zod** | 4.3.x | Validación de esquemas |
| **Axios** | 1.13.x | Cliente HTTP |
| **Recharts** | 3.8.x | Gráficos y visualizaciones |
| **Lucide React** | 0.563.x | Íconos SVG |
| **Sonner** | 2.x | Notificaciones toast |
| **Socket.IO Client** | 4.8.x | Cliente WebSocket |
| **jsPDF** | 4.2.x | Generación de PDFs |
| **jspdf-autotable** | 5.0.x | Tablas en PDFs |
| **Driver.js** | 1.4.x | Tours guiados interactivos |
| **date-fns** | 4.x | Formateo de fechas |
| **next-themes** | 0.4.x | Modo claro/oscuro |

### 2.3 Testing

| Tecnología | Componente | Propósito |
|-----------|-----------|-----------|
| **Jest** | Backend | Tests unitarios |
| **Vitest** | Frontend | Tests unitarios |
| **Testing Library** | Frontend | Tests de componentes React |
| **MSW** | Frontend | Mock de APIs en tests |
| **Playwright** | Frontend | Tests end-to-end |
| **Supertest** | Backend | Tests de endpoints HTTP |

### 2.4 DevOps / Infraestructura

| Tecnología | Propósito |
|-----------|-----------|
| **Docker / Docker Compose** | Contenedorización para desarrollo |
| **Railway** | Despliegue del backend (PaaS) |
| **Vercel** | Despliegue del frontend (SPA) |
| **Neon** | Base de datos PostgreSQL en la nube (alternativa) |
| **ESLint** | Linter de código |
| **Prettier** | Formateador de código |

---

## 3. Arquitectura del Sistema

### 3.1 Diagrama de Arquitectura General

```mermaid
graph TD
    subgraph CLIENTE["🖥️ Cliente — Browser"]
        fe["React + Vite + TailwindCSS\nDesplegado en Vercel · Puerto 5173 dev"]
    end

    subgraph SERVIDOR["⚙️ Servidor — API REST"]
        api["NestJS + TypeScript\nDesplegado en Railway · Puerto 3000"]
        mods["Auth · Usuarios · Caja · Productos\nIngredientes · Platos · Transacciones · Cocina WS"]
        orm["Drizzle ORM — Type-safe queries"]
        api --> mods --> orm
    end

    DB[("🗄️ PostgreSQL 17\nDocker dev / Neon prod")]

    fe -- "HTTP/REST (Axios)" --> api
    fe -- "WebSocket (Socket.IO)" --> api
    orm -- "TCP/5432" --> DB
```

### 3.2 Patrón de Arquitectura

El backend sigue el patrón de arquitectura **modular de NestJS**:

```mermaid
graph LR
    C["Controller\nHTTP Layer\nDTOs · Guards · Decorators"] --> S["Service\nBusiness Logic\nValidation"]
    S --> O["Drizzle ORM"] --> DB[("PostgreSQL")]
```

- **Controllers:** Reciben las peticiones HTTP, validan los DTOs y delegan al servicio.
- **Services:** Contienen la lógica de negocio y la interacción con la base de datos.
- **DTOs:** Data Transfer Objects que definen y validan la estructura de los datos de entrada.
- **Guards:** Middleware de autorización (JWT + Roles).
- **Decorators:** Extractores de datos del request (ej: `@CurrentUser()`).

### 3.3 Flujo de una Petición

```mermaid
flowchart LR
    A["1 Cliente HTTP Request\nPOST /api/transacciones"] --> B["2 Middleware global\nCORS · ValidationPipe"]
    B --> C["3 Guard JWT\nVerifica token"]
    C --> D["4 Guard Roles\nVerifica rol"]
    D --> E["5 Controller\nValida DTO"]
    E --> F["6 Service\nLógica de negocio"]
    F --> G["7 Drizzle ORM\nQuery SQL"]
    G --> H[("8 PostgreSQL\nRetorna datos")]
    H --> I["9 Interceptor\nFormatea fechas Bolivia"]
    I --> J["10 Response JSON"]
```

---

## 4. Estructura de Carpetas

### 4.1 Backend (`backend-nestjs/`)

```
backend-nestjs/
├── .env                          # Variables de entorno (desarrollo)
├── drizzle.config.ts             # Configuración de Drizzle Kit
├── nest-cli.json                 # Configuración de NestJS CLI
├── nixpacks.toml                 # Config para Railway (Nixpacks)
├── railway.json                  # Configuración de despliegue Railway
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración de TypeScript
│
├── drizzle/                      # Migraciones generadas por Drizzle Kit
│   ├── 0000_*.sql
│   └── meta/
│
├── scripts/
│   └── setup.js                  # Script de setup inicial
│
├── src/
│   ├── main.ts                   # Punto de entrada (Bootstrap NestJS)
│   ├── app.module.ts             # Módulo raíz de la aplicación
│   ├── db.ts                     # Conexión a la base de datos
│   │
│   ├── common/
│   │   ├── interceptors/
│   │   │   └── date-formatter.interceptor.ts  # Formatea fechas a zona Bolivia
│   │   └── utils/
│   │
│   ├── db/
│   │   ├── schema.ts             # Esquema de BD con Drizzle ORM
│   │   ├── db.sql                # Script SQL de referencia
│   │   └── scripts/
│   │       ├── seed.ts           # Seeder (datos iniciales)
│   │       ├── reset.ts          # Resetear la BD
│   │       ├── check-user.ts     # Verificar usuario existente
│   │       └── test-login.ts     # Probar login
│   │
│   ├── drizzle/
│   │   └── drizzle.module.ts     # Módulo de inyección de Drizzle
│   │
│   └── modules/
│       ├── auth/
│       ├── usuarios/
│       ├── productos/
│       ├── ingredientes/
│       ├── platos/
│       ├── transacciones/
│       ├── caja/
│       ├── dashboard/
│       └── reportes/
│
└── test/                         # Tests e2e
```

### 4.2 Frontend (`frontend-react/`)

```
frontend-react/
├── .env                          # Variables de entorno
├── index.html                    # Punto de entrada HTML
├── vite.config.ts                # Configuración de Vite
├── package.json                  # Dependencias y scripts
│
├── public/
│   └── docs/                     # Documentación (markdown)
│
├── src/
│   ├── main.tsx                  # Punto de entrada React
│   ├── App.tsx                   # Componente raíz (Router + Auth)
│   ├── index.css                 # Estilos globales + TailwindCSS
│   │
│   ├── components/
│   │   ├── app-header.tsx
│   │   ├── app-sidebar.tsx
│   │   └── ui/                   # Componentes shadcn/ui
│   │
│   ├── layouts/
│   │   └── dashboard-layout.tsx
│   │
│   ├── pages/
│   │   ├── home-page.tsx
│   │   ├── dashboard-page.tsx
│   │   └── documentacion-page.tsx
│   │
│   └── modules/
│       ├── auth/
│       ├── usuarios/
│       ├── productos/
│       ├── ingredientes/
│       ├── platos/
│       ├── transacciones/
│       ├── caja/
│       ├── cocina/
│       └── tours/
```

---

## 5. Variables de Entorno

### 5.1 Backend (`backend-nestjs/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (mín. 64 caracteres) | `eb3de7029fe912...` |
| `JWT_EXPIRATION` | Duración del token JWT | `24h` |
| `TZ` | Zona horaria del servidor | `America/La_Paz` |
| `FRONTEND_URL` | URL del frontend (para CORS) | `http://localhost:5173/` |
| `PORT` | Puerto del servidor (opcional, default: 3000) | `3000` |

> ⚠️ **Importante:** En producción, `DATABASE_URL` debe apuntar al servidor de PostgreSQL remoto y `JWT_SECRET` debe ser una clave aleatoria segura.

### 5.2 Frontend (`frontend-react/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API REST del backend | `http://localhost:3000/api` (dev) o `https://backend-restaurante-production.up.railway.app/api` (prod) |

---

## 6. Instalación y Configuración

### 6.1 Prerrequisitos

- **Node.js** 22.x o superior
- **npm** 10.x o superior
- **PostgreSQL** 17 (local o Docker)
- **Docker** y **Docker Compose** (opcional, recomendado)
- **Git**

### 6.2 Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd restaurante-v2
```

### 6.3 Instalación del Backend

```bash
cd backend-nestjs

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con las credenciales de tu PostgreSQL local

# Opción A: Con Docker (recomendado)
npm run dev
# Esto levanta PostgreSQL + NestJS con Docker Compose

# Opción B: Sin Docker (PostgreSQL local)
npm run start:dev
```

### 6.4 Migraciones y Datos Iniciales

```bash
# Generar migraciones desde el esquema
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Insertar datos iniciales (usuarios admin y cajero)
npm run db:seed

# Todo junto (reset + generate + migrate + seed)
npm run db:fresh
```

### 6.5 Instalación del Frontend

```bash
cd frontend-react

# Instalar dependencias
npm install

# Configurar la URL de la API en .env
# VITE_API_URL=http://localhost:3000/api

# Iniciar servidor de desarrollo
npm run dev
```

### 6.6 Verificación

1. Backend: Abrir `http://localhost:3000/api` → Se muestra la documentación Swagger.
2. Frontend: Abrir `http://localhost:5173` → Se muestra la página de inicio.
3. Login con: `admin / Admin123!`

### 6.7 Scripts Disponibles

#### Backend

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start:dev` | `npm run start:dev` | Servidor de desarrollo con hot-reload |
| `start:prod` | `npm run start:prod` | Servidor de producción |
| `build` | `npm run build` | Compilar a JavaScript |
| `dev` | `npm run dev` | Docker Compose (todo incluido) |
| `db:generate` | `npm run db:generate` | Generar migraciones |
| `db:migrate` | `npm run db:migrate` | Ejecutar migraciones |
| `db:push` | `npm run db:push` | Push directo al esquema (sin migración) |
| `db:seed` | `npm run db:seed` | Insertar datos iniciales |
| `db:fresh` | `npm run db:fresh` | Reset completo + migraciones + seed |
| `db:studio` | `npm run db:studio` | Abrir Drizzle Studio (GUI de BD) |
| `db:reset` | `npm run db:reset` | Eliminar todas las tablas |
| `test` | `npm run test` | Ejecutar tests unitarios |
| `lint` | `npm run lint` | Ejecutar ESLint |

#### Frontend

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `npm run dev` | Servidor de desarrollo Vite |
| `build` | `npm run build` | Build de producción |
| `preview` | `npm run preview` | Preview del build |
| `test` | `npm run test` | Tests unitarios con Vitest |
| `test:run` | `npm run test:run` | Tests en modo CI |
| `test:e2e` | `npm run test:e2e` | Tests end-to-end con Playwright |
| `lint` | `npm run lint` | Ejecutar ESLint |

---

## 7. Base de Datos

### 7.1 Motor

- **PostgreSQL 17** con soporte para:
  - Campos `GENERATED ALWAYS AS ... STORED` (columnas computadas)
  - Zonas horarias (`TIMESTAMPTZ`)
  - Tipos `SERIAL`, `NUMERIC`, `DOUBLE PRECISION`

### 7.2 ORM

Se utiliza **Drizzle ORM** para:
- Definición de esquema tipada en TypeScript (`src/db/schema.ts`)
- Queries type-safe (select, insert, update, delete)
- Generación automática de migraciones SQL
- Drizzle Studio para visualización de datos

### 7.3 Convenciones de la Base de Datos

- **IDs de texto:** Las tablas principales (`usuarios`, `productos`, `ingredientes`, `platos`) usan IDs de texto con prefijo (ej: `usr_abc123`, `prod_xyz789`) generados con `nanoid`.
- **IDs seriales:** Las tablas transaccionales (`transacciones`, `detalle_items`, `pagos`, `caja_turno`, `gastos_caja`) usan `SERIAL` (autoincremental).
- **Soft Delete:** Todas las tablas incluyen un campo `borrado_en` (TIMESTAMPTZ nullable). Un registro se considera eliminado cuando `borrado_en IS NOT NULL`.
- **Auditoría:** Todas las tablas incluyen `creado_en` y `actualizado_en` con zona horaria.
- **Zona horaria:** Todos los timestamps usan `TIMESTAMPTZ` y están configurados para `America/La_Paz`.

### 7.4 Relaciones Principales

```mermaid
erDiagram
    USUARIOS ||--o{ CAJA_TURNO : "abre"
    USUARIOS ||--o{ TRANSACCIONES : "crea"
    USUARIOS ||--o{ PAGOS : "registra"
    USUARIOS ||--o{ GASTOS_CAJA : "registra"

    CAJA_TURNO ||--o{ GASTOS_CAJA : "contiene"
    CAJA_TURNO ||--o{ TRANSACCIONES : "agrupa"

    TRANSACCIONES ||--o{ DETALLE_ITEMS : "incluye"
    TRANSACCIONES ||--o{ PAGOS : "recibe"

    DETALLE_ITEMS ||--o{ DETALLE_ITEM_EXTRAS : "tiene"

    PRODUCTOS ||--o{ DETALLE_ITEMS : "referenciado en"
    PLATOS ||--o{ DETALLE_ITEMS : "referenciado en"
    PLATOS }o--o{ INGREDIENTES : "receta via plato_ingredientes"
    INGREDIENTES ||--o{ DETALLE_ITEM_EXTRAS : "referenciado en"
```

---

## 8. Autenticación y Autorización

### 8.1 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API NestJS
    participant DB as PostgreSQL

    C->>API: POST /api/auth/login {nombre_usuario, contrasena}
    API->>DB: Busca usuario por nombre_usuario
    DB-->>API: Retorna usuario con hash bcrypt
    API->>API: bcrypt.compare(contrasena, hash)
    API->>API: Genera JWT con payload {sub, nombre_usuario, rol}
    API-->>C: {access_token, usuario}
    Note over C: Almacena token en localStorage
    C->>API: GET /api/... Authorization: Bearer token
    API->>API: JwtStrategy valida token
    API->>API: RolesGuard verifica rol
    API-->>C: Response JSON
```

### 8.2 Estrategias de Passport

| Estrategia | Archivo | Uso |
|-----------|---------|-----|
| **LocalStrategy** | `auth/strategies/local.strategy.ts` | Validación de login (usuario/contraseña) |
| **JwtStrategy** | `auth/strategies/jwt.strategy.ts` | Validación de token JWT en cada request |

### 8.3 Guards

| Guard | Descripción |
|-------|-------------|
| `AuthGuard('local')` | Se aplica solo al endpoint de login |
| `AuthGuard('jwt')` | Se aplica a todos los endpoints protegidos |
| `RolesGuard` | Verifica el rol del usuario (usa decorador `@Roles()`) |

### 8.4 Decoradores Personalizados

| Decorador | Descripción |
|-----------|-------------|
| `@Roles('admin', 'cajero')` | Define los roles permitidos para un endpoint |
| `@CurrentUser()` | Extrae el usuario autenticado del request |
| `@CurrentUser('id')` | Extrae solo el ID del usuario autenticado |

### 8.5 Hash de Contraseñas

- Algoritmo: **bcrypt**
- Salt Rounds: **10**
- Las contraseñas nunca se retornan en las respuestas de la API.

---

<a name="9-api-rest--endpoints"></a>
## 9. API REST — Endpoints

### Prefijo Global: `/api`

### Documentación Swagger: `GET /api`

La documentación interactiva Swagger está disponible en la ruta `/api` del backend y permite probar todos los endpoints directamente.

### 9.1 Autenticación

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/auth/login` | Iniciar sesión | Público |
| `GET` | `/api/auth/profile` | Obtener perfil del usuario | Autenticado |
| `GET` | `/api/auth/test-admin` | Endpoint de prueba para admins | admin |

### 9.2 Usuarios

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/usuarios` | Crear nuevo usuario | admin |
| `GET` | `/api/usuarios` | Listar todos los usuarios | admin |
| `GET` | `/api/usuarios/:id` | Obtener usuario por ID | admin |
| `PUT` | `/api/usuarios/:id` | Actualizar usuario | admin |
| `DELETE` | `/api/usuarios/:id` | Eliminar usuario (soft) | admin |

### 9.3 Productos

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/productos` | Crear producto | admin |
| `GET` | `/api/productos` | Listar productos | Autenticado |
| `GET` | `/api/productos/:id` | Obtener producto por ID | Autenticado |
| `PATCH` | `/api/productos/:id` | Actualizar producto | admin |
| `DELETE` | `/api/productos/:id` | Eliminar producto (soft) | admin |

### 9.4 Ingredientes

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/ingredientes` | Crear ingrediente | admin |
| `GET` | `/api/ingredientes` | Listar ingredientes | Autenticado |
| `GET` | `/api/ingredientes/:id` | Obtener ingrediente por ID | Autenticado |
| `PATCH` | `/api/ingredientes/:id` | Actualizar ingrediente | admin |
| `DELETE` | `/api/ingredientes/:id` | Eliminar ingrediente (soft) | admin |

### 9.5 Platos

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/platos` | Crear plato | admin |
| `GET` | `/api/platos` | Listar platos | Autenticado |
| `GET` | `/api/platos/:id` | Obtener plato por ID | Autenticado |
| `PATCH` | `/api/platos/:id` | Actualizar plato | admin |
| `DELETE` | `/api/platos/:id` | Eliminar plato (soft) | admin |
| `POST` | `/api/platos/:id/ingredientes` | Agregar ingrediente al plato | admin |
| `GET` | `/api/platos/:id/ingredientes` | Obtener ingredientes del plato | Autenticado |
| `PATCH` | `/api/platos/:id/ingredientes/:ingredienteId` | Actualizar cantidad de ingrediente | admin |
| `DELETE` | `/api/platos/:id/ingredientes/:ingredienteId` | Remover ingrediente del plato | admin |

### 9.6 Transacciones

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/transacciones` | Crear nueva transacción | Autenticado |
| `GET` | `/api/transacciones` | Listar transacciones activas | Autenticado |
| `GET` | `/api/transacciones/:id` | Obtener transacción por ID | Autenticado |
| `PATCH` | `/api/transacciones/:id` | Actualizar transacción | Autenticado |
| `DELETE` | `/api/transacciones/:id` | Eliminar transacción (soft) | admin, cajero |
| `POST` | `/api/transacciones/:id/reabrir` | Reabrir transacción cerrada | Autenticado |
| `GET` | `/api/transacciones/caja/:cajaId` | Transacciones por caja | Autenticado |
| `GET` | `/api/transacciones/caja/:cajaId/resumen` | Resumen de items por caja | Autenticado |
| `GET` | `/api/transacciones/caja/:cajaId/items-eliminados` | Items eliminados por caja | Autenticado |
| `GET` | `/api/transacciones/caja/:cajaId/ventas-detalladas` | Ventas detalladas por caja | Autenticado |
| `GET` | `/api/transacciones/cocina/pendientes` | Pedidos pendientes en cocina | Autenticado |
| `PATCH` | `/api/transacciones/:id/cocina/completar` | Completar pedido de cocina | Autenticado |

### 9.7 Items de Transacción

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/transacciones/:id/items` | Agregar item | Autenticado |
| `GET` | `/api/transacciones/:id/items` | Listar items | Autenticado |
| `DELETE` | `/api/transacciones/:id/items/:itemId` | Eliminar item | Autenticado |

### 9.8 Extras de Items

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/transacciones/:id/items/:itemId/extras` | Agregar extra | Autenticado |
| `GET` | `/api/transacciones/:id/items/:itemId/extras` | Listar extras | Autenticado |
| `DELETE` | `/api/transacciones/:id/items/:itemId/extras/:extraId` | Eliminar extra | Autenticado |

### 9.9 Pagos

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/transacciones/:id/pagos` | Registrar pago | Autenticado |
| `GET` | `/api/transacciones/:id/pagos` | Listar pagos | Autenticado |

### 9.10 Caja

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/api/caja/abrir` | Abrir caja del día | admin, cajero |
| `GET` | `/api/caja/actual` | Obtener caja abierta actual | admin, cajero |
| `GET` | `/api/caja/:id/detalle` | Detalle completo de una caja | admin, cajero |
| `POST` | `/api/caja/gastos` | Registrar gasto | admin, cajero |
| `GET` | `/api/caja/resumen` | Resumen para cierre | admin, cajero |
| `GET` | `/api/caja/gastos/historial` | Historial de gastos | admin, cajero |
| `POST` | `/api/caja/cerrar` | Cerrar caja | admin, cajero |
| `GET` | `/api/caja/historial` | Historial de cajas cerradas | admin, cajero |

### 9.11 Dashboard

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/dashboard/stats` | Estadísticas del período | admin, cajero |
| `GET` | `/api/dashboard/rendimiento-diario` | Datos para gráfico de rendimiento | admin, cajero |
| `GET` | `/api/dashboard/metodos-pago` | Distribución por método de pago | admin, cajero |
| `GET` | `/api/dashboard/top-items` | Top items más vendidos | admin, cajero |

---

## 10. WebSockets (Tiempo Real)

### 10.1 Gateway

El gateway de WebSocket está implementado en `transacciones/cocina.gateway.ts` usando **Socket.IO** y **NestJS WebSockets**.

### 10.2 Eventos

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `nuevo-pedido` | Servidor → Cliente | Nuevo pedido enviado a cocina |
| `pedido-completado` | Cliente → Servidor | Cocina marca pedido como terminado |
| `pedido-actualizado` | Servidor → Cliente | Notificación de actualización de estado |

### 10.3 Flujo WebSocket

```mermaid
sequenceDiagram
    participant CA as Cajero (Frontend)
    participant API as NestJS API
    participant COC as Cocina (Frontend)

    COC->>API: Conecta WebSocket (Socket.IO)
    CA->>API: POST /api/transacciones/:id/items
    API-->>COC: Emite: nuevo-pedido {transaccionId, items}
    Note over COC: Muestra pedido en pantalla en tiempo real
    COC->>API: PATCH /api/transacciones/:id/cocina/completar
    API-->>CA: Emite: pedido-completado {transaccionId}
    Note over CA: Notificación: Pedido listo para entregar
```

---

<a name="11-frontend--detalles-técnicos"></a>
## 11. Frontend — Detalles Técnicos

### 11.1 Enrutamiento

React Router v7 con lazy loading de todas las páginas. Rutas protegidas por `ProtectedRoute` que verifica autenticación y rol.

### 11.2 Gestión de Estado

- **Contexto de Auth:** `AuthProvider` con `useContext` para el estado global de autenticación.
- **Estado local:** `useState` + `useReducer` en cada módulo.
- **Formularios:** React Hook Form + Zod para validación.

### 11.3 Llamadas a la API

Axios con interceptors para:
- Inyectar el token JWT automáticamente en cada request.
- Interceptar respuestas 401 y redirigir al login.

### 11.4 Tema Claro/Oscuro

`next-themes` con `ThemeProvider` gestiona el tema. Detecta la preferencia del sistema y permite cambio manual.

---

## 12. Despliegue

### 12.1 Configuración de Producción

```mermaid
graph TD
    FE["🌐 Frontend — Vercel\nhttps://charqueria-oruro.vercel.app\nSPA desde CDN global\nSSL automático · Deploy con Git"]
    BE["⚙️ Backend — Railway\nNestJS · Node.js 22\n1 réplica · Restart on failure"]
    DB[("🗄️ Base de Datos — Neon\nPostgreSQL 17 serverless\nSSL requerido · us-east-1\nConnection pooler")]

    FE -- "HTTPS + WebSocket" --> BE
    BE -- "SSL/TLS" --> DB
```

### 12.2 Variables de Entorno en Producción

**Backend (Railway):**

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://...@....neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `<clave-secreta-de-64+-caracteres>` |
| `JWT_EXPIRATION` | `24h` |
| `TZ` | `America/La_Paz` |
| `FRONTEND_URL` | `https://charqueria-oruro.vercel.app` |

**Frontend (Vercel):**

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://backend-restaurante-production.up.railway.app/api` |

### 12.3 Comandos de Despliegue

```bash
# Frontend — Vercel (automático con Git push)
git push origin main

# Backend — Railway (automático con Git push)
git push origin main

# Build manual del frontend
npm run build

# Build manual del backend
npm run build && npm run start:prod
```

---

## 13. Testing

### 13.1 Tests Unitarios (Backend — Jest)

```bash
cd backend-nestjs
npm run test        # Todos los tests
npm run test:watch  # Modo watch
npm run test:cov    # Con cobertura
```

### 13.2 Tests Unitarios (Frontend — Vitest)

```bash
cd frontend-react
npm run test        # Modo watch
npm run test:run    # Una sola ejecución (CI)
npm run test:ui     # Con interfaz visual
```

### 13.3 Tests End-to-End (Playwright)

```bash
cd frontend-react
npm run test:e2e       # Ejecutar todos los tests
npm run test:e2e:ui    # Con interfaz visual
```

### 13.4 Estructura de Tests

- **Backend:** Tests unitarios de servicios y controllers con Jest + Supertest.
- **Frontend:** Tests de componentes con Testing Library + MSW para mock de APIs.
- **E2E:** Tests completos de flujos críticos (login, ventas, caja) con Playwright.

---

> **Soporte técnico:** Para consultas de arquitectura o implementación, revisar el código fuente en el repositorio o la documentación Swagger en `/api`.
