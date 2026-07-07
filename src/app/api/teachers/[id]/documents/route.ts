import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET /api/teachers/[id]/documents
// Obtiene todos los documentos de un docente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documents = await prisma.teacherDocument.findMany({
      where: { teacherId: params.id },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/teachers/[id]/documents
// Sube un nuevo documento o sustituye uno existente
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const description = (formData.get('description') as string) || '';

    if (!file || !type) {
      return NextResponse.json({ success: false, error: 'Archivo y tipo son requeridos' }, { status: 400 });
    }

    // Validar tipo de archivo (PDF o Word)
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Formato inválido. Solo se permiten archivos PDF o Word (.doc, .docx)' 
      }, { status: 400 });
    }

    const teacherId = params.id;
    
    // Validar que el maestro existe
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Docente no encontrado' }, { status: 404 });
    }

    // Subir a Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${teacherId}/${fileName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Subir a Supabase Storage usando el cliente administrador (ignora RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('teacher-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error subiendo archivo: ${uploadError.message}`);
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from('teacher-documents')
      .getPublicUrl(filePath);

    // Guardar en la base de datos (Upsert para sustituir si ya existe el mismo tipo)
    const existingDoc = await prisma.teacherDocument.findUnique({
      where: {
        teacherId_type: {
          teacherId: teacherId,
          type: type
        }
      }
    });

    let document;
    if (existingDoc) {
      document = await prisma.teacherDocument.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl: publicUrl,
          fileName: file.name,
          description: description
        }
      });
      
      // Opcional: borrar el archivo viejo de Supabase
      const oldFilePath = existingDoc.fileUrl.split('/teacher-documents/')[1];
      if (oldFilePath) {
         await supabaseAdmin.storage.from('teacher-documents').remove([oldFilePath]);
      }
    } else {
      document = await prisma.teacherDocument.create({
        data: {
          teacherId: teacherId,
          type: type,
          fileUrl: publicUrl,
          fileName: file.name,
          description: description
        }
      });
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
