import prisma from '@/lib/prisma';
import { IAttendance } from '@/types';

// Obtener asistencia de un grupo en una clase específica
export const getAttendanceByAssignment = async (
  teacherSubjectGroupId: string,
  sessionDate: Date
) => {
  return await prisma.attendance.findMany({
    where: {
      teacherSubjectGroupId,
      sessionDate: {
        gte: new Date(sessionDate.toDateString()),
        lt: new Date(new Date(sessionDate).setDate(sessionDate.getDate() + 1)),
      },
    },
    include: {
      student: true,
    },
  });
};

// Crear registro de asistencia
export const createAttendance = async (
  data: Omit<IAttendance, 'id' | 'createdAt' | 'updatedAt'>
) => {
  return await prisma.attendance.upsert({
    where: {
      teacherSubjectGroupId_studentId_sessionDate: {
        teacherSubjectGroupId: data.teacherSubjectGroupId,
        studentId: data.studentId,
        sessionDate: data.sessionDate,
      },
    },
    update: {
      status: data.status,
      notes: data.notes,
    },
    create: data,
  });
};

// Obtener resumen de asistencia por estudiante
export const getStudentAttendanceSummary = async (studentId: string, month?: number) => {
  const where: any = { studentId };

  if (month) {
    const year = new Date().getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    where.sessionDate = {
      gte: startDate,
      lt: endDate,
    };
  }

  return await prisma.attendance.findMany({
    where,
    include: {
      teacherSubjectGroup: {
        include: {
          subject: true,
          group: true,
        },
      },
    },
    orderBy: { sessionDate: 'desc' },
  });
};

// Obtener reporte de asistencia por grupo y semana
export const getGroupAttendanceReport = async (groupId: string, startDate: Date, endDate: Date) => {
  return await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      teacherSubjectGroup: {
        groupId,
      },
      sessionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  });
};
