# 🎓 Sistema Administrativo Escolar

Una plataforma moderna y completa para automatizar y agilizar los trámites bimestrales de instituciones educativas. Diseñada para gestionar maestros, horarios, grupos, estudiantes, asistencia y contratos digitales.

**Desplegable en web | Responsivo | Optimizado para impresión**

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tech Stack](#tech-stack)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)
- [Despliegue](#despliegue)

---

## ✨ Características

### Módulo de Maestros
- ✅ Gestión centralizada de docentes
- ✅ Seguimiento de disponibilidad horaria
- ✅ Historial de contratos digitales
- ✅ Generación de contratos en PDF con firma digital

### Módulo de Horarios  
- ✅ Asignación flexible de horarios por grupo
- ✅ Vinculación Maestro → Materia → Grupo
- ✅ Validación automática de conflictos de horario
- ✅ Calendario visual interactivo

### Módulo de Grupos
- ✅ Gestión de grupos académicos
- ✅ Organización por grado y sección
- ✅ Gestión de estudiantes por grupo
- ✅ Control por año académico

### Módulo de Asistencia
- ✅ Registro de asistencia por materia y grupo
- ✅ Listas optimizadas para impresión (formato A4)
- ✅ Campos para 2 firmas obligatorias (maestro + director)
- ✅ Reportes de asistencia por período

### Módulo de Contratos
- ✅ Generación de contratos digitales
- ✅ Exportación a PDF con firma
- ✅ Seguimiento de contratos firmados
- ✅ Historial de revisiones

---

## 🛠 Tech Stack

| Aspecto | Tecnología |
|--------|-----------|
| **Frontend** | React 18 + Next.js 14 (App Router) |
| **Estilos** | Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Base de Datos** | PostgreSQL (Azure Database for PostgreSQL) |
| **ORM** | Prisma |
| **Infraestructura** | Microsoft Azure |
| **CI/CD** | GitHub Actions |
| **PDF/Impresión** | React-PDF + HTML2PDF |
| **Despliegue** | Azure App Service + Azure SQL/PostgreSQL |
| **Lenguaje** | TypeScript (strict mode) |

### ¿Por qué este stack?

- **Enterprise-ready**: Azure es infraestructura corporativa con SLA garantizado
- **Seguridad**: Cumple normativas educativas, cifrado en tránsito y reposo
- **Escalabilidad**: Autoscaling automático en Azure App Service
- **Confiabilidad**: PostgreSQL administrado con backups automáticos
- **TypeScript estricto**: Tipado fuerte reduce bugs en producción
- **CI/CD integrado**: GitHub Actions automatiza testing y deployments
- **Impresión optimizada**: Estilos CSS @media print para A4/Letter perfecto

---

## 📦 Instalación

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tuusuario/proyecto-administrativo-escolar.git
cd proyecto-administrativo-escolar

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Configurar Prisma
npx prisma generate

# 5. Ejecutar migraciones
npx prisma db push

# 6. Poblar base de datos (desarrollo)
npm run db:seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## ⚙️ Configuración

### 1. Variables de Entorno

Edita `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
DATABASE_URL="postgresql://user:pass@host:5432/db"

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Auth
JWT_SECRET=tu-clave-secreta-aqui
```

### 2. Configuración de Azure

**Para desarrollo local:**

1. Instalar PostgreSQL local o usar Azure PostgreSQL
2. Crear `.env.local` con DATABASE_URL
3. Ejecutar migraciones: `npm run db:push`

**Para producción (ver docs/AZURE_SETUP.md):**

1. Crear Resource Group en Azure
2. Provisionar Azure Database for PostgreSQL
3. Crear Azure App Service
4. Configurar GitHub Secrets
5. El deploy es automático con GitHub Actions

Ver guía completa: [docs/AZURE_SETUP.md](docs/AZURE_SETUP.md)

### 3. Prisma Studio (Visualizar BD)

```bash
npm run db:studio
```

Esto abre una interfaz gráfica en http://localhost:5555

---

## 🚀 Uso

### Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Lint y type-check
npm run lint
npm run type-check

# Formato de código
npm run format
```

### Base de Datos

```bash
# Crear/aplicar migraciones
npm run db:push

# Resetear BD (CUIDADO: elimina datos)
npm run db:reset

# Poblar con datos de ejemplo
npm run db:seed

# Visualizar esquema interactivamente
npm run db:studio
```

### Build y Producción

```bash
# Compilar para producción
npm run build

# Ejecutar servidor de producción
npm run start
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Home
│   ├── globals.css        # Estilos globales + CSS Print
│   ├── maestros/          # Módulo de maestros
│   ├── horarios/          # Módulo de horarios
│   ├── grupos/            # Módulo de grupos
│   ├── asistencia/        # Módulo de asistencia
│   ├── api/               # API Routes (Backend)
│   └── auth/              # Páginas de autenticación
├── components/            # Componentes reutilizables
│   ├── ui/                # Componentes base (Button, Input, etc.)
│   ├── forms/             # Formularios específicos
│   ├── layouts/           # Layouts de página
│   └── reports/           # Plantillas de PDF/Impresión
├── lib/                   # Utilidades
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funciones auxiliares
├── types/                 # Tipos TypeScript
├── services/              # Lógica de negocio
└── hooks/                 # React Hooks personalizados

prisma/
├── schema.prisma         # Esquema de BD (definición de tablas)
└── seed.ts               # Script para poblar BD

docs/                     # Documentación
├── DATABASE.md
├── API.md
└── SETUP.md
```

---

## 📚 Documentación

- [DATABASE.md](docs/DATABASE.md) - Esquema detallado de la base de datos
- [API.md](docs/API.md) - Documentación de endpoints API
- [SETUP.md](docs/SETUP.md) - Guía inicial de configuración
- **[AZURE_SETUP.md](docs/AZURE_SETUP.md)** - Guía completa de infraestructura Azure

---

## 🌍 Despliegue

### 🔵 Azure (Recomendado - Producción)

El proyecto está configurado para desplegarse automáticamente a Azure mediante GitHub Actions.

**Requisitos:**
- Cuenta Azure con suscripción activa
- Repositorio GitHub
- Azure CLI (para configuración inicial)

**Despliegue:**
1. Seguir pasos en [docs/AZURE_SETUP.md](docs/AZURE_SETUP.md)
2. Configurar GitHub Secrets
3. Push a rama `main` → GitHub Actions automáticamente:
   - ✅ Build y test
   - ✅ Migra base de datos
   - ✅ Despliega a Azure App Service
   - ✅ Health check

**Costos estimados:** $50-75/mes (App Service + PostgreSQL)

### 💻 Local / Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env.local
cp .env.example .env.local

# 3. Aplicar migraciones
npm run db:push

# 4. Iniciar servidor
npm run dev

# Aplicación disponible en http://localhost:3000
```

### 📦 Docker (Opcional)

```bash
# Build
docker build -t admin-escolar .

# Run
docker run -p 3000:3000 admin-escolar
```

---

## 📝 Roadmap

- [ ] Autenticación OAuth con Google/Microsoft
- [ ] Notificaciones por email
- [ ] Exportación de reportes a Excel
- [ ] App móvil (React Native)
- [ ] Sistema de calificaciones
- [ ] Portal para padres/estudiantes

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 📞 Soporte

- 📧 Email: soporte@institutotech.edu
- 🐛 Issues: [GitHub Issues](https://github.com/tuusuario/proyecto-administrativo-escolar/issues)
- 💬 Discussiones: [GitHub Discussions](https://github.com/tuusuario/proyecto-administrativo-escolar/discussions)

---

**Hecho con ❤️ para mejorar la administración escolar** 🎓
