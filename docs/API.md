# 🔌 Documentación de API Routes

## Base URL

```
Development: http://localhost:3000/api
Production: https://tudominio.com/api
```

---

## Autenticación

### POST `/api/auth/login`

Login de usuario.

**Request:**
```json
{
  "email": "juan.perez@institutotech.edu",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "juan.perez@institutotech.edu",
    "role": "teacher",
    "firstName": "Juan"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

---

### POST `/api/auth/register`

Registro de nuevo usuario.

**Request:**
```json
{
  "email": "nuevo@institutotech.edu",
  "password": "securepass123",
  "firstName": "María",
  "lastName": "López",
  "role": "teacher"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### POST `/api/auth/logout`

Logout del usuario actual.

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

---

## Maestros

### GET `/api/teachers`

Obtener lista de maestros.

**Query Parameters:**
- `schoolId` (required): ID de la escuela
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Resultados por página (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@institutotech.edu",
      "specialization": "Matemáticas",
      "contractStatus": "active",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 45
}
```

---

### GET `/api/teachers/:id`

Obtener datos de un maestro con sus asignaciones.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@institutotech.edu",
    "phone": "+1-555-0101",
    "cedula": "12345678",
    "specialization": "Matemáticas",
    "contractStatus": "active",
    "availability": [
      {
        "dayOfWeek": 0,
        "startTime": "08:00",
        "endTime": "12:00",
        "isAvailable": true
      }
    ],
    "assignments": [
      {
        "id": "uuid",
        "subjectId": "uuid",
        "groupId": "uuid",
        "classroom": "101",
        "scheduleDay": 0,
        "startTime": "08:00",
        "endTime": "09:30"
      }
    ]
  }
}
```

---

### POST `/api/teachers`

Crear nuevo maestro.

**Request:**
```json
{
  "schoolId": "school_uuid",
  "firstName": "Carlos",
  "lastName": "García",
  "email": "carlos.garcia@institutotech.edu",
  "phone": "+1-555-0110",
  "cedula": "98765432",
  "specialization": "Ciencias"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PUT `/api/teachers/:id`

Actualizar datos de maestro.

**Request:**
```json
{
  "phone": "+1-555-0111",
  "specialization": "Matemáticas y Física"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/api/teachers/:id`

Eliminar maestro.

**Response (200):**
```json
{
  "success": true,
  "message": "Maestro eliminado"
}
```

---

## Horarios / Asignaciones

### GET `/api/schedules` o `/api/teacher-subject-groups`

Obtener asignaciones.

**Query Parameters:**
- `groupId`: Filtrar por grupo
- `teacherId`: Filtrar por maestro
- `academicYear` (required): Año académico

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "teacherId": "uuid",
      "subjectId": "uuid",
      "groupId": "uuid",
      "teacherName": "Juan Pérez",
      "subjectName": "Matemáticas",
      "groupName": "1ro A",
      "classroom": "101",
      "scheduleDay": 0,
      "startTime": "08:00",
      "endTime": "09:30"
    }
  ]
}
```

---

### POST `/api/schedules`

Crear nueva asignación (Maestro-Materia-Grupo).

**Request:**
```json
{
  "teacherId": "uuid",
  "subjectId": "uuid",
  "groupId": "uuid",
  "classroom": "101",
  "scheduleDay": 0,
  "startTime": "08:00",
  "endTime": "09:30",
  "academicYear": "2025-2026"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PUT `/api/schedules/:id`

Actualizar asignación.

**Request:**
```json
{
  "classroom": "102",
  "startTime": "09:00",
  "endTime": "10:30"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/api/schedules/:id`

Eliminar asignación.

**Response (200):**
```json
{
  "success": true,
  "message": "Asignación eliminada"
}
```

---

## Asistencia

### GET `/api/attendance`

Obtener registros de asistencia.

**Query Parameters:**
- `teacherSubjectGroupId` (required): ID de la clase
- `sessionDate`: Fecha específica (YYYY-MM-DD)
- `studentId` (optional): Para alumno específico

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "Pedro Gutiérrez",
      "registrationNumber": "STU-001-2025",
      "status": "present",
      "notes": null,
      "sessionDate": "2025-02-15"
    }
  ]
}
```

---

### POST `/api/attendance`

Registrar asistencia.

**Request:**
```json
{
  "teacherSubjectGroupId": "uuid",
  "studentId": "uuid",
  "sessionDate": "2025-02-15",
  "status": "present",
  "notes": ""
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PUT `/api/attendance/:id`

Actualizar registro de asistencia.

**Request:**
```json
{
  "status": "late",
  "notes": "Llegó 10 minutos tarde"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Contratos

### GET `/api/contracts`

Obtener contratos.

**Query Parameters:**
- `teacherId`: Filtrar por maestro
- `schoolId`: Filtrar por escuela
- `academicYear` (optional): Año específico

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "teacherId": "uuid",
      "teacherName": "Juan Pérez",
      "contractType": "full-time",
      "startDate": "2025-01-15",
      "endDate": "2025-12-15",
      "salary": 15000,
      "isSigned": false,
      "signedDate": null,
      "academicYear": "2025-2026"
    }
  ]
}
```

---

### GET `/api/contracts/:id`

Obtener contrato específico (para renderizar PDF).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "teacher": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@institutotech.edu",
      "cedula": "12345678"
    },
    "schoolName": "Instituto Técnico Administrativo",
    "contractType": "full-time",
    "startDate": "2025-01-15",
    "endDate": "2025-12-15",
    "salary": 15000,
    "isSigned": false,
    "signaturePath": null
  }
}
```

---

### POST `/api/contracts`

Crear contrato.

**Request:**
```json
{
  "teacherId": "uuid",
  "schoolId": "uuid",
  "contractType": "full-time",
  "startDate": "2025-01-15",
  "endDate": "2025-12-15",
  "salary": 15000,
  "academicYear": "2025-2026"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### POST `/api/contracts/:id/sign`

Firmar contrato (marcar como signed con fecha).

**Request:**
```json
{
  "signaturePath": "/uploads/signature_uuid.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contrato firmado correctamente",
  "data": {
    "isSigned": true,
    "signedDate": "2025-02-15T14:30:00Z"
  }
}
```

---

### POST `/api/contracts/:id/generate-pdf`

Generar PDF del contrato (para descarga/impresión).

**Response (200):**
```
[PDF Binary Data]
Content-Type: application/pdf
Content-Disposition: attachment; filename="contrato_juan_perez.pdf"
```

---

## Grupos

### GET `/api/groups`

Obtener grupos.

**Query Parameters:**
- `schoolId` (required)
- `academicYear` (required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "1ro A",
      "grade": 1,
      "section": "A",
      "totalStudents": 30,
      "academicYear": "2025-2026"
    }
  ]
}
```

---

### GET `/api/groups/:id`

Obtener grupo con lista de estudiantes.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "1ro A",
    "grade": 1,
    "totalStudents": 30,
    "students": [
      {
        "id": "uuid",
        "firstName": "Pedro",
        "lastName": "Gutiérrez",
        "registrationNumber": "STU-001-2025",
        "dateOfBirth": "2009-03-15"
      }
    ]
  }
}
```

---

## Reportes

### GET `/api/reports/attendance-summary`

Reporte de asistencia por período.

**Query Parameters:**
- `groupId`: Filtrar por grupo
- `startDate`: Fecha inicio (YYYY-MM-DD)
- `endDate`: Fecha fin (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "2025-02-01 a 2025-02-28",
    "totalClasses": 20,
    "attendance": [
      {
        "status": "present",
        "count": 450
      },
      {
        "status": "absent",
        "count": 30
      },
      {
        "status": "late",
        "count": 20
      }
    ]
  }
}
```

---

## Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos inválidos en request |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | Permiso denegado |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Violación de constraint (ej: email duplicado) |
| 500 | Internal Server Error | Error en el servidor |

---

## Testing con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@institutotech.edu","password":"pass123"}'

# Obtener maestros
curl -X GET "http://localhost:3000/api/teachers?schoolId=school_uuid" \
  -H "Authorization: Bearer token_aqui"

# Crear asignación
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_aqui" \
  -d '{...}'
```

---

## Rate Limiting

- **Free tier**: 100 requests/minuto
- **Premium**: Sin límite

Respuesta cuando se exceden límites:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Webhooks (Próxima versión)

Se planea implementar webhooks para:
- Contratos firmados
- Nuevas asignaciones
- Cambios de horario
- Ausencias repetidas

