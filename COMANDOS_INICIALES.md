# 🚀 Comandos Iniciales - Inicio Rápido

Ejecuta estos comandos **en orden** para inicializar el proyecto completamente.

---

## PASO 1: Instalar Dependencias

```bash
npm install
```

**Qué hace**: Instala React, Next.js, Prisma, Tailwind, y todas las librerías necesarias.

**Tiempo esperado**: 3-5 minutos

---

## PASO 2: Generar Cliente Prisma

```bash
npx prisma generate
```

**Qué hace**: Genera el cliente TypeScript automático basado en `schema.prisma`.

---

## PASO 3: Crear `.env.local`

```bash
cp .env.example .env.local
```

**Qué hacer después**:
1. Abrir `.env.local` en VS Code
2. Reemplazar placeholders con valores reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
DATABASE_URL="postgresql://user:password@host:5432/db"
JWT_SECRET=tu-clave-secreta-aleatoria
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ver [SETUP.md](docs/SETUP.md) para obtener credenciales de Supabase.

---

## PASO 4: Aplicar Migraciones de BD

```bash
npm run db:push
```

**Qué hace**:
- ✅ Crea todas las 11 tablas en Supabase
- ✅ Crea índices y relaciones
- ✅ Valida el esquema

**Output esperado**:
```
✓ Database connection successful
✓ The following migration(s) have been created and applied:
   migrations/20250615_initial_schema
✓ Synchronized schema to database
```

---

## PASO 5: Poblar BD con Datos de Ejemplo

```bash
npm run db:seed
```

**Qué hace**:
- Crea 1 escuela de ejemplo
- Crea 3 maestros
- Crea 3 materias
- Crea 3 grupos
- Crea 3 estudiantes
- Crea asignaciones y registros de asistencia

**Output esperado**:
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

---

## PASO 6: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

**Qué hace**: Inicia Next.js en modo desarrollo con hot reload.

**Output esperado**:
```
▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1500ms
```

**Accede a**:
- 🏠 Aplicación: http://localhost:3000
- 📊 BD Visual: http://localhost:5555 (en otra terminal)

---

## PASO 7 (Opcional): Abrir Prisma Studio

En una **NUEVA terminal** en el mismo directorio:

```bash
npm run db:studio
```

S abrirá en http://localhost:5555 permitiéndote:
- Ver todas las tablas
- Editar datos visualmente
- Crear registros
- Exportar datos

---

## ✅ Verificación de Setup

Si completaste todos los pasos, verifica:

```bash
# Verificar tipos TypeScript
npm run type-check

# Verificar linting
npm run lint

# Build de producción (opcional)
npm run build
```

**Todos estos comandos deben terminar sin errores.**

---

## 📁 Estructura Creada

Después de estos pasos, tendrás:

```
backend/
├── node_modules/              ← Dependencias instaladas
├── .next/                      ← Build caché
├── prisma/
│   ├── schema.prisma          ← Definición BD
│   └── seed.ts                ← Datos iniciales
├── src/
│   ├── app/                   ← Página home renderada
│   ├── lib/
│   │   └── prisma.ts          ← Cliente listo
│   ├── types/
│   │   └── index.ts           ← Tipos globales
│   └── services/              ← Lógica de negocio lista
├── .env.local                 ← Variables configuradas
├── package-lock.json          ← Lock de dependencias
└── [Otros archivos...]
```

---

## 🎯 Próximos Pasos

1. ✅ **Setup completado**
2. 👉 **Ahora modifica**:
   - Páginas en `src/app/maestros/`, `src/app/horarios/`, etc.
   - Crea componentes en `src/components/`
   - Añade API routes en `src/app/api/`
3. **Guías de desarrollo**:
   - [DATABASE.md](docs/DATABASE.md) - Esquema BD
   - [API.md](docs/API.md) - Cómo hacer requests
   - [ARQUITECTURA.md](docs/ARQUITECTURA.md) - Visión general

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| `module not found` | `npm install` |
| `DATABASE_URL undefined` | Verificar `.env.local` |
| `Port 3000 en uso` | `npm run dev -- -p 3001` |
| `Prisma error` | `npm run db:push` |
| `TypeScript errors` | `npm run type-check` y corregir |

---

## 📚 Documentación

- **[README.md](README.md)** - Resumen del proyecto
- **[SETUP.md](docs/SETUP.md)** - Configuración detallada
- **[DATABASE.md](docs/DATABASE.md)** - Esquema y queries
- **[API.md](docs/API.md)** - Endpoints REST
- **[ARQUITECTURA.md](docs/ARQUITECTURA.md)** - Visión técnica

---

## ✨ ¡Listo!

Tu ambiente de desarrollo está **100% listo** para empezar a código.

```
🎉 Backend: http://localhost:3000
📊 Prisma: http://localhost:5555
🔧 Hot reload: Habilitado automáticamente
📦 BD: Supabase PostgreSQL con datos
```

**¡Happy coding! 💻**

