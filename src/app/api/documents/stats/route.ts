import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Definir la lista de documentos obligatorios
    const REQUIRED_DOCS = [
      'CV',
      'ACTA_NACIMIENTO',
      'INE',
      'COMPROBANTE_DOMICILIO',
      'CONSTANCIA_FISCAL',
      'CURP',
      'TITULO',
      'CEDULA',
      'REGISTRO_PROFESIONAL',
      'INFO_BANCO'
    ];

    // Obtener todos los maestros activos o pendientes
    const teachers = await prisma.teacher.findMany({
      where: {
        contractStatus: { in: ['active', 'pending'] }
      },
      include: {
        documents: true
      }
    });

    let missingDocsCount = 0;
    let completeDocsCount = 0;

    teachers.forEach(teacher => {
      const uploadedTypes = teacher.documents.map(d => d.type);
      const isComplete = REQUIRED_DOCS.every(doc => uploadedTypes.includes(doc));
      
      if (isComplete) {
        completeDocsCount++;
      } else {
        missingDocsCount++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalTeachers: teachers.length,
        missingDocsCount,
        completeDocsCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching document stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
