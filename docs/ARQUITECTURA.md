# 📐 Blueprint Arquitectura - Sistema Administrativo Escolar

## Resumen Ejecutivo

Este documento proporciona una visión visual y conceptual de la arquitectura del sistema administrativo escolar.

---

## 1. Diagrama de Capas (Arquitectura)

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO FINAL                          │
│                   (Navegador Web)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 18 Component Library                          │  │
│  │  ├─ Dashboard                                        │  │
│  │  ├─ Formularios (Maestros, Horarios, Grupos)       │  │
│  │  ├─ Tablas (Asistencia, Lista de maestros)         │  │
│  │  └─ Reportes (PDF, Impresión)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tailwind CSS + Diseño Responsivo                    │  │
│  │  ├─ Mobile First                                    │  │
│  │  ├─ Print Styles (CSS Print Media)                  │  │
│  │  └─ Dark Mode (opcional)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                   HTTP/HTTPS (API)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE APLICACIÓN                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 14 (Frontend + Backend)                     │  │
│  │                                                       │  │
│  │  /app/page.tsx                    HOME               │  │
│  │  /app/maestros/[id]/page.tsx     MÓDULOS             │  │
│  │  /app/horarios/page.tsx                              │  │
│  │  /app/grupos/page.tsx                                │  │
│  │  /app/asistencia/page.tsx                            │  │
│  │                                                       │  │
│  │  /app/api/teachers/route.ts      API ROUTES          │  │
│  │  /app/api/schedules/route.ts     (Backend)           │  │
│  │  /app/api/attendance/route.ts                        │  │
│  │  /app/api/contracts/route.ts                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Servicios & Lógica de Negocio                       │  │
│  │                                                       │  │
│  │  teacherService.ts                                   │  │
│  │  attendanceService.ts                                │  │
│  │  contractService.ts                                  │  │
│  │  scheduleService.ts                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware & Utilidades                             │  │
│  │                                                       │  │
│  │  Auth Middleware (JWT)                               │  │
│  │  Validadores (Zod)                                   │  │
│  │  Formatos & Conversiones (utils.ts)                  │  │
│  │  PDF Generation (react-pdf)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                     JSON / GraphQL
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 CAPA DE DATOS                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                          │  │
│  │  ├─ Query Builder Tipado                            │  │
│  │  ├─ Migrations                                       │  │
│  │  ├─ Schema First Development                        │  │
│  │  └─ Prisma Studio (Admin UI)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                CAPA DE PERSISTENCIA                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase (PostgreSQL Hosted)                        │  │
│  │  ├─ 11 Tablas Relacionales                           │  │
│  │  ├─ Índices Optimizados                              │  │
│  │  ├─ Row Level Security (Opcional)                    │  │
│  │  ├─ Backups Automáticos                              │  │
│  │  └─ Autenticación Integrada                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Datos Principales

### A. Gestión de Maestros

```
1. Usuario abre /maestros
                    ↓
2. Next.js rendereador página
                    ↓
3. useEffect() → fetch("/api/teachers")
                    ↓
4. API Route: GET /api/teachers
   ├─ Verifica autenticación
   ├─ Llama teacherService.getAllTeachers()
   ├─ Prisma.teacher.findMany({where: {schoolId}})
                    ↓
5. Supabase: SELECT * FROM teachers WHERE schoolId = ?
                    ↓
6. Retorna JSON → Componente React
                    ↓
7. Renderiza tabla de maestros con Tailwind
```

### B. Asignación de Horarios

```
Maestro + Materia + Grupo + Horario
                    ↓
POST /api/schedules
                    ↓
Prisma.teacherSubjectGroup.create({
  teacherId, subjectId, groupId, 
  scheduleDay, startTime, endTime, classroom
})
                    ↓
INSERT INTO teacher_subject_groups (...)
                    ↓
Retorna: 201 Created + datos asignación
```

### C. Registro de Asistencia → Impresión

```
1. Maestro accede /asistencia/[id]
                    ↓
2. Carga estudiantes del grupo
   GET /api/attendance?teacherSubjectGroupId=...
                    ↓
3. Renderiza formulario con casillas
   <input type="checkbox"> presente/ausente/tarde
                    ↓
4. Maestro registra y presiona GUARDAR
   POST /api/attendance (bulk insert)
                    ↓
5. Click en "IMPRIMIR" utiliza CSS Print Media
   @media print { ... }
                    ↓
6. Navegador abre Print Dialog
   - Formato A4
   - 2 espacios para firmas
   - Encabezados y pie de página
                    ↓
7. Maestro imprime/firma
```

### D. Generación de Contrato PDF

```
1. Admin abre /maestros/contratos/[id]/print
                    ↓
2. Componente ContractTemplate.tsx renderea contrato
   - Datos del maestro
   - Términos del contrato
   - Salario y fechas
   - Firma digital (QR/imagen)
                    ↓
3. Click "DESCARGAR PDF"
   POST /api/contracts/[id]/generate-pdf
   - Usa react-pdf renderer
   - O html2canvas + jsPDF
                    ↓
4. Backend convierte JSX → PDF binario
                    ↓
5. Browser descarga: contrato_juan_perez.pdf
```

---

## 3. Matriz de Módulos vs Funcionalidades

| Módulo | Funcionalidades | Tecnología | Estado |
|--------|-----------------|-----------|--------|
| **Maestros** | CRUD, Disponibilidad, Contratos | React Forms + API | 🔴 Por hacer |
| **Horarios** | Asignación M:N:N, Calendario | React + Tailwind | 🔴 Por hacer |
| **Grupos** | CRUD Grupos, Gestión Estudiantes | Components + API | 🔴 Por hacer |
| **Asistencia** | Registro, Impresión, Reportes | React + CSS Print | 🔴 Por hacer |
| **Contratos** | CRUD, PDF, Firma Digital | React-PDF | 🔴 Por hacer |
| **Dashboard** | KPIs, Gráficas, Resumen | React Charts (opcional) | 🔴 Por hacer |
| **Autenticación** | Login, JWT, Roles | Supabase Auth | 🔴 Por hacer |

---

## 4. Stack de Tecnologías - Justificación

```
┌────────────────────────────────────────────────────┐
│            ¿POR QUÉ ESTE STACK?                   │
├────────────────────────────────────────────────────┤
│                                                    │
│ React 18                                           │
│ └─ Componentes reusables, estado reactivo         │
│    Comunidad gigante, documentación excelente     │
│                                                    │
│ Next.js 14 (App Router)                           │
│ └─ Full-stack en 1 repo, SSR/SSG, API Routes    │
│    Despliegue ultra-rápido en Vercel (0 config)  │
│    File-based routing (sin boilerplate)           │
│                                                    │
│ TypeScript                                        │
│ └─ Evita bugs en runtime, autocompletado          │
│    Desarrollo más rápido y seguro                 │
│                                                    │
│ Tailwind CSS                                      │
│ └─ Clases utilitarias, responsive sin esfuerzo   │
│    CSS Print media construido para impresión      │
│    Bundle optimizado con purge                    │
│                                                    │
│ Prisma ORM                                        │
│ └─ Queries tipadas, migrations automáticas        │
│    Studio para debug visual                       │
│    Vendor-agnostic (cambiar BD es fácil)         │
│                                                    │
│ PostgreSQL/Supabase                               │
│ └─ RDBMS robusto, ideal para admin escolar        │
│    Supabase = PgSQL + Auth + Storage (todo-en-1)  │
│    Serverless = crecimiento automático             │
│                                                    │
│ Vercel                                            │
│ └─ Deploy Next.js en 30 segundos                  │
│    Zero-config, auto-scaling, CDN global         │
│    Tier gratuito generoso                         │
│                                                    │
│ React-PDF / HTML2PDF                              │
│ └─ Genera PDFs desde JSX                          │
│    No necesita servidor PDF externo               │
│    Impresión CSS optimizada (A4/Carta)            │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 5. Estructura de Carpetas (Detalle Completo)

```
backend/
│
├── 📄 package.json               Dependencias & scripts
├── 📄 tsconfig.json              Configuración TypeScript
├── 📄 tailwind.config.js         Tailwind personalizado
├── 📄 next.config.js             Config Next.js
├── 📄 prettier.config.js         Formateador código
├── 📄 .env.example               Template variables
├── 📄 .gitignore                 Archivos ignorados
├── 📄 README.md                  Documentación principal
│
├── 📁 prisma/
│   ├── schema.prisma             Definición BD (11 tablas)
│   └── seed.ts                   Datos iniciales
│
├── 📁 src/
│   │
│   ├── 📁 app/                   Next.js App Router
│   │   ├── layout.tsx            Layout root
│   │   ├── page.tsx              Home
│   │   ├── globals.css           Estilos globales + Print
│   │   │
│   │   ├── 📁 api/               Backend (API Routes)
│   │   │   ├── 📁 auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── register/route.ts
│   │   │   │
│   │   │   ├── 📁 teachers/
│   │   │   │   ├── route.ts      GET/POST maestros
│   │   │   │   └── [id]/route.ts GET/PUT/DELETE
│   │   │   │
│   │   │   ├── 📁 groups/
│   │   │   ├── 📁 schedules/
│   │   │   ├── 📁 attendance/
│   │   │   ├── 📁 contracts/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── generate-pdf/route.ts
│   │   │   │
│   │   │   └── 📁 admin/
│   │   │       └── seed/route.ts
│   │   │
│   │   ├── 📁 maestros/          Páginas de maestros
│   │   │   ├── page.tsx          Listado
│   │   │   ├── crear/page.tsx    Crear
│   │   │   └── [id]/
│   │   │       ├── page.tsx      Editar
│   │   │       ├── disponibilidad/page.tsx
│   │   │       └── contratos/page.tsx
│   │   │
│   │   ├── 📁 horarios/
│   │   ├── 📁 grupos/
│   │   ├── 📁 asistencia/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx     Captura
│   │   │   └── [id]/print.tsx    Impresión
│   │   │
│   │   └── 📁 auth/
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   │
│   ├── 📁 components/            Componentes reutilizables
│   │   ├── 📁 ui/                Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── 📁 forms/             Formularios específicos
│   │   │   ├── TeacherForm.tsx
│   │   │   ├── GroupForm.tsx
│   │   │   ├── ScheduleForm.tsx
│   │   │   └── AttendanceForm.tsx
│   │   │
│   │   ├── 📁 layouts/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   └── 📁 reports/
│   │       ├── ContractTemplate.tsx  (Para PDF)
│   │       └── AttendanceTemplate.tsx  (Para impresión)
│   │
│   ├── 📁 lib/                   Utilidades
│   │   ├── prisma.ts             Cliente Prisma (singleton)
│   │   ├── utils.ts              Helpers comunes
│   │   ├── auth.ts               Validación JWT
│   │   └── validators.ts         Esquemas Zod
│   │
│   ├── 📁 types/                 Tipos TypeScript
│   │   └── index.ts              Tipos globales
│   │
│   ├── 📁 services/              Lógica de negocio
│   │   ├── teacherService.ts
│   │   ├── attendanceService.ts
│   │   ├── contractService.ts
│   │   └── scheduleService.ts
│   │
│   └── 📁 hooks/                 React Hooks
│       ├── useFetch.ts
│       ├── useAuth.ts
│       ├── useTeachers.ts
│       └── useSchedules.ts
│
├── 📁 public/                    Assets estáticos
│   ├── 📁 images/
│   ├── 📁 icons/
│   └── 📁 fonts/
│
├── 📁 docs/                      Documentación
│   ├── DATABASE.md               Esquema BD detallado
│   ├── API.md                    Endpoints REST
│   └── SETUP.md                  Guía de configuración
│
└── 📁 .github/
    └── copilot-instructions.md   (Vi generado automáticamente)
```

---

## 6. Ciclo de Desarrollo

```
┌─────────────────────────────────────────────┐
│      DESARROLLO LOCAL (npm run dev)         │
│  ┌──────────────────────────────────────┐  │
│  │ Server: http://localhost:3000        │  │
│  │ Prisma Studio: http://localhost:5555│  │
│  │ Hot reload automático                │  │
│  └──────────────────────────────────────┘  │
└──────────┬──────────────────────┬──────────┘
           │                      │
    [Git Push]            [npm run build]
           │                      │
           ▼                      ▼
┌─────────────────────┐  ┌──────────────────┐
│   GitHub (repo)     │  │  Build Artifacts │
│                     │  │  (/out, /.next)  │
└─────────────────────┘  └──────────────────┘
           │                      │
           │ (Auto-trigger)       │
           │                      ▼
           │              ┌──────────────────────┐
           │              │  npm run start       │
           │              │  (Staging/Testing)  │
           │              └──────────────────────┘
           │                      │
           │              [Validación OK]
           │                      │
           └──────────┬───────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   VERCEL AUTO-DEPLOY    │
        │   (1-2 minutos)         │
        └──────────┬──────────────┘
                   │
         [Generación certificado SSL]
                   │
                   ▼
        ┌─────────────────────────┐
        │  PRODUCCIÓN EN VIVO      │
        │  tudominio.com          │
        └─────────────────────────┘
```

---

## 7. Flujo de CI/CD Recomendado

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      
      - run: npm run db:push
      - run: npm test  # (cuando existan tests)

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 8. Roadmap de Implementación (Fases)

### **FASE 1: MVP (Semana 1-2)** ✅
- [x] Estructura proyecto
- [x] BD en Supabase
- [x] Autenticación básica
- [ ] CRUD Maestros
- [ ] CRUD Grupos
- [ ] Página de inicio

### **FASE 2: Core Features (Semana 3-4)**
- [ ] Asignación Horarios (M:N:N)
- [ ] Disponibilidad Maestros
- [ ] Registro Asistencia básico
- [ ] Listados y búsquedas

### **FASE 3: Impresión & PDFs (Semana 5)**
- [ ] Contratos en PDF
- [ ] Listas asistencia optimizadas
- [ ] CSS Print perfeccionado
- [ ] Firma digital básica

### **FASE 4: Dashboard & Reportes (Semana 6)**
- [ ] Dashboard con KPIs
- [ ] Reportes por período
- [ ] Gráficas (Chart.js o Recharts)
- [ ] Exportar a Excel

### **FASE 5: Polish & Deploy (Semana 7-8)**
- [ ] Testing exhaustivo
- [ ] Optimización performance
- [ ] Documentación usuario
- [ ] Deploy a Vercel
- [ ] Configuraión dominio

---

## 9. Consideraciones de Seguridad

```
┌──────────────────────────────────────────┐
│         MATRIZ DE SEGURIDAD              │
├──────────────────────────────────────────┤
│                                          │
│ ✅ HTTPS/TLS (Vercel + Supabase)        │
│    └─ Certificados SSL automáticos      │
│                                          │
│ ✅ AUTENTICACIÓN JWT                     │
│    └─ Tokens con expiracion (24h)       │
│    └─ Refresh tokens en BD               │
│                                          │
│ ✅ BCRYPT PASSWORDS                      │
│    └─ Hash con salt rounds=10           │
│    └─ Nunca guardar plain text          │
│                                          │
│ ✅ CSRF PROTECTION                       │
│    └─ Next.js built-in                   │
│                                          │
│ ✅ SQL INJECTION PREVENTION              │
│    └─ Prisma parametrizado              │
│    └─ Queries tipadas                    │
│                                          │
│ ✅ RATE LIMITING                         │
│    └─ Implementar en próximo release     │
│                                          │
│ ✅ ROW LEVEL SECURITY (Supabase)        │
│    └─ Datos visibles por rol            │
│                                          │
│ ✅ CORS POLICY                           │
│    └─ Whitelist de origins              │
│                                          │
└──────────────────────────────────────────┘
```

---

## 10. Performance & Optimizaciones

```
OPTIMIZACIONES IMPLEMENTADAS:

┌─ Frontend ─────────────────────────┐
│ • Code splitting automático         │
│ • Image optimization (Next/Image)   │
│ • Lazy loading componentes          │
│ • CSS purging (Tailwind)            │
│ • CDN global (Vercel)               │
└────────────────────────────────────┘

┌─ Backend ──────────────────────────┐
│ • API response caching              │
│ • DB índices en campos clave       │
│ • Conexión pooling (Prisma)        │
│ • Queries optimizadas              │
│ • Compresión de respuestas (gzip)  │
└────────────────────────────────────┘

┌─ BD ──────────────────────────┐
│ • Índices: schoolId,           │
│   teacherId, groupId, studentId│
│ • Queries con includeRelated   │
│ • Pagination (skip/take)       │
│ • Indexes en foreign keys      │
└───────────────────────────────┘
```

---

## ✅ Conclusión

Este blueprint proporciona una arquitectura **robusta, escalable y fácil de mantener** para un sistema administrativo escolar. El stack elegido (Next.js + Prisma + Supabase) permite **despliegue en minutos** y **mantenimiento sin fricciones**.

**Next step**: Comenzar con FASE 1 implementando CRUD de maestros.

