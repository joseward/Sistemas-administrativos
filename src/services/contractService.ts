import prisma from '@/lib/prisma';
import { IContract } from '@/types';

// Obtener contratos de un maestro
export const getTeacherContracts = async (teacherId: string) => {
  return await prisma.contract.findMany({
    where: { teacherId },
    include: {
      teacher: true,
    },
    orderBy: { startDate: 'desc' },
  });
};

// Obtener contrato específico
export const getContractById = async (id: string) => {
  return await prisma.contract.findUnique({
    where: { id },
    include: {
      teacher: true,
      school: true,
    },
  });
};

// Crear contrato
export const createContract = async (
  data: Omit<IContract, 'id' | 'createdAt' | 'updatedAt'>
) => {
  return await prisma.contract.create({
    data,
  });
};

// Actualizar contrato
export const updateContract = async (id: string, data: Partial<IContract>) => {
  return await prisma.contract.update({
    where: { id },
    data,
  });
};

// Firmar contrato (marcar como signed)
export const signContract = async (id: string, signaturePath?: string) => {
  return await prisma.contract.update({
    where: { id },
    data: {
      isSigned: true,
      signedDate: new Date(),
      signaturePath,
    },
  });
};

// Obtener contratos activos de una escuela para un año académico
export const getActiveContracts = async (schoolId: string, academicYear: string) => {
  return await prisma.contract.findMany({
    where: {
      schoolId,
      academicYear,
    },
    include: {
      teacher: true,
    },
    orderBy: { startDate: 'asc' },
  });
};
