# 🔑 Credenciales de Prueba — Sistema de Gestión de Restaurante

> **Versión:** 1.0  
> **Fecha:** Junio 2026  
> **Entorno:** Desarrollo / Pruebas

---

## ⚠️ Aviso Importante

> **Estas credenciales son exclusivamente para entornos de desarrollo y pruebas.**  
> En producción, se deben cambiar inmediatamente todas las contraseñas por defecto y generar nuevas claves JWT.

---

## 1. Usuarios del Sistema

Las siguientes credenciales se crean automáticamente al ejecutar el script de seed (`npm run db:seed`):

### 1.1 Administrador

| Campo | Valor |
|-------|-------|
| **Nombre completo** | Administrador |
| **Nombre de usuario** | `admin` |
| **Contraseña** | `Admin123!` |
| **Rol** | `admin` |
| **ID en BD** | `admin-id-0001` |

**Permisos:** Acceso completo a todos los módulos del sistema.

---

### 1.2 Cajero

| Campo | Valor |
|-------|-------|
| **Nombre completo** | Cajero Uno |
| **Nombre de usuario** | `cajero1` |
| **Contraseña** | `Cajero123!` |
| **Rol** | `cajero` |
| **ID en BD** | `cajero-id-0001` |

**Permisos:** Acceso a: Dashboard (lectura), Ventas, Caja, Cocina.

---

## 2. URLs de Acceso

### 2.1 Entorno de Desarrollo (Local)

| Componente | URL |
|-----------|-----|
| **Frontend** | `http://localhost:5173` |
| **Backend API** | `http://localhost:3000/api` |
| **Swagger (Documentación API)** | `http://localhost:3000/api` |
| **Drizzle Studio (BD)** | `http://localhost:4983` (ejecutar `npm run db:studio`) |

### 2.2 Entorno de Producción

| Componente | URL |
|-----------|-----|
| **Frontend** | `https://charqueria-oruro.vercel.app` |
| **Backend API** | `https://backend-restaurante-production.up.railway.app/api` |
| **Swagger (Documentación API)** | `https://backend-restaurante-production.up.railway.app/api` |

---

## 3. Base de Datos

### 3.1 Desarrollo Local (Docker)

| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Puerto** | `5435` |
| **Base de datos** | `restaurante_db` |
| **Usuario** | `restaurante_user` |
| **Contraseña** | `restaurante_pass` |
| **Cadena de conexión** | `postgresql://restaurante_user:restaurante_pass@localhost:5435/restaurante_db` |

### 3.2 Producción (Neon)

| Parámetro | Valor |
|-----------|-------|
| **Proveedor** | Neon (PostgreSQL Serverless) |
| **Región** | us-east-1 |
| **SSL** | Requerido (`sslmode=require`) |
| **Connection Pooler** | Habilitado |
| **Cadena de conexión** | Configurada en variables de entorno de Railway |

> ⚠️ La cadena de conexión de producción contiene credenciales sensibles y solo debe estar configurada en las variables de entorno del servicio de Railway. No debe exponerse en el código fuente.

---

## 4. JWT (Token de Autenticación)

### 4.1 Configuración de Desarrollo

| Parámetro | Valor |
|-----------|-------|
| **Algoritmo** | HS256 |
| **Expiración** | 24 horas |
| **Secret** | Configurado en `.env` (64+ caracteres) |

### 4.2 Obtener Token (Ejemplo con cURL)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario": "admin", "contrasena": "Admin123!"}'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "admin-id-0001",
    "nombre": "Administrador",
    "nombre_usuario": "admin",
    "rol": "admin"
  }
}
```

### 4.3 Usar Token en Peticiones

```bash
curl -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer <access_token>"
```

---

## 5. Swagger (Documentación Interactiva)

### 5.1 Cómo Autenticarse en Swagger

1. Abra Swagger: `http://localhost:3000/api`
2. Ejecute `POST /api/auth/login` con las credenciales de prueba.
3. Copie el `access_token` de la respuesta.
4. Haga clic en el botón **"Authorize"** 🔒 en la parte superior.
5. Pegue el token en el campo `Value` (sin el prefijo "Bearer").
6. Clic en **"Authorize"**.
7. Ahora puede probar todos los endpoints protegidos.

---

## 6. Regenerar Credenciales

### 6.1 Resetear Base de Datos Completa

```bash
cd backend-nestjs

# Opción 1: Reset completo (drop + create + migrate + seed)
npm run db:fresh

# Opción 2: Solo seed (sin borrar datos existentes)
npm run db:seed
```

### 6.2 Crear Usuarios Adicionales (API)

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-admin>" \
  -d '{
    "nombre": "Nuevo Cajero",
    "nombre_usuario": "cajero2",
    "contrasena": "NuevaClave123!",
    "rol": "cajero"
  }'
```

---

## 7. Resumen de Credenciales

| Recurso | Usuario | Contraseña | Rol/Acceso |
|---------|---------|-----------|-----------|
| **Sistema Web** | `admin` | `Admin123!` | Administrador (acceso total) |
| **Sistema Web** | `cajero1` | `Cajero123!` | Cajero (acceso limitado) |
| **PostgreSQL (dev)** | `restaurante_user` | `restaurante_pass` | Base de datos local |
| **Swagger** | Usar token JWT | — | Documentación API |

---

> ⚠️ **Recordatorio de Seguridad:**
> 1. Cambiar todas las contraseñas por defecto antes de poner en producción.
> 2. Generar un nuevo `JWT_SECRET` de al menos 64 caracteres aleatorios.
> 3. No exponer credenciales de base de datos en el código fuente.
> 4. Usar variables de entorno para todas las configuraciones sensibles.
> 5. Activar SSL/TLS en todas las conexiones de producción.
