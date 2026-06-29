/**
 * Datos simulados compartidos entre todos los módulos.
 * Cuando se conecte una BD real, este archivo se reemplaza por llamadas a la API.
 * Todas las secciones (Maestros, Horarios, Grupos, etc.) leen de aquí
 * para mantenerse sincronizadas.
 */

import { GENERATED_SUBJECTS } from './catalogoMaterias';

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
// NIVELES ACADÉMICOS Y CARRERAS
// ============================================
export interface MockAcademicLevel {
  id: string;
  name: string;
}

export const MOCK_ACADEMIC_LEVELS: MockAcademicLevel[] = [
  { id: 'al-1', name: 'Licenciaturas Ejecutivas' },
  { id: 'al-2', name: 'Maestrías Ejecutivas' },
  { id: 'al-3', name: 'Especialidades Ejecutivas' },
  { id: 'al-4', name: 'Diplomados Ejecutivos' },
  { id: 'al-5', name: 'Bachillerato' },
];

export interface MockCareer {
  id: string;
  name: string;
  academicLevelId: string;
}

export const MOCK_CAREERS: MockCareer[] = [
  // Licenciaturas
  { id: 'c-1', name: 'Administración de Empresas', academicLevelId: 'al-1' },
  { id: 'c-2', name: 'Contaduría y Finanzas', academicLevelId: 'al-1' },
  { id: 'c-3', name: 'Mercadotecnia', academicLevelId: 'al-1' },
  { id: 'c-4', name: 'Informática Administrativa', academicLevelId: 'al-1' },
  { id: 'c-5', name: 'Derecho', academicLevelId: 'al-1' },
  { id: 'c-6', name: 'Ingeniería Industrial', academicLevelId: 'al-1' },
  { id: 'c-7', name: 'Pedagogía', academicLevelId: 'al-1' },
  { id: 'c-8', name: 'Administración de Empresas Turísticas', academicLevelId: 'al-1' },
  { id: 'c-9', name: 'Ingeniería en Sistemas', academicLevelId: 'al-1' },
  // Maestrías
  { id: 'c-10', name: 'Educación', academicLevelId: 'al-2' },
  { id: 'c-11', name: 'Administración', academicLevelId: 'al-2' },
  { id: 'c-12', name: 'Gestión de Proyectos', academicLevelId: 'al-2' },
  { id: 'c-13', name: 'Derecho Procesal Penal', academicLevelId: 'al-2' },
  // Especialidades
  { id: 'c-14', name: 'Comunicación Estratégica', academicLevelId: 'al-3' },
  { id: 'c-15', name: 'Tecnología Educativa', academicLevelId: 'al-3' },
  { id: 'c-16', name: 'Derecho Penal', academicLevelId: 'al-3' },
  { id: 'c-17', name: 'Derecho Familiar', academicLevelId: 'al-3' },
  { id: 'c-18', name: 'Derechos Humanos', academicLevelId: 'al-3' },
  // Diplomados
  { id: 'c-19', name: 'Inglés', academicLevelId: 'al-4' },
  { id: 'c-20', name: 'Psicología Forense', academicLevelId: 'al-4' },
  { id: 'c-21', name: 'Redes de Computadoras', academicLevelId: 'al-4' },
  { id: 'c-22', name: 'Gestión en Contaduría y Finanzas', academicLevelId: 'al-4' },
  // Bachillerato
  { id: 'c-23', name: 'Preparatoria Escolarizada', academicLevelId: 'al-5' },
  { id: 'c-24', name: 'Colbach', academicLevelId: 'al-5' },
];

// ============================================
// GRUPOS (actualizado con carreraId)
// ============================================
export interface MockGroup {
  id: string;
  name: string;
  grade: number;
  section?: string;
  totalStudents?: number;
  academicYear: string;
  carreraId?: string;     // Relación a MockCareer
  carrera?: string;       // Legacy name for UI
  cuatrimestre?: number;  // 1, 2, 3...
}

export const MOCK_GROUPS: MockGroup[] = [
  { id: 'mock-g1', name: 'Contaduría 3', grade: 3, section: 'A', totalStudents: 32, academicYear: '2026-2027', carreraId: 'c-2', carrera: 'Contaduría y Finanzas', cuatrimestre: 1 },
  { id: 'mock-g2', name: 'Derecho 3', grade: 3, section: 'A', totalStudents: 30, academicYear: '2026-2027', carreraId: 'c-5', carrera: 'Derecho', cuatrimestre: 1 },
  { id: 'mock-g3', name: 'Admin Empresas 7', grade: 7, section: 'A', totalStudents: 28, academicYear: '2026-2027', carreraId: 'c-1', carrera: 'Administración de Empresas', cuatrimestre: 2 },
  { id: 'mock-g4', name: 'Turismo 4', grade: 4, section: 'A', totalStudents: 25, academicYear: '2026-2027', carreraId: 'c-8', carrera: 'Administración de Empresas Turísticas', cuatrimestre: 1 },
  { id: 'mock-g5', name: 'Ing. Sistemas 6', grade: 6, section: 'A', totalStudents: 22, academicYear: '2026-2027', carreraId: 'c-9', carrera: 'Ingeniería en Sistemas', cuatrimestre: 2 },
  { id: 'mock-g6', name: 'Derecho 5', grade: 5, section: 'A', totalStudents: 27, academicYear: '2026-2027', carreraId: 'c-5', carrera: 'Derecho', cuatrimestre: 1 },
];

// ============================================
// MATERIAS (actualizado con careerId opcional)
// ============================================
export interface MockSubject {
  id: string;
  name: string;
  code: string;
  credits?: number;
  careerId?: string; // Para filtrar materias por carrera en el frontend
  cuatrimestre?: number; // Para plantillas
}

export const MOCK_SUBJECTS: MockSubject[] = [
  { id: 'mock-s1', name: 'Matemáticas', code: 'MAT-101', credits: 5, careerId: 'c-1' },
  { id: 'mock-s2', name: 'Ciencias Naturales', code: 'CNA-101', credits: 4, careerId: 'c-23' },
  { id: 'mock-s3', name: 'Estudios Sociales', code: 'ESO-101', credits: 4, careerId: 'c-23' },
  { id: 'mock-s4', name: 'Español', code: 'ESP-101', credits: 5, careerId: 'c-23' },
  { id: 'mock-s5', name: 'Inglés Ejecutivo', code: 'ING-101', credits: 3, careerId: 'c-19' },
  { id: 'mock-s6', name: 'Derecho Fiscal', code: 'DER-201', credits: 4, careerId: 'c-5' },
  { id: 'mock-s7', name: 'Derecho Civil I', code: 'DER-102', credits: 4, careerId: 'c-5' },
  { id: 'mock-s8', name: 'Derecho de Amparo', code: 'DER-301', credits: 3, careerId: 'c-5' },
  { id: 'mock-s9', name: 'Estadística II', code: 'EST-202', credits: 4, careerId: 'c-1' },
  { id: 'mock-s10', name: 'Seminario de Finanzas', code: 'FIN-401', credits: 3, careerId: 'c-2' },
  { id: 'mock-s11', name: 'Investigación de Mercados', code: 'MER-301', credits: 4, careerId: 'c-3' },
  { id: 'mock-s12', name: 'Finanzas', code: 'FIN-201', credits: 5, careerId: 'c-2', cuatrimestre: 3 },
  { id: 'mock-s13', name: 'Formación de Emprendedores', code: 'EMP-101', credits: 3, careerId: 'c-1', cuatrimestre: 9 },
  { id: 'mock-s14', name: 'Control Administrativo', code: 'ADM-401', credits: 4, careerId: 'c-1', cuatrimestre: 5 },
  ...GENERATED_SUBJECTS,
];

// ============================================
// PLANTILLAS DE GRUPO (NUEVO FLUJO)
// ============================================
export interface MockGroupTemplate {
  id: string;
  groupId: string;       // Relacionado con MockGroup.id
  modulo: number;        // 1 o 2 (Bimestre)
  classroom: string;     // Aula fija
  subjectIds: string[];  // Materias que deben impartirse a este grupo en este módulo
}

// Empezamos con una base vacía o un ejemplo
export const MOCK_GROUP_TEMPLATES: MockGroupTemplate[] = [
  {
    id: 'tpl-1',
    groupId: 'mock-g2', // Derecho 3
    modulo: 1,
    classroom: 'C1',
    // Tomamos algunas materias de Derecho (c-5) cuatrimestre 3
    subjectIds: ['mock-s-c-5-3-0', 'mock-s-c-5-3-1', 'mock-s-c-5-3-2'],
  }
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
  { id: 'mock-a1', teacherId: 'mock-t1', subjectId: 'mock-s6', groupId: 'mock-g1', scheduleDay: 3, startTime: '10:10', endTime: '11:10', classroom: 'C1', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a2', teacherId: 'mock-t1', subjectId: 'mock-s7', groupId: 'mock-g2', scheduleDay: 3, startTime: '11:40', endTime: '12:40', classroom: 'C1', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a3', teacherId: 'mock-t1', subjectId: 'mock-s8', groupId: 'mock-g2', scheduleDay: 5, startTime: '08:00', endTime: '09:30', classroom: 'CC1', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a4', teacherId: 'mock-t1', subjectId: 'mock-s1', groupId: 'mock-g6', scheduleDay: 5, startTime: '09:40', endTime: '11:10', classroom: 'CC1', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a5', teacherId: 'mock-t1', subjectId: 'mock-s4', groupId: 'mock-g6', scheduleDay: 5, startTime: '11:20', endTime: '12:50', classroom: 'CC1', modulo: 1, cuatrimestre: 1 },
  // María López — Módulo 1
  { id: 'mock-a6', teacherId: 'mock-t2', subjectId: 'mock-s9', groupId: 'mock-g1', scheduleDay: 5, startTime: '08:00', endTime: '09:30', classroom: 'B8', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a7', teacherId: 'mock-t2', subjectId: 'mock-s10', groupId: 'mock-g1', scheduleDay: 5, startTime: '09:40', endTime: '11:10', classroom: 'B8', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a8', teacherId: 'mock-t2', subjectId: 'mock-s11', groupId: 'mock-g3', scheduleDay: 5, startTime: '11:20', endTime: '12:50', classroom: 'C4', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a9', teacherId: 'mock-t2', subjectId: 'mock-s12', groupId: 'mock-g4', scheduleDay: 5, startTime: '13:00', endTime: '14:30', classroom: 'C4', modulo: 1, cuatrimestre: 1 },
  // Carlos Ramírez — Módulo 1
  { id: 'mock-a10', teacherId: 'mock-t3', subjectId: 'mock-s13', groupId: 'mock-g3', scheduleDay: 6, startTime: '08:00', endTime: '09:30', classroom: 'B12', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a11', teacherId: 'mock-t3', subjectId: 'mock-s11', groupId: 'mock-g5', scheduleDay: 6, startTime: '09:40', endTime: '11:10', classroom: 'B12', modulo: 1, cuatrimestre: 1 },
  { id: 'mock-a12', teacherId: 'mock-t3', subjectId: 'mock-s14', groupId: 'mock-g5', scheduleDay: 6, startTime: '11:20', endTime: '12:50', classroom: 'B12', modulo: 1, cuatrimestre: 1 },
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
// Dejamos MOCK_CARRERAS como un helper para retrocompatibilidad
export const MOCK_CARRERAS = MOCK_CAREERS.map(c => c.name);

// ============================================
// HELPERS
// ============================================

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const TIME_SLOTS = Array.from({ length: (24 - 7) * 6 }, (_, i) => {
  const hours = Math.floor(i / 6) + 7;
  const minutes = (i % 6) * 10;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

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

