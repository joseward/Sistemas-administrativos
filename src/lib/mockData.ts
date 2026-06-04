/**
 * Datos simulados compartidos entre todos los módulos.
 * Cuando se conecte una BD real, este archivo se reemplaza por llamadas a la API.
 * Todas las secciones (Maestros, Horarios, Grupos, etc.) leen de aquí
 * para mantenerse sincronizadas.
 */

// ============================================
// USUARIOS (Backend/Admin y Frontend/Docentes)
// ============================================
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'docente';
  teacherId?: string; // Link to teacher if role === 'docente'
  password?: string; // Optional field for password management
  status: 'active' | 'inactive';
  createdAt: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'usr-admin1',
    name: 'Administrador Principal',
    email: 'admin@institutotech.edu',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  // Docentes auto-generados para mantener sincronización inicial
  {
    id: 'usr-doc1',
    name: 'Juan Pérez García',
    email: 'juan.perez@institutotech.edu',
    role: 'docente',
    teacherId: 'mock-t1',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr-doc2',
    name: 'María López Hernández',
    email: 'maria.lopez@institutotech.edu',
    role: 'docente',
    teacherId: 'mock-t2',
    status: 'active',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'usr-doc3',
    name: 'Carlos Ramírez Solano',
    email: 'carlos.ramirez@institutotech.edu',
    role: 'docente',
    teacherId: 'mock-t3',
    status: 'inactive',
    createdAt: '2026-05-20T08:00:00Z',
  }
];

// ============================================
// MAESTROS
// ============================================
export interface MockTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  contractStatus: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export const MOCK_TEACHERS: MockTeacher[] = [
  {
    id: 'mock-t1',
    firstName: 'Juan',
    lastName: 'Pérez García',
    email: 'juan.perez@institutotech.edu',
    phone: '+506-8765-4321',
    specialization: 'Matemáticas y Cálculo',
    contractStatus: 'active',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'mock-t2',
    firstName: 'María',
    lastName: 'López Hernández',
    email: 'maria.lopez@institutotech.edu',
    phone: '+506-8234-5678',
    specialization: 'Ciencias Naturales',
    contractStatus: 'active',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'mock-t3',
    firstName: 'Carlos',
    lastName: 'Ramírez Solano',
    email: 'carlos.ramirez@institutotech.edu',
    phone: '+506-8901-2345',
    specialization: 'Estudios Sociales',
    contractStatus: 'pending',
    createdAt: '2026-05-20T08:00:00Z',
  },
];

// ============================================
// GRUPOS (actualizado con carrera y cuatrimestre)
// ============================================
export interface MockGroup {
  id: string;
  name: string;
  grade: number;
  section?: string;
  totalStudents?: number;
  academicYear: string;
  carrera?: string;       // CTM / Carrera
  cuatrimestre?: number;  // 1, 2, 3...
}

export const MOCK_GROUPS: MockGroup[] = [
  { id: 'mock-g1', name: 'Contaduría y Finanzas 3', grade: 3, section: 'A', totalStudents: 32, academicYear: '2026-2027', carrera: 'Contaduría y Finanzas', cuatrimestre: 1 },
  { id: 'mock-g2', name: 'Derecho 3', grade: 3, section: 'A', totalStudents: 30, academicYear: '2026-2027', carrera: 'Derecho', cuatrimestre: 1 },
  { id: 'mock-g3', name: 'Administración 7', grade: 7, section: 'A', totalStudents: 28, academicYear: '2026-2027', carrera: 'Administración', cuatrimestre: 2 },
  { id: 'mock-g4', name: 'Turismo 4', grade: 4, section: 'A', totalStudents: 25, academicYear: '2026-2027', carrera: 'Turismo', cuatrimestre: 1 },
  { id: 'mock-g5', name: 'Administración 6', grade: 6, section: 'A', totalStudents: 22, academicYear: '2026-2027', carrera: 'Administración', cuatrimestre: 2 },
  { id: 'mock-g6', name: 'Derecho 5', grade: 5, section: 'A', totalStudents: 27, academicYear: '2026-2027', carrera: 'Derecho', cuatrimestre: 1 },
];

// ============================================
// MATERIAS (actualizado con más materias)
// ============================================
export interface MockSubject {
  id: string;
  name: string;
  code: string;
  credits?: number;
}

export const MOCK_SUBJECTS: MockSubject[] = [
  { id: 'mock-s1', name: 'Matemáticas', code: 'MAT-101', credits: 5 },
  { id: 'mock-s2', name: 'Ciencias Naturales', code: 'CNA-101', credits: 4 },
  { id: 'mock-s3', name: 'Estudios Sociales', code: 'ESO-101', credits: 4 },
  { id: 'mock-s4', name: 'Español', code: 'ESP-101', credits: 5 },
  { id: 'mock-s5', name: 'Inglés', code: 'ING-101', credits: 3 },
  { id: 'mock-s6', name: 'Derecho Fiscal', code: 'DER-201', credits: 4 },
  { id: 'mock-s7', name: 'Derecho Civil I', code: 'DER-102', credits: 4 },
  { id: 'mock-s8', name: 'Derecho de Amparo', code: 'DER-301', credits: 3 },
  { id: 'mock-s9', name: 'Estadística II', code: 'EST-202', credits: 4 },
  { id: 'mock-s10', name: 'Seminario de Finanzas', code: 'FIN-401', credits: 3 },
  { id: 'mock-s11', name: 'Investigación de Mercados', code: 'MER-301', credits: 4 },
  { id: 'mock-s12', name: 'Finanzas', code: 'FIN-201', credits: 5 },
  { id: 'mock-s13', name: 'Formación de Emprendedores', code: 'EMP-101', credits: 3 },
  { id: 'mock-s14', name: 'Control Administrativo', code: 'ADM-401', credits: 4 },
];

// ============================================
// ASIGNACIONES DE HORARIO (Maestro → Materia → Grupo → Horario)
// ============================================
export interface MockScheduleAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  groupId: string;
  scheduleDay: number; // 0=Lunes ... 6=Domingo
  startTime: string;   // "08:00"
  endTime: string;     // "09:30"
  classroom?: string;
  modulo?: number;     // 1 o 2
  cuatrimestre?: number;
  isAvailable?: boolean; // True si el docente marcó con verde que puede dar clase
}

export const MOCK_ASSIGNMENTS: MockScheduleAssignment[] = [
  // Juan Pérez — Módulo 1
  { id: 'mock-a1', teacherId: 'mock-t1', subjectId: 'mock-s6', groupId: 'mock-g1', scheduleDay: 3, startTime: '10:10', endTime: '11:10', classroom: 'Aula 101', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a2', teacherId: 'mock-t1', subjectId: 'mock-s7', groupId: 'mock-g2', scheduleDay: 3, startTime: '11:40', endTime: '12:40', classroom: 'Aula 101', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a3', teacherId: 'mock-t1', subjectId: 'mock-s8', groupId: 'mock-g2', scheduleDay: 5, startTime: '08:00', endTime: '09:30', classroom: 'Aula 102', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a4', teacherId: 'mock-t1', subjectId: 'mock-s1', groupId: 'mock-g6', scheduleDay: 5, startTime: '09:40', endTime: '11:10', classroom: 'Aula 102', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a5', teacherId: 'mock-t1', subjectId: 'mock-s4', groupId: 'mock-g6', scheduleDay: 5, startTime: '11:20', endTime: '12:50', classroom: 'Aula 102', modulo: 1, cuatrimestre: 1 },
  // María López — Módulo 1
  { id: 'mock-a6', teacherId: 'mock-t2', subjectId: 'mock-s9', groupId: 'mock-g1', scheduleDay: 5, startTime: '08:00', endTime: '09:30', classroom: 'Lab. Ciencias', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a7', teacherId: 'mock-t2', subjectId: 'mock-s10', groupId: 'mock-g1', scheduleDay: 5, startTime: '09:40', endTime: '11:10', classroom: 'Lab. Ciencias', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a8', teacherId: 'mock-t2', subjectId: 'mock-s11', groupId: 'mock-g3', scheduleDay: 5, startTime: '11:20', endTime: '12:50', classroom: 'Aula 205', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a9', teacherId: 'mock-t2', subjectId: 'mock-s12', groupId: 'mock-g4', scheduleDay: 5, startTime: '13:00', endTime: '14:30', classroom: 'Aula 205', modulo: 1, cuatrimestre: 1 },
  // Carlos Ramírez — Módulo 1
  { id: 'mock-a10', teacherId: 'mock-t3', subjectId: 'mock-s13', groupId: 'mock-g3', scheduleDay: 6, startTime: '08:00', endTime: '09:30', classroom: 'Aula 301', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a11', teacherId: 'mock-t3', subjectId: 'mock-s11', groupId: 'mock-g5', scheduleDay: 6, startTime: '09:40', endTime: '11:10', classroom: 'Aula 301', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a12', teacherId: 'mock-t3', subjectId: 'mock-s14', groupId: 'mock-g5', scheduleDay: 6, startTime: '11:20', endTime: '12:50', classroom: 'Aula 301', modulo: 1, cuatrimestre: 1 },
];

// ============================================
// ESTUDIANTES
// ============================================
export interface MockStudent {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  email?: string;
  groupId: string;
}

export const MOCK_STUDENTS: MockStudent[] = [
  { id: 'mock-st1', firstName: 'Ana', lastName: 'García Méndez', registrationNumber: 'EST-2026-001', email: 'ana.garcia@alumno.edu', groupId: 'mock-g1' },
  { id: 'mock-st2', firstName: 'Luis', lastName: 'Torres Reyes', registrationNumber: 'EST-2026-002', email: 'luis.torres@alumno.edu', groupId: 'mock-g1' },
  { id: 'mock-st3', firstName: 'Sofía', lastName: 'Martínez Cruz', registrationNumber: 'EST-2026-003', email: 'sofia.martinez@alumno.edu', groupId: 'mock-g1' },
  { id: 'mock-st4', firstName: 'Diego', lastName: 'Hernández Ríos', registrationNumber: 'EST-2026-004', email: 'diego.hernandez@alumno.edu', groupId: 'mock-g2' },
  { id: 'mock-st5', firstName: 'Valentina', lastName: 'Ruiz Castillo', registrationNumber: 'EST-2026-005', email: 'valentina.ruiz@alumno.edu', groupId: 'mock-g2' },
  { id: 'mock-st6', firstName: 'Mateo', lastName: 'Flores Aguilar', registrationNumber: 'EST-2026-006', email: 'mateo.flores@alumno.edu', groupId: 'mock-g3' },
  { id: 'mock-st7', firstName: 'Isabella', lastName: 'Morales Vega', registrationNumber: 'EST-2026-007', email: 'isabella.morales@alumno.edu', groupId: 'mock-g3' },
  { id: 'mock-st8', firstName: 'Sebastián', lastName: 'Jiménez Ortega', registrationNumber: 'EST-2026-008', email: 'sebastian.jimenez@alumno.edu', groupId: 'mock-g4' },
  { id: 'mock-st9', firstName: 'Camila', lastName: 'Romero Díaz', registrationNumber: 'EST-2026-009', email: 'camila.romero@alumno.edu', groupId: 'mock-g5' },
  { id: 'mock-st10', firstName: 'Emiliano', lastName: 'Vargas Peña', registrationNumber: 'EST-2026-010', email: 'emiliano.vargas@alumno.edu', groupId: 'mock-g6' },
];

// ============================================
// CUATRIMESTRES
// ============================================
export const CUATRIMESTRES = [
  { value: 1, label: '1er Cuatrimestre (Ene-Abr)' },
  { value: 2, label: '2do Cuatrimestre (May-Ago)' },
  { value: 3, label: '3er Cuatrimestre (Sep-Dic)' },
];

// ============================================
// BIMESTRES / MÓDULOS
// ============================================
export const MOCK_BIMESTRES = [
  { value: 1, label: 'Módulo 1' },
  { value: 2, label: 'Módulo 2' },
];

// ============================================
// AÑOS ACADÉMICOS
// ============================================
export const MOCK_YEARS = [
  '2026-2027',
  '2027-2028'
];

// ============================================
// CARRERAS / PROGRAMAS (CTM)
// ============================================
export const MOCK_CARRERAS = [
  'Contaduría y Finanzas',
  'Derecho',
  'Administración',
  'Turismo',
];

// ============================================
// HELPERS
// ============================================

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

/** Obtener maestro por ID */
export function getTeacherById(id: string): MockTeacher | undefined {
  return MOCK_TEACHERS.find((t) => t.id === id);
}

/** Obtener materia por ID */
export function getSubjectById(id: string): MockSubject | undefined {
  return MOCK_SUBJECTS.find((s) => s.id === id);
}

/** Obtener grupo por ID */
export function getGroupById(id: string): MockGroup | undefined {
  return MOCK_GROUPS.find((g) => g.id === id);
}

/** Obtener solo maestros activos */
export function getActiveTeachers(): MockTeacher[] {
  return MOCK_TEACHERS.filter((t) => t.contractStatus === 'active');
}

/** Obtener estudiantes por grupo */
export function getStudentsByGroup(groupId: string): MockStudent[] {
  return MOCK_STUDENTS.filter((s) => s.groupId === groupId);
}

/** Obtener asignaciones por maestro */
export function getAssignmentsByTeacher(teacherId: string, modulo?: number, cuatrimestre?: number): MockScheduleAssignment[] {
  return MOCK_ASSIGNMENTS.filter((a) => {
    if (a.teacherId !== teacherId) return false;
    if (modulo !== undefined && a.modulo !== modulo) return false;
    if (cuatrimestre !== undefined && a.cuatrimestre !== cuatrimestre) return false;
    return true;
  });
}

