export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { ensureContractForTeacher } from '@/lib/contracts';
import { DAYS_OF_WEEK } from '@/lib/mockData';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const REQUIRED_DOCS_COUNT = 10;

// Cadena de modelos Gemini 3.x con respaldo automático por si alguno tiene alta demanda (503)
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

async function callGeminiWithFallback(apiKey: string, payload: any) {
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && !data.error) {
        return { ok: true, data, model };
      }

      lastError = data.error;
      // Si es error de sobrecarga (503), cuota (429) o modelo deprecado (404/400), probamos el siguiente modelo inmediatamente
      console.warn(`Modelo ${model} devolvió estado ${res.status}: ${data.error?.message}. Probando respaldo...`);
    } catch (err) {
      lastError = err;
    }
  }

  return { ok: false, error: lastError };
}

// Declaración de herramientas (Function Calling) para Gemini
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'navigate_to_page',
        description:
          'Navega automáticamente a una sección o filtro específico de la plataforma cuando el usuario pide ir, abrir o ver una pantalla.',
        parameters: {
          type: 'OBJECT',
          properties: {
            url: {
              type: 'STRING',
              description:
                'Ruta interna a la cual navegar. Valores válidos: "/", "/maestros", "/maestros?filter=missing_availability", "/grupos", "/fusion-grupos", "/horarios?view=matrix", "/horarios?view=matrix&status=pending", "/horarios?view=matrix&status=assigned", "/horarios?view=week", "/maestros/contratos", "/documentos", "/asistencia", "/usuarios".',
            },
            label: {
              type: 'STRING',
              description: 'Texto descriptivo corto del destino, ej: "Ir a Materias Pendientes".',
            },
          },
          required: ['url', 'label'],
        },
      },
      {
        name: 'start_guided_tour',
        description:
          'Inicia el tour interactivo guiado paso a paso en la pantalla de Horarios o Grupos.',
        parameters: {
          type: 'OBJECT',
          properties: {
            tourId: {
              type: 'STRING',
              description: 'Identificador del tour: "horarios-tour" o "grupos-tour".',
            },
          },
          required: ['tourId'],
        },
      },
      {
        name: 'create_teacher',
        description:
          'Registra un nuevo maestro/docente en la base de datos y crea su cuenta de acceso al Portal Docente (contraseña inicial: docente123). Úsalo cuando el usuario pida dar de alta o registrar un maestro.',
        parameters: {
          type: 'OBJECT',
          properties: {
            firstName: {
              type: 'STRING',
              description: 'Nombre(s) del maestro.',
            },
            lastName: {
              type: 'STRING',
              description: 'Apellidos del maestro.',
            },
            email: {
              type: 'STRING',
              description: 'Correo electrónico del maestro.',
            },
            phone: {
              type: 'STRING',
              description: 'Teléfono de 10 dígitos del maestro (opcional).',
            },
            cedula: {
              type: 'STRING',
              description: 'Cédula profesional (opcional).',
            },
          },
          required: ['firstName', 'lastName', 'email'],
        },
      },
      {
        name: 'assign_teacher_to_subject',
        description:
          'Asigna un maestro a una materia de un grupo en un módulo específico y actualiza su contrato automáticamente. Úsalo cuando el usuario pida asignar una clase o materia a un docente.',
        parameters: {
          type: 'OBJECT',
          properties: {
            teacherId: {
              type: 'STRING',
              description: 'ID exacto del maestro (tomado del contexto del sistema).',
            },
            subjectId: {
              type: 'STRING',
              description: 'ID exacto de la materia (tomado del contexto del sistema).',
            },
            groupId: {
              type: 'STRING',
              description: 'ID exacto del grupo (tomado del contexto del sistema).',
            },
            modulo: {
              type: 'INTEGER',
              description: 'Número de módulo (1 o 2).',
            },
            scheduleDay: {
              type: 'INTEGER',
              description: 'Día de la semana (0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo).',
            },
            startTime: {
              type: 'STRING',
              description: 'Hora de inicio en formato HH:MM, ej. "08:00".',
            },
            endTime: {
              type: 'STRING',
              description: 'Hora de fin en formato HH:MM, ej. "09:30".',
            },
            classroom: {
              type: 'STRING',
              description: 'Aula asignada, ej. "Aula 101".',
            },
          },
          required: ['teacherId', 'subjectId', 'groupId', 'modulo'],
        },
      },
      {
        name: 'fuse_subjects',
        description:
          'Fusiona automáticamente una materia que se imparte en múltiples grupos en el mismo módulo para que compartan el mismo maestro, aula y horario.',
        parameters: {
          type: 'OBJECT',
          properties: {
            subjectName: {
              type: 'STRING',
              description: 'Nombre de la materia a fusionar.',
            },
            modulo: {
              type: 'INTEGER',
              description: 'Número de módulo (1 o 2).',
            },
          },
          required: ['subjectName', 'modulo'],
        },
      },
      {
        name: 'prepare_whatsapp_reminder',
        description:
          'Genera un botón directo de WhatsApp en el chat para enviar un recordatorio formal a un docente (sobre disponibilidad o documentos faltantes).',
        parameters: {
          type: 'OBJECT',
          properties: {
            teacherName: {
              type: 'STRING',
              description: 'Nombre completo del docente.',
            },
            phone: {
              type: 'STRING',
              description: 'Teléfono del docente (puede ser vacío si no tiene).',
            },
            message: {
              type: 'STRING',
              description: 'Mensaje formal prellenado para enviar por WhatsApp.',
            },
          },
          required: ['teacherName', 'message'],
        },
      },
    ],
  },
];

async function buildSystemContext(currentPathname: string) {
  try {
    const [teachers, groups, subjects, templates, assignments, availabilities] = await Promise.all([
      prisma.teacher.findMany({
        include: { documents: true },
        orderBy: { lastName: 'asc' },
      }),
      prisma.group.findMany({
        include: { career: true },
        orderBy: { name: 'asc' },
      }),
      prisma.subject.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.groupTemplate.findMany({
        include: { subjects: true },
      }),
      prisma.teacherSubjectGroup.findMany({
        include: { teacher: true, subject: true, group: true },
      }),
      prisma.teacherAvailability.findMany({
        where: { isAvailable: true },
      }),
    ]);

    const availTeacherIds = new Set(availabilities.map(a => a.teacherId));

    const teachersSummary = teachers.map(t => {
      const hasAvail = availTeacherIds.has(t.id);
      const docCount = t.documents?.length || 0;
      return `- [ID: ${t.id}] ${t.firstName} ${t.lastName} | Correo: ${t.email} | Tel: ${t.phone || 'Sin tel'} | Estado: ${t.contractStatus} | Disponibilidad: ${hasAvail ? 'Enviada' : 'PENDIENTE'} | Expediente: ${docCount}/${REQUIRED_DOCS_COUNT} docs`;
    });

    // Analizar plantillas y estado de cobertura de cada materia
    const pendingClasses: string[] = [];
    const assignedClasses: string[] = [];
    const templateDetails: string[] = [];

    templates.forEach(tpl => {
      const group = groups.find(g => g.id === tpl.groupId);
      if (!group) return;
      const careerName = group.career?.name || 'Sin Carrera';
      const tplSubjects = tpl.subjects || [];

      tplSubjects.forEach(sub => {
        const assign = assignments.find(
          a => a.groupId === tpl.groupId && a.modulo === tpl.modulo && a.subjectId === sub.id && a.teacherId !== null
        );
        if (assign && assign.teacher) {
          const dayLabel = assign.scheduleDay >= 0 ? DAYS_OF_WEEK[assign.scheduleDay] : 'Sin día';
          assignedClasses.push(
            `- Cubierta: "${sub.name}" [subjectId: ${sub.id}] | Grupo ${group.name} [groupId: ${group.id}] (${careerName}, Cuatri ${group.cuatrimestre}, Mód ${tpl.modulo}) -> Docente: ${assign.teacher.firstName} ${assign.teacher.lastName} | ${dayLabel} ${assign.startTime}-${assign.endTime} | Aula: ${assign.classroom || tpl.classroom || 'S/A'}`
          );
        } else {
          pendingClasses.push(
            `- PENDIENTE: "${sub.name}" [subjectId: ${sub.id}] | Grupo ${group.name} [groupId: ${group.id}] (${careerName}, Cuatri ${group.cuatrimestre}, Mód ${tpl.modulo}, Turno: ${tpl.turno}, Aula: ${tpl.classroom || 'S/A'}, Horario base: ${tpl.startTime || '08:00'}-${tpl.endTime || '09:30'})`
          );
        }
      });

      templateDetails.push(
        `- Grupo ${group.name} [groupId: ${group.id}] (${careerName}, Cuatri ${group.cuatrimestre}, Mód ${tpl.modulo}, Turno ${tpl.turno}, Aula ${tpl.classroom || 'S/A'}): ${tplSubjects.length} materias (${tplSubjects.map(s => s.name).join(', ')})`
      );
    });

    return `
Eres el **Copiloto Administrativo con IA (Gemini)** de la plataforma escolar de **Universidad Aztlán (Playa del Carmen)**.
Tu objetivo es hacer el trabajo del personal administrativo súper sencillo, rápido y sin estrés. Hablas siempre en español, de forma clara, amable, profesional y concisa.

### UBICACIÓN ACTUAL DEL USUARIO:
El usuario está viendo actualmente la ruta: \`${currentPathname || '/'}\`

### CONOCIMIENTO COMPLETO DE LA PLATAFORMA Y SUS MÓDULOS:
La plataforma sigue un flujo ordenado de 7 pasos (accesibles desde la barra superior):
1. **1. Maestros (\`/maestros\`)**:
   - Registro y edición de docentes (sin requerir especialidad).
   - Al crear un maestro se genera automáticamente su cuenta para el **Portal Docente (\`/portal-docente\`)** con contraseña inicial \`docente123\`.
   - Muestra si el docente ya envió su disponibilidad de horario y tiene botón de **WhatsApp en 1 clic** para recordarle.
2. **2. Grupos y Plantillas (\`/grupos\`)**:
   - Permite gestionar el **Catálogo de Materias**, **Carreras**, **Aulas** y **Grupos**.
   - Una **Plantilla** define qué materias lleva un grupo en el **Módulo 1** o **Módulo 2**, su turno (Matutino, Vespertino, Sabatino, Dominical), aula y horario base.
   - Incluye botones para **Clonar Plantilla**, **Agregar materia rápida in-line**, **Promover Ciclo individual** y **Promover Todos (Promoción Masiva en 1 clic)** al siguiente módulo o cuatrimestre.
3. **3. Fusión de Grupos (\`/fusion-grupos\`)**:
   - Une materias iguales o equivalentes entre distintos grupos/carreras para que compartan el mismo docente, aula y horario sincronizado.
   - Cuenta con un **Detector Automático de Materias para Fusionar** arriba que permite unir grupos en 1 clic.
4. **4. Horarios (\`/horarios\`)**:
   - Tiene 3 vistas:
     - **Matriz Inteligente (Rápida)** (\`/horarios?view=matrix\`): Tabla estilo hoja de cálculo interactiva donde se asignan maestros con 1 clic viendo quién está disponible y sin choques de horario. Incluye botón **Exportar Excel (.xls)** para descargar la Sábana de Horarios.
     - **Vista Clásica**: Tabla tradicional con filtros y botón **"Sugerir Maestro"** automático.
     - **Vista Semanal** (\`/horarios?view=week\`): Calendario visual Lunes a Domingo con código de colores y botón **Generar PDFs / Publicar a Docentes**.
5. **5. Contratos (\`/maestros/contratos\`)**:
   - **Autogeneración inteligente**: En cuanto se le asigna una materia a un docente en Horarios, su contrato se genera o actualiza automáticamente con sus horas semanales, grupos, materias y cláusulas legales.
   - Permite editar tarifa por hora, fechas y **Descargar Contrato en PDF**.
6. **6. Expedientes / Documentos (\`/documentos\`)**:
   - Controla los 10 documentos oficiales requeridos por docente (CV, Acta, INE, Comprobante domicilio, Constancia fiscal, CURP, Título, Cédula, Registro Q. Roo, Info Banco).
   - Permite ver cada archivo, **Descargar Todos en .ZIP** y enviar **Recordatorio por WhatsApp en 1 clic** con la lista exacta de documentos faltantes.
7. **7. Asistencia (\`/asistencia\`)**:
   - Generador de listas de asistencia semanales listas para imprimir por grupo y materia.
8. **Accesos / Usuarios (\`/usuarios\`)**:
   - Administración de cuentas de administradores y docentes, desbloqueo de cuentas y cambio de contraseñas.

### ESTADO EN VIVO DE LA BASE DE DATOS (DATOS REALES ACTUALES):
- **Total de Maestros Registrados (${teachers.length})**:
${teachersSummary.length > 0 ? teachersSummary.join('\n') : '  (No hay maestros registrados aún)'}

- **Plantillas de Grupos Activas (${templates.length})**:
${templateDetails.length > 0 ? templateDetails.join('\n') : '  (No hay plantillas creadas aún)'}

- **Materias Pendientes de Asignar Maestro (${pendingClasses.length})**:
${pendingClasses.length > 0 ? pendingClasses.join('\n') : '  (¡Todas las materias de plantillas están cubiertas!)'}

- **Materias Ya Cubiertas con Maestro (${assignedClasses.length})**:
${assignedClasses.length > 0 ? assignedClasses.join('\n') : '  (Ninguna materia asignada aún)'}

### REGLAS PARA USAR TUS HERRAMIENTAS (ACCIONES):
1. Si el usuario te pide **ir a una sección**, **ver materias pendientes**, **ver maestros sin disponibilidad**, etc., invoca \`navigate_to_page\`.
2. Si el usuario te pide **dar de alta / registrar / crear un maestro** y te da su nombre y correo, invoca \`create_teacher\`. (Si le falta el correo o apellido, pídeselo amablemente).
3. Si el usuario te pide **asignar una materia a un maestro**, busca los IDs exactos (\`teacherId\`, \`subjectId\`, \`groupId\`, \`modulo\`) en la sección "ESTADO EN VIVO DE LA BASE DE DATOS" e invoca \`assign_teacher_to_subject\`.
4. Si el usuario te pide **fusionar una materia**, invoca \`fuse_subjects\`.
5. Si el usuario te pide **recordarle por WhatsApp** a un maestro sobre su disponibilidad o documentos, invoca \`prepare_whatsapp_reminder\`.
`;
  } catch (err) {
    console.error('Error building AI context:', err);
    return 'Eres el Copiloto Administrativo con IA de Universidad Aztlán. Ayuda al usuario con cualquier duda sobre Maestros, Grupos, Fusión, Horarios, Contratos, Expedientes y Asistencia.';
  }
}

// Ejecutar funciones llamadas por Gemini en el servidor
async function executeToolCall(
  call: { name: string; args: any },
  userId?: string
): Promise<{ resultMessage: string; clientAction?: any }> {
  const { name, args } = call;

  if (name === 'navigate_to_page') {
    return {
      resultMessage: `Navegación programada hacia ${args.url} (${args.label}).`,
      clientAction: {
        type: 'NAVIGATE',
        url: args.url,
        label: args.label,
      },
    };
  }

  if (name === 'start_guided_tour') {
    return {
      resultMessage: `Tour guiado "${args.tourId}" iniciado.`,
      clientAction: {
        type: 'START_TOUR',
        tourId: args.tourId,
      },
    };
  }

  if (name === 'prepare_whatsapp_reminder') {
    const cleanPhone = (args.phone || '').replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(args.message || '');
    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone}?text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    return {
      resultMessage: `Enlace de WhatsApp preparado para ${args.teacherName}.`,
      clientAction: {
        type: 'WHATSAPP',
        url: whatsappUrl,
        label: `Enviar WhatsApp a ${args.teacherName}`,
      },
    };
  }

  if (name === 'create_teacher') {
    const { firstName, lastName, email, phone, cedula } = args;
    if (!firstName || !lastName || !email) {
      return { resultMessage: 'Error: Faltan nombre, apellido o correo para crear al maestro.' };
    }

    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) {
      return { resultMessage: `Ya existe un maestro registrado con el correo ${email}.` };
    }

    let school = await prisma.school.findFirst();
    if (!school) {
      school = await prisma.school.create({ data: { name: 'Universidad Aztlán' } });
    }

    const hashedPassword = await bcrypt.hash('docente123', 10);

    const created = await prisma.$transaction(async tx => {
      const teacher = await tx.teacher.create({
        data: {
          schoolId: school.id,
          firstName,
          lastName,
          email,
          phone: phone || null,
          cedula: cedula || null,
          specialization: null,
          contractStatus: 'active',
          createdByUserId: userId,
        },
      });

      const existingUser = await tx.user.findUnique({ where: { email } });
      if (!existingUser) {
        await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'docente',
            firstName,
            lastName,
            status: 'active',
          },
        });
      }
      return teacher;
    });

    return {
      resultMessage: `Maestro ${created.firstName} ${created.lastName} (${created.email}) creado exitosamente en la base de datos con contraseña inicial "docente123".`,
      clientAction: {
        type: 'REFRESH_DATA',
        label: 'Ver en Maestros',
        url: '/maestros',
      },
    };
  }

  if (name === 'assign_teacher_to_subject') {
    const { teacherId, subjectId, groupId, modulo, scheduleDay, startTime, endTime, classroom } = args;
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    const tpl = await prisma.groupTemplate.findFirst({ where: { groupId, modulo: Number(modulo) || 1 } });

    const finalDay =
      scheduleDay !== undefined
        ? Number(scheduleDay)
        : tpl?.turno === 'Sabatino'
        ? 5
        : tpl?.turno === 'Dominical'
        ? 6
        : 1;
    const finalStart = startTime || tpl?.startTime || '08:00';
    const finalEnd = endTime || tpl?.endTime || '09:30';
    const finalRoom = classroom || tpl?.classroom || 'Sin Aula';
    const finalYear = group?.academicYear || '2026-2027';
    const finalCuatri = group?.cuatrimestre || 1;

    await prisma.teacherSubjectGroup.deleteMany({
      where: {
        subjectId,
        groupId,
        modulo: Number(modulo) || 1,
      },
    });

    await prisma.teacherSubjectGroup.create({
      data: {
        teacherId,
        subjectId,
        groupId,
        modulo: Number(modulo) || 1,
        cuatrimestre: finalCuatri,
        academicYear: finalYear,
        scheduleDay: finalDay,
        startTime: finalStart,
        endTime: finalEnd,
        classroom: finalRoom,
        isAvailable: true,
        createdById: userId,
      },
    });

    await ensureContractForTeacher(teacherId, finalYear);

    return {
      resultMessage: `Asignación guardada exitosamente y contrato actualizado automáticamente.`,
      clientAction: {
        type: 'REFRESH_DATA',
        label: 'Ver en Matriz de Horarios',
        url: '/horarios?view=matrix',
      },
    };
  }

  if (name === 'fuse_subjects') {
    const { subjectName, modulo } = args;
    const normTarget = (subjectName || '').trim().toLowerCase();
    const targetMod = Number(modulo) || 1;

    const templates = await prisma.groupTemplate.findMany({
      where: { modulo: targetMod },
      include: { subjects: true, group: true },
    });

    const itemsToFuse: Array<{ groupId: string; modulo: number; subjectId: string; academicYear: string; cuatrimestre: number }> = [];

    templates.forEach(tpl => {
      tpl.subjects.forEach(sub => {
        if (sub.name.trim().toLowerCase().includes(normTarget)) {
          itemsToFuse.push({
            groupId: tpl.groupId,
            modulo: tpl.modulo,
            subjectId: sub.id,
            academicYear: tpl.group.academicYear || '2026-2027',
            cuatrimestre: tpl.group.cuatrimestre || 1,
          });
        }
      });
    });

    if (itemsToFuse.length < 2) {
      return {
        resultMessage: `No se encontraron al menos 2 grupos con la materia "${subjectName}" en el Módulo ${targetMod} para fusionar.`,
      };
    }

    const fusionGroupId = `fusion_${Date.now()}`;
    for (const item of itemsToFuse) {
      const existing = await prisma.teacherSubjectGroup.findFirst({
        where: {
          groupId: item.groupId,
          modulo: item.modulo,
          subjectId: item.subjectId,
        },
      });

      if (existing) {
        await prisma.teacherSubjectGroup.update({
          where: { id: existing.id },
          data: { fusionGroupId },
        });
      } else {
        await prisma.teacherSubjectGroup.create({
          data: {
            groupId: item.groupId,
            modulo: item.modulo,
            subjectId: item.subjectId,
            academicYear: item.academicYear,
            cuatrimestre: item.cuatrimestre,
            fusionGroupId,
            scheduleDay: -1,
            startTime: '',
            endTime: '',
          },
        });
      }
    }

    return {
      resultMessage: `Se fusionaron exitosamente ${itemsToFuse.length} grupos para la materia "${subjectName}" en el Módulo ${targetMod}.`,
      clientAction: {
        type: 'REFRESH_DATA',
        label: 'Ver en Fusión de Grupos',
        url: '/fusion-grupos',
      },
    };
  }

  return { resultMessage: 'Acción completada.' };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      Buffer.from(
        'QVEuQWI4Uk42S05HaGMtWDRoMV9HTTFGOUNWUEhVcEhvQUpobDc3MktwNy1GaENGME9ZdlE=',
        'base64'
      ).toString('utf-8');

    let userId: string | undefined = undefined;
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        userId = payload.id as string;
      } catch {
        // Ignorar si no hay sesión activa
      }
    }

    const body = await request.json();
    const { messages = [], pathname = '/' } = body;

    const systemContext = await buildSystemContext(pathname);

    // Convertir historial de mensajes al formato de Gemini
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const firstCall = await callGeminiWithFallback(apiKey, {
      systemInstruction: {
        parts: [{ text: systemContext }],
      },
      contents,
      tools: GEMINI_TOOLS,
      generationConfig: {
        temperature: 0.3,
        thinkingConfig: {
          thinkingLevel: 'LOW',
        },
      },
    });

    if (!firstCall.ok) {
      console.error('Gemini API Error:', firstCall.error);
      return NextResponse.json(
        {
          success: false,
          error: firstCall.error?.message || 'Error al comunicarse con Gemini AI.',
        },
        { status: 500 }
      );
    }

    const firstData = firstCall.data;
    const candidate = firstData.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Revisar si Gemini solicitó ejecutar alguna herramienta (functionCall)
    const functionCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
    const clientActions: any[] = [];

    if (functionCalls.length > 0) {
      const toolResponsesParts: any[] = [];

      for (const call of functionCalls) {
        const execResult = await executeToolCall(call, userId);
        if (execResult.clientAction) {
          clientActions.push(execResult.clientAction);
        }
        toolResponsesParts.push({
          functionResponse: {
            name: call.name,
            response: {
              result: execResult.resultMessage,
            },
          },
        });
      }

      // Segunda llamada a Gemini con el resultado de las herramientas para que redacte la respuesta final al usuario
      const secondCall = await callGeminiWithFallback(apiKey, {
        systemInstruction: {
          parts: [{ text: systemContext }],
        },
        contents: [
          ...contents,
          candidate.content,
          {
            role: 'function',
            parts: toolResponsesParts,
          },
        ],
        tools: GEMINI_TOOLS,
        generationConfig: {
          temperature: 0.3,
        },
      });

      const finalParts = secondCall.data?.candidates?.[0]?.content?.parts || [];
      const finalText =
        finalParts
          .filter((p: any) => p.text && !p.thought)
          .map((p: any) => p.text)
          .join('\n') || '¡Listo! He ejecutado la acción solicitada.';

      return NextResponse.json({
        success: true,
        reply: finalText,
        actions: clientActions,
      });
    }

    const replyText =
      parts
        .filter((p: any) => p.text && !p.thought)
        .map((p: any) => p.text)
        .join('\n') || 'Estoy listo para ayudarte.';

    return NextResponse.json({
      success: true,
      reply: replyText,
      actions: clientActions,
    });
  } catch (error: any) {
    console.error('Error in /api/assistant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ocurrió un error al procesar tu solicitud con el asistente IA.',
      },
      { status: 500 }
    );
  }
}
