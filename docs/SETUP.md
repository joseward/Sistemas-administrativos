# 🚀 Guía Completa de Configuración

## Tabla de Contenidos

1. [Configuración Inicial Local](#1-configuración-inicial-local)
2. [Configuración de Supabase](#2-configuración-de-supabase)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Migraciones de BD](#4-migraciones-de-base-de-datos)
5. [Desarrollo Local](#5-desarrollo-local)
6. [Despliegue en Producción](#6-despliegue-en-producción)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Configuración Inicial Local

### Paso 1.1: Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/proyecto-administrativo-escolar.git
cd proyecto-administrativo-escolar
```

### Paso 1.2: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- Next.js 14
- React 18
- Prisma ORM
- Tailwind CSS
- Todas las dependencias listadas en `package.json`

### Paso 1.3: Verificar Node.js

```bash
node --version  # Debe ser >= 18.0.0
npm --version   # Debe ser >= 9.0.0
```

---

## 2. Configuración de Supabase

### Paso 2.1: Crear Cuenta en Supabase

1. Ir a https://supabase.com
2. Click en "Sign Up" (Registrarse)
3. Usar email o GitHub
4. Verificar email

### Paso 2.2: Crear Proyecto

1. Dashboard → "New Project"
2. Ingresar nombre: `admin-escolar` o similar
3. Seleccionar región: **Más cercana a tu ubicación**
4. Crear contraseña de BD (guardar en lugar seguro)
5. Click "Create new project"

**⏳ Esperar ~2 minutos** mientras Supabase provisiona la BD.

### Paso 2.3: Obtener Credenciales

Una vez creado el proyecto:

1. Click en "Settings" (engranaje) → "API"
2. Copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (en "Project API keys") → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. En Settings → "Database":
   - Copiar **Connection string** (tipo PostgreSQL) → `DATABASE_URL`

### Paso 2.4: Verificar Conexión

En la terminal:

```bash
npm run db:push
```

Si todo está bien, verás:
```
✓ Database connection successful
✓ Synchronized schema to database
```

---

## 3. Variables de Entorno

### Paso 3.1: Crear `.env.local`

```bash
cp .env.example .env.local
```

### Paso 3.2: Editar `.env.local`

Abre el archivo y rellena con tus valores:

```env
# ============================================
# DATABASE & SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:3000

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=fAKDJ3kj!@#$%^&*()_+-=[]{}|;:',.<>? 

# ============================================
# EMAIL (OPCIONAL)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### Paso 3.3: Generar JWT_SECRET

```bash
# En Linux/Mac:
openssl rand -base64 32

# En Windows (con Git Bash):
openssl rand -base64 32

# O en PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Minimum 0 -Maximum 256)}))
```

Copiar el resultado a `JWT_SECRET` en `.env.local`.

---

## 4. Migraciones de Base de Datos

### Paso 4.1: Aplicar Schema a Supabase

```bash
npm run db:push
```

Esto:
- ✅ Crea todas las tablas en Supabase
- ✅ Configura relaciones
- ✅ Crea índices

### Paso 4.2: Poblar BD con Datos de Ejemplo

```bash
npm run db:seed
```

Este comando ejecuta `prisma/seed.ts` que crea:
- 1 Escuela
- 3 Maestros
- 3 Materias
- 3 Grupos
- 3 Estudiantes
- Asignaciones ejemplo
- Registros de asistencia

**Output esperado:**
```
🌱 Iniciando seed de base de datos...
✓ Escuela creada: Instituto Técnico Administrativo
✓ 3 maestros creados
✓ 3 materias creadas
✓ 3 grupos creados
✓ 3 estudiantes creados
✓ Disponibilidades de maestros creadas
✓ 2 asignaciones creadas
✓ Contratos creados
✓ Registros de asistencia creados

✅ Seed completado correctamente!
```

### Paso 4.3: Visualizar BD (Prisma Studio)

```bash
npm run db:studio
```

Se abrirá en http://localhost:5555 mostrando:
- Todas las tablas
- Datos en BD
- Editor visual

---

## 5. Desarrollo Local

### Paso 5.1: Iniciar Servidor

```bash
npm run dev
```

**Output esperado:**
```
▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1500ms
```

### Paso 5.2: Acceder a la Aplicación

1. Abrir navegador: http://localhost:3000
2. Deberías ver la página de inicio

### Paso 5.3: TypeScript / Lint

```bash
# Verificar tipos TypeScript
npm run type-check

# Lint (ESLint)
npm run lint

# Formatear código
npm run format
```

---

## 6. Despliegue en Producción

### Opción A: Despliegue en Vercel (RECOMENDADO)

#### Prequisitos:
- Cuenta en GitHub con repo pushado
- Cuenta en Vercel

#### Pasos:

1. **Ir a https://vercel.com**

2. **Conectar GitHub**
   - Click "Import Project"
   - Seleccionar tu repo

3. **Configurar Variables de Entorno**
   - En "Environment Variables", añadir:
     ```
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     DATABASE_URL=...
     JWT_SECRET=...
     NEXT_PUBLIC_API_URL=https://tudominio.com (sin /api)
     ```

4. **Desplegar**
   - Click "Deploy"
   - Vercel hará build automático
   - Tu app estará en `https://tu-proyecto.vercel.app`

5. **Configurar Dominio Propio** (opcional)
   - Settings → Domains
   - Añadir dominio (ej: `admin.tuescuela.edu`)
   - Seguir instrucciones DNS

#### Auto-despliegue en cambios:
```bash
git push origin main
# Vercel detecta cambios automáticamente y redespliega
```

---

### Opción B: Despliegue Manual (Heroku, Render, etc.)

#### En Render.com:

1. **Conectar GitHub**
   - https://dashboard.render.com → "New" → "Web Service"
   - Seleccionar repo

2. **Configurar Build**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Variables de Entorno**
   - Añadir todas del `.env.local`

4. **BD**
   - Usar Supabase (no BD de Render)

---

### Opción C: Servidor Propio (VPS / Dedicado)

1. **Instalar Node.js en servidor** (Ubuntu 22.04 ejemplo):

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (process manager)
sudo npm install -g pm2
```

2. **Clonar proyecto**:

```bash
cd /opt
sudo git clone https://github.com/tuusuario/proyecto.git
cd proyecto
sudo npm install
```

3. **Configurar `.env.local`**:

```bash
sudo nano .env.local
# Pegar contenido...
```

4. **Build**:

```bash
npm run build
```

5. **Iniciar con PM2**:

```bash
pm2 start npm --name "admin-escolar" -- run start
pm2 startup
pm2 save
```

6. **Nginx como reverse proxy**:

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/admin-escolar
```

Contenido:
```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/admin-escolar /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

---

## 7. Troubleshooting

### Error: "P1000: Error" (DB Connection)

**Causa**: Variables de BD incorrectas.

**Solución**:
```bash
# Verificar que .env.local existe
ls -la .env.local

# Verificar formato DATABASE_URL
# Debe ser: postgresql://user:password@host:port/database
```

### Error: "ENOTFOUND supabase.io"

**Causa**: Sin conexión a internet o Supabase caído.

**Solución**:
```bash
# Verificar conexión
ping supabase.com

# Verificar DNS
nslookup supabase.com
```

### Error: "Module not found" (dependencias)

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 en uso

**Solución**:
```bash
# Especificar otro puerto
npm run dev -- -p 3001

# O buscar proceso en puerto 3000
lsof -i :3000
kill -9 <PID>
```

### Migraciones no aplicadas

```bash
# Ver estado
npx prisma migrate status

# Aplicar cambios
npm run db:push

# Si está corrupto, resetear (⚠️ BORRA DATOS)
npm run db:reset
```

### Errores en Build de Next.js

```bash
# Limpiar cache
rm -rf .next

# Reconstruir
npm run build
```

---

## Checklist de Despliegue

Antes de ir a producción:

- [ ] `.env.local` contiene todas las variables necesarias
- [ ] `npm run build` sin errores
- [ ] `npm run type-check` sin TypeScript errors
- [ ] Datos de seed cargados en Supabase
- [ ] Login/autenticación funcionando
- [ ] Módulos principales probados
- [ ] Impresión de PDF sin errores
- [ ] Emails (si aplica) configurados
- [ ] BD con backup automático activado
- [ ] Dominio DNS configurado
- [ ] HTTPS/SSL activado
- [ ] Monitoreo y logging configurados

---

## Recursos Útiles

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Deploy**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Soporte

Si encuentras problemas:

1. Revisa logs: `npm run dev` y mira console
2. Verifica `.env.local`: ¿todas las variables?
3. Prueba Prisma Studio: `npm run db:studio`
4. Issues: https://github.com/tuusuario/proyecto/issues

