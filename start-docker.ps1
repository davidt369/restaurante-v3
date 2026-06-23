<#
.SYNOPSIS
Script para inicializar y levantar el Sistema de Restaurante con Docker localmente.
#>

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando Configuración del Sistema..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Configurar backend-nestjs/.env
$backendEnvPath = ".\backend-nestjs\.env"
$backendEnvContent = @"
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@db:5432/restaurante_db
JWT_SECRET=super-secret-key-local-dev-restaurante-oruro-2026
JWT_EXPIRATION=24h
TZ=America/La_Paz
FRONTEND_URL=http://localhost:5173
PORT=3000
"@

Write-Host "`n[1/4] Verificando .env del Backend..." -ForegroundColor Yellow
if (-Not (Test-Path $backendEnvPath)) {
    Write-Host "  -> Creando archivo .env en backend-nestjs..." -ForegroundColor Green
    Set-Content -Path $backendEnvPath -Value $backendEnvContent -Encoding UTF8
} else {
    Write-Host "  -> El archivo .env ya existe. Actualizando DATABASE_URL para Docker si es necesario..." -ForegroundColor Cyan
    # Si existe, nos aseguramos que apunte a Docker
    $content = Get-Content $backendEnvPath
    if ($content -notmatch "DATABASE_URL=postgresql://.*@db:5432/.*") {
        Write-Host "  -> ATENCIÓN: Por favor asegúrate de que DATABASE_URL apunte al host 'db' en tu .env" -ForegroundColor Yellow
    }
}

# 2. Configurar frontend-react/.env
$frontendEnvPath = ".\frontend-react\.env"
$frontendEnvContent = @"
VITE_API_URL=http://localhost:3000/api
"@

Write-Host "`n[2/4] Verificando .env del Frontend..." -ForegroundColor Yellow
if (-Not (Test-Path $frontendEnvPath)) {
    Write-Host "  -> Creando archivo .env en frontend-react..." -ForegroundColor Green
    Set-Content -Path $frontendEnvPath -Value $frontendEnvContent -Encoding UTF8
} else {
    Write-Host "  -> El archivo .env ya existe." -ForegroundColor Cyan
}

# 3. Crear docker-compose.yml si no existe
$dockerComposePath = ".\docker-compose.yml"
$dockerComposeContent = @"
version: '3.8'

services:
  db:
    image: postgres:17-alpine
    container_name: restaurante-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: restaurante_db
      TZ: America/La_Paz
    ports:
      - "5435:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d restaurante_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: node:22-alpine
    container_name: restaurante-backend
    working_dir: /app
    volumes:
      - ./backend-nestjs:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/restaurante_db
      - JWT_SECRET=super-secret-key-local-dev-restaurante-oruro-2026
      - JWT_EXPIRATION=24h
      - TZ=America/La_Paz
      - FRONTEND_URL=http://localhost:5173
    command: sh -c "npm install && npm run db:migrate && npm run db:seed && npm run start:dev"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: node:22-alpine
    container_name: restaurante-frontend
    working_dir: /app
    volumes:
      - ./frontend-react:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000/api
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  pgdata:
"@

Write-Host "`n[3/4] Generando docker-compose.yml..." -ForegroundColor Yellow
if (-Not (Test-Path $dockerComposePath)) {
    Write-Host "  -> Creando docker-compose.yml..." -ForegroundColor Green
    Set-Content -Path $dockerComposePath -Value $dockerComposeContent -Encoding UTF8
} else {
    Write-Host "  -> docker-compose.yml ya existe. Sobrescribiendo para asegurar versión correcta..." -ForegroundColor Cyan
    Set-Content -Path $dockerComposePath -Value $dockerComposeContent -Encoding UTF8
}

# 4. Levantar con Docker Compose
Write-Host "`n[4/4] Levantando contenedores con Docker..." -ForegroundColor Yellow
try {
    docker compose up -d --build
    
    Write-Host "`n=========================================" -ForegroundColor Green
    Write-Host "✅ SISTEMA LEVANTADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "🔌 Backend:  http://localhost:3000/api" -ForegroundColor Cyan
    Write-Host "🗄️  DB Local: localhost:5435" -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ Error al intentar levantar Docker. Asegúrate de tener Docker Desktop abierto." -ForegroundColor Red
}

Write-Host "`nPresiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
