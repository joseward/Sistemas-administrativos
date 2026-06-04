/**
 * Teacher Service - Lógica de negocio para maestros
 * Incluye CRUD, disponibilidad y asignaciones
 */

import prisma from '@/lib/prisma';
import { ITeacher, ITeacherAvailability, ITeacherSubjectGroup } from '@/types';

// ============================================
// OPERACIONES CRUD MAESTROS
// ============================================

/**
 * Obtener todos los maestros de una escuela
 */
export const getAllTeachers = async (
  schoolId: string,
  options?: { page?: number; limit?: number }
) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where: { schoolId },
      skip,
      take: limit,
      orderBy: { lastName: 'asc' },
      include: {
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    }),
    prisma.teacher.count({ where: { schoolId } }),
  ]);

  return {
    data: teachers,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Obtener un maestro por ID con toda su información
 */
export const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      availability: {
        orderBy: { dayOfWeek: 'asc' },
      },
      assignments: {
        include: {
          subject: true,
          group: true,
        },
        orderBy: { academicYear: 'desc' },
      },
      contracts: {
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!teacher) {
    throw new Error(`Maestro con ID ${id} no encontrado`);
  }

  return teacher;
};

/**
 * Obtener maestro por email
 */
export const getTeacherByEmail = async (email: string, schoolId?: string) => {
  const where: any = { email };
  if (schoolId) {
    where.schoolId = schoolId;
  }

  return await prisma.teacher.findUnique({
    where: { email },
  });
};

/**
 * Crear un nuevo maestro
 */
export const createTeacher = async (
  data: Omit<ITeacher, 'id' | 'createdAt' | 'updatedAt'>
) => {
  // Validar que no exista email duplicado
  const existingTeacher = await prisma.teacher.findUnique({
    where: { email: data.email },
  });

  if (existingTeacher) {
    throw new Error(`El email ${data.email} ya está registrado`);
  }

  return await prisma.teacher.create({
    data,
    include: {
      availability: true,
    },
  });
};

/**
 * Actualizar información de maestro
 */
export const updateTeacher = async (
  id: string,
  data: Partial<
    Omit<ITeacher, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
  >
) => {
  // Si cambiar email, validar que no exista
  if (data.email) {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: data.email },
    });

    if (existingTeacher && existingTeacher.id !== id) {
      throw new Error(`El email ${data.email} ya está registrado por otro maestro`);
    }
  }

  return await prisma.teacher.update({
    where: { id },
    data,
    include: {
      availability: true,
    },
  });
};

/**
 * Eliminar maestro (soft delete simulado - cambiar status)
 */
export const deleteTeacher = async (id: string) => {
  // Verificar si tiene contratos activos
  const activeContracts = await prisma.contract.count({
    where: {
      teacherId: id,
      isSigned: true,
    },
  });

  if (activeContracts > 0) {
    throw new Error(
      'No se puede eliminar un maestro con contratos activos. Cancela los contratos primero.'
    );
  }

  // Cambiar estado a inactivo en lugar de eliminar
  return await prisma.teacher.update({
    where: { id },
    data: { contractStatus: 'inactive' },
  });
};

// ============================================
// OPERACIONES DE DISPONIBILIDAD
// ============================================

/**
 * Obtener disponibilidad de un maestro
 */
export const getTeacherAvailability = async (teacherId: string) => {
  return await prisma.teacherAvailability.findMany({
    where: { teacherId },
    orderBy: { dayOfWeek: 'asc' },
  });
};

/**
 * Crear/actualizar disponibilidad de un maestro para un día
 */
export const setTeacherAvailability = async (
  teacherId: string,
  dayOfWeek: number,
  startTime: Date,
  endTime: Date
) => {
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Día de semana inválido (0-6)');
  }

  if (startTime >= endTime) {
    throw new Error('La hora de inicio debe ser anterior a la hora de fin');
  }

  // Buscar si ya existe disponibilidad para ese día
  const existing = await prisma.teacherAvailability.findFirst({
    where: {
      teacherId,
      dayOfWeek,
    },
  });

  if (existing) {
    return await prisma.teacherAvailability.update({
      where: { id: existing.id },
      data: {
        startTime,
        endTime,
        isAvailable: true,
      },
    });
  }

  return await prisma.teacherAvailability.create({
    data: {
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true,
    },
  });
};

/**
 * Marcar disponibilidad de un día como no disponible
 */
export const toggleTeacherAvailability = async (
  availabilityId: string,
  isAvailable: boolean
) => {
  return await prisma.teacherAvailability.update({
    where: { id: availabilityId },
    data: { isAvailable },
  });
};

/**
 * Eliminar disponibilidad para un día específico
 */
export const deleteTeacherAvailability = async (availabilityId: string) => {
  return await prisma.teacherAvailability.delete({
    where: { id: availabilityId },
  });
};

// ============================================
// OPERACIONES DE ASIGNACIONES
// ============================================

/**
 * Obtener todas las asignaciones de un maestro
 */
export const getTeacherAssignments = async (
  teacherId: string,
  academicYear?: string
) => {
  const where: any = { teacherId };
  if (academicYear) {
    where.academicYear = academicYear;
  }

  return await prisma.teacherSubjectGroup.findMany({
    where,
    include: {
      subject: true,
      group: true,
      teacher: true,
    },
    orderBy: [{ academicYear: 'desc' }, { scheduleDay: 'asc' }],
  });
};

/**
 * Obtener asignaciones de un maestro para un año académico específico
 */
export const getTeacherSchedule = async (teacherId: string, academicYear: string) => {
  return await prisma.teacherSubjectGroup.findMany({
    where: {
      teacherId,
      academicYear,
    },
    include: {
      subject: true,
      group: true,
    },
    orderBy: [{ scheduleDay: 'asc' }, { startTime: 'asc' }],
  });
};

/**
 * Crear asignación maestro-materia-grupo
 */
export const createTeacherAssignment = async (
  data: Omit<ITeacherSubjectGroup, 'id' | 'createdAt' | 'updatedAt'>
) => {
  // Validar que no exista asignación duplicada
  const existing = await prisma.teacherSubjectGroup.findFirst({
    where: {
      teacherId: data.teacherId,
      subjectId: data.subjectId,
      groupId: data.groupId,
      academicYear: data.academicYear,
    },
  });

  if (existing) {
    throw new Error(
      'Ya existe una asignación para este maestro, materia y grupo en este año académico'
    );
  }

  // Validar que no haya conflicto de horario
  if (data.scheduleDay !== undefined && data.startTime && data.endTime) {
    const conflicts = await prisma.teacherSubjectGroup.findMany({
      where: {
        teacherId: data.teacherId,
        scheduleDay: data.scheduleDay,
        academicYear: data.academicYear,
        AND: [
          {
            startTime: {
              lt: data.endTime,
            },
          },
          {
            endTime: {
              gt: data.startTime,
            },
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new Error(
        `Conflicto de horario: El maestro tiene otra clase en ese horario`
      );
    }
  }

  return await prisma.teacherSubjectGroup.create({
    data,
    include: {
      subject: true,
      group: true,
      teacher: true,
    },
  });
};

/**
 * Actualizar asignación
 */
export const updateTeacherAssignment = async (
  id: string,
  data: Partial<
    Omit<ITeacherSubjectGroup, 'id' | 'teacherId' | 'subjectId' | 'groupId' | 'createdAt' | 'updatedAt'>
  >
) => {
  const assignment = await prisma.teacherSubjectGroup.findUnique({
    where: { id },
  });

  if (!assignment) {
    throw new Error('Asignación no encontrada');
  }

  // Validar conflicto de horario si se actualiza horario
  if (data.scheduleDay !== undefined && data.startTime && data.endTime) {
    const conflicts = await prisma.teacherSubjectGroup.findMany({
      where: {
        teacherId: assignment.teacherId,
        scheduleDay: data.scheduleDay,
        academicYear: assignment.academicYear,
        id: { not: id },
        AND: [
          {
            startTime: {
              lt: data.endTime,
            },
          },
          {
            endTime: {
              gt: data.startTime,
            },
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new Error('Conflicto de horario detectado');
    }
  }

  return await prisma.teacherSubjectGroup.update({
    where: { id },
    data,
    include: {
      subject: true,
      group: true,
    },
  });
};

/**
 * Eliminar asignación
 */
export const deleteTeacherAssignment = async (id: string) => {
  // Verificar si hay registros de asistencia
  const attendanceCount = await prisma.attendance.count({
    where: { teacherSubjectGroupId: id },
  });

  if (attendanceCount > 0) {
    throw new Error(
      'No se puede eliminar una asignación que ya tiene registros de asistencia'
    );
  }

  return await prisma.teacherSubjectGroup.delete({
    where: { id },
  });
};

// ============================================
// REPORTES Y ESTADÍSTICAS
// ============================================

/**
 * Obtener carga académica de un maestro (cantidad de horas/clases)
 */
export const getTeacherWorkload = async (teacherId: string, academicYear: string) => {
  const assignments = await prisma.teacherSubjectGroup.findMany({
    where: {
      teacherId,
      academicYear,
    },
  });

  const totalHours = assignments.reduce((sum, assignment) => {
    if (assignment.startTime && assignment.endTime) {
      const hours =
        (assignment.endTime.getTime() - assignment.startTime.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }
    return sum;
  }, 0);

  return {
    teacherId,
    academicYear,
    totalClasses: assignments.length,
    totalHours: Math.round(totalHours * 100) / 100,
    assignments,
  };
};

/**
 * Obtener maestros disponibles para una clase (día y hora específicos)
 */
export const getAvailableTeachers = async (
  schoolId: string,
  dayOfWeek: number,
  startTime: Date,
  endTime: Date,
  excludeTeacherId?: string
) => {
  const teachers = await prisma.teacher.findMany({
    where: {
      schoolId,
      contractStatus: 'active',
      ...(excludeTeacherId && { NOT: { id: excludeTeacherId } }),
    },
    include: {
      availability: {
        where: {
          dayOfWeek,
          isAvailable: true,
        },
      },
    },
  });

  // Filtrar maestros cuya disponibilidad cubre el horario requerido
  return teachers.filter((teacher) => {
    if (teacher.availability.length === 0) return false;

    return teacher.availability.some((avail) => {
      return avail.startTime <= startTime && avail.endTime >= endTime;
    });
  });
};

export default {
  getAllTeachers,
  getTeacherById,
  getTeacherByEmail,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAvailability,
  setTeacherAvailability,
  toggleTeacherAvailability,
  deleteTeacherAvailability,
  getTeacherAssignments,
  getTeacherSchedule,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment,
  getTeacherWorkload,
  getAvailableTeachers,
};
