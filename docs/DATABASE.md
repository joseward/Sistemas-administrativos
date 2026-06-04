# 🗄️ Documentación de Base de Datos

## Esquema Relacional

### Tablas Principales

#### 1. **schools** (Escuelas)
Información general de la institución educativa.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| name | VARCHAR(255) | Nombre de la escuela |
| email | VARCHAR(255) | Email de contacto |
| phone | VARCHAR(20) | Teléfono |
| address | TEXT | Dirección física |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Última actualización |

---

#### 2. **teachers** (Maestros)
Información de docentes y su estado contractual.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| schoolId | UUID | FK → schools |
| firstName | VARCHAR(100) | Nombre |
| lastName | VARCHAR(100) | Apellido |
| email | VARCHAR(255) | UNIQUE, para login |
| phone | VARCHAR(20) | Teléfono de contacto |
| cedula | VARCHAR(20) | Cédula/ID único |
| specialization | VARCHAR(100) | Área de especialidad |
| contractStatus | ENUM | 'active', 'inactive', 'pending' |
| createdAt | TIMESTAMP | Fecha registro |
| updatedAt | TIMESTAMP | Última actualización |

**Índices:**
- `schoolId` (búsqueda por escuela)
- `email` (autenticación)

---

#### 3. **subjects** (Materias/Asignaturas)
Catálogo de materias que se ofrecen.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| schoolId | UUID | FK → schools |
| name | VARCHAR(100) | Nombre de materia |
| code | VARCHAR(20) | Código único (ej: MAT-001) |
| description | TEXT | Descripción |
| credits | INT | Créditos académicos |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

**Constraint:**
- `UNIQUE(schoolId, code)` - Código único por escuela

---

#### 4. **groups** (Grupos Académicos)
Secciones/cursos de estudiantes.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| schoolId | UUID | FK → schools |
| name | VARCHAR(100) | Nombre grupo (ej: "1ro A", "2do B") |
| grade | INT | Grado académico |
| section | VARCHAR(10) | Sección (A, B, C...) |
| totalStudents | INT | Cantidad de alumnos |
| academicYear | VARCHAR(20) | Año académico (ej: "2025-2026") |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

**Constraint:**
- `UNIQUE(schoolId, name, academicYear)` - Grupo único por año

---

#### 5. **students** (Estudiantes)
Información de alumnos por grupo.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| schoolId | UUID | FK → schools |
| groupId | UUID | FK → groups |
| firstName | VARCHAR(100) | Nombre |
| lastName | VARCHAR(100) | Apellido |
| registrationNumber | VARCHAR(50) | UNIQUE, carné de estudiante |
| dateOfBirth | DATE | Fecha nacimiento |
| email | VARCHAR(255) | Email (opcional) |
| createdAt | TIMESTAMP | Fecha registro |
| updatedAt | TIMESTAMP | Última actualización |

**Índices:**
- `schoolId` (búsqueda por escuela)
- `groupId` (búsqueda por grupo)
- `registrationNumber` (búsqueda por carné)

---

#### 6. **teacher_availability** (Disponibilidad de Maestros)
Horarios en los que cada maestro está disponible.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| teacherId | UUID | FK → teachers |
| dayOfWeek | INT | 0=Lunes, 1=Martes, ..., 5=Sábado, 6=Domingo |
| startTime | DATETIME | Hora de inicio disponibilidad |
| endTime | DATETIME | Hora de fin |
| isAvailable | BOOLEAN | Si está disponible o no |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

---

#### 7. **teacher_subject_groups** (Asignaciones)
Relación M:N:N entre Maestros, Materias y Grupos.
**TABLA CENTRAL**: Vincula todo el sistema.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| teacherId | UUID | FK → teachers |
| subjectId | UUID | FK → subjects |
| groupId | UUID | FK → groups |
| scheduleDay | INT | Día de la semana |
| startTime | DATETIME | Hora inicio clase |
| endTime | DATETIME | Hora fin clase |
| classroom | VARCHAR(50) | Aula/salón (ej: "101") |
| academicYear | VARCHAR(20) | Año académico |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

**Constraint:**
- `UNIQUE(teacherId, subjectId, groupId, academicYear)` - Una sola asignación por comb.

**Índices:**
- `teacherId`, `subjectId`, `groupId` - Para búsquedas rápidas

---

#### 8. **contracts** (Contratos)
Documentos de contrato de maestros.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| schoolId | UUID | FK → schools |
| teacherId | UUID | FK → teachers |
| academicYear | VARCHAR(20) | Año del contrato |
| contractType | ENUM | 'full-time', 'part-time', 'hourly' |
| startDate | DATE | Fecha inicio |
| endDate | DATE | Fecha fin |
| salary | DECIMAL(10,2) | Salario/monto |
| signedDate | DATE | Fecha firma |
| isSigned | BOOLEAN | ¿Está firmado? |
| signaturePath | VARCHAR(255) | Ruta a imagen de firma |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

---

#### 9. **attendance** (Asistencia)
Registro diario de presencia de estudiantes por materia.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| teacherSubjectGroupId | UUID | FK → teacher_subject_groups |
| studentId | UUID | FK → students |
| sessionDate | DATE | Fecha de la clase |
| status | ENUM | 'present', 'absent', 'late', 'excused' |
| notes | TEXT | Observaciones (ej: motivo ausencia) |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

**Constraint:**
- `UNIQUE(teacherSubjectGroupId, studentId, sessionDate)` - Un registro por estudiante/clase/fecha

**Índices:**
- `teacherSubjectGroupId` (búsqueda por clase)
- `studentId` (historial por alumno)

---

#### 10. **attendance_signatures** (Firmas de Asistencia)
Registro de firmas en listas de asistencia impresas.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| attendanceId | UUID | UNIQUE FK → attendance |
| teacherSubjectGroupId | UUID | FK → teacher_subject_groups |
| teacherSignaturePath | VARCHAR(255) | Ruta a firma del maestro |
| principalSignaturePath | VARCHAR(255) | Ruta a firma del director |
| signedDate | DATE | Fecha de firma |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |

---

#### 11. **users** (Usuarios - Autenticación)
Usuarios del sistema (maestros, administradores).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary Key |
| email | VARCHAR(255) | UNIQUE, para login |
| password | VARCHAR | Hasheado (bcrypt/argon2) |
| role | ENUM | 'admin', 'teacher', 'principal' |
| firstName | VARCHAR(100) | Nombre |
| lastName | VARCHAR(100) | Apellido |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Última actualización |
| lastLogin | DATETIME | Última conexión |

---

## Diagrama de Relaciones

```
┌─────────────┐
│   SCHOOL    │ (1)
└──────┬──────┘
       │
       ├─────(1)──────┬──────(1)────┬──────(1)────┐
       │              │             │             │
    ┌──▼───────┐  ┌──▼────────┐ ┌─▼─────┐ ┌──▼────────┐
    │ TEACHERS  │  │ SUBJECTS  │ │GROUPS │ │ STUDENTS  │
    └──┬────────┘  └──┬────────┘ └─┬──┬──┘ └──┬────────┘
       │              │           │  │        │
       │    ┌─────────┴─────────┬──┘  │        │
       │    │                   │     │        │
       │    ▼                   ▼     ▼        │
       │ ┌────────────────────────────────┐   │
       │ │ TEACHER_SUBJECT_GROUPS (M:N:N) │   │
       │ │    (Asignaciones de clase)     │   │
       │ └────────────────────────────────┘   │
       │              │                       │
       │              └──────────┬────────────┘
       │                         │
       │              ┌──────────▼──────┬──────────┐
       │              │                 │          │
       ▼              ▼                 ▼          ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ CONTRACTS    │ │ ATTENDANCE   │ │ USERS    │ │TEACHER_      │
│              │ │ (Asistencia) │ │          │ │AVAILABILITY  │
└──────────────┘ └──────┬───────┘ └──────────┘ └──────────────┘
                        │
                        ▼
                ┌─────────────────┐
                │ ATTENDANCE_     │
                │ SIGNATURES      │
                └─────────────────┘
```

---

## Queries Comunes

### Obtener horario semanal de un maestro

```sql
SELECT 
  t.firstName, t.lastName,
  tsg.classroom, subj.name,
  g.name as grupo,
  tsg.scheduleDay,
  tsg.startTime, tsg.endTime
FROM teacher_subject_groups tsg
JOIN teachers t ON tsg.teacherId = t.id
JOIN subjects subj ON tsg.subjectId = subj.id
JOIN groups g ON tsg.groupId = g.id
WHERE t.id = 'teacher_id' AND tsg.academicYear = '2025-2026'
ORDER BY tsg.scheduleDay, tsg.startTime;
```

### Obtener lista de asistencia de una clase

```sql
SELECT 
  s.firstName, s.lastName, s.registrationNumber,
  a.status, a.notes
FROM attendance a
JOIN students s ON a.studentId = s.id
WHERE a.teacherSubjectGroupId = 'assignment_id'
  AND a.sessionDate = '2025-02-15'
ORDER BY s.lastName, s.firstName;
```

### Reporte de asistencia por estudiante (último mes)

```sql
SELECT 
  subj.name,
  COUNT(*) as total_clases,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentes,
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as ausentes,
  SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as retardos
FROM attendance a
JOIN teacher_subject_groups tsg ON a.teacherSubjectGroupId = tsg.id
JOIN subjects subj ON tsg.subjectId = subj.id
WHERE a.studentId = 'student_id'
  AND a.sessionDate >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY subj.id, subj.name;
```

---

## Mantenimiento

### Backup
```bash
# Supabase realiza backups automáticos. 
# Para backup manual:
npx prisma db seed
```

### Vacuum/Optimizar
```sql
-- En administrador Supabase
VACUUM ANALYZE;
```

---

## Performance

- **Índices**: Diseñados para búsquedas por `schoolId`, `teacherId`, `groupId`, `studentId`
- **Normalizacion**: Tercera forma normal (3NF) para evitar redundancia
- **Relaciones**: Configuradas con `onDelete: Cascade` para integridad referencial

