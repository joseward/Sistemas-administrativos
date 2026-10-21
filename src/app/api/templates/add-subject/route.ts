import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { templateId, subjectId } = await request.json();

    if (!templateId || !subjectId) {
      return NextResponse.json({ error: 'templateId and subjectId required' }, { status: 400 });
    }

    // Verificar si ya existe en la plantilla
    const existing = await prisma.templateSubject.findUnique({
      where: {
        templateId_subjectId: {
          templateId,
          subjectId
        }
      }
    });

    if (!existing) {
      await prisma.templateSubject.create({
        data: {
          templateId,
          subjectId
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding subject to template:', error);
    return NextResponse.json({ error: 'Failed to add subject' }, { status: 500 });
  }
}
