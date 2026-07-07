import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { templateId, subjectId } = await request.json();

    if (!templateId || !subjectId) {
      return NextResponse.json({ error: 'templateId and subjectId required' }, { status: 400 });
    }

    // Remove the subject from the template
    await prisma.templateSubject.deleteMany({
      where: {
        templateId,
        subjectId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing subject from template:', error);
    return NextResponse.json({ error: 'Failed to remove subject' }, { status: 500 });
  }
}
