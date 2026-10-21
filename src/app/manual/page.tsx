'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  Link2,
  FileSignature,
  FolderOpen,
  CheckSquare,
  Shield,
  Sparkles,
  Printer,
  Search,
  ChevronLeft,
  ArrowRight,
  Clock,
  FileText,
  Bell,
  Download,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  PlayCircle,
  MousePointerClick,
  Layers,
  UserCheck,
  LogIn,
  Upload,
  LayoutList,
} from 'lucide-react';

interface ManualStep {
  title: string;
  description: string;
}

interface ButtonGuide {
  label: string;
  colorClass: string;
  meaning: string;
}

interface AdminModuleManual {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  accentColor: string;
  bgSoft: string;
  whatIsItFor: string;
  steps: ManualStep[];
  buttons: ButtonGuide[];
  proTip: string;
}

const ADMIN_MODULES: AdminModuleManual[] = [
  {
    id: 'dashboard',
    number: '01',
    title: 'Panel Principal y Semáforo de Control',
    subtitle: 'Vista general del estado del ciclo escolar en tiempo real',
    href: '/',
    icon: Layers,
    accentColor: 'text-[#061266]',
    bgSoft: 'bg-blue-50',
    whatIsItFor:
      'Es la pantalla de inicio del Administrador. Te muestra de un vistazo qué porcentaje de las clases ya tienen maestro asignado y cuatro alertas clave (semáforo) para saber qué requiere tu atención inmediata.',
    steps: [
      {
        title: 'Revisa la Barra de Progreso del Ciclo Escolar',
        description:
          'En la parte superior verás el porcentaje de materias cubiertas. Si faltan materias por asignar, haz clic en el botón azul "Asignar X materias pendientes" para ir directo a resolverlas.',
      },
      {
        title: 'Atiende las 4 Tarjetas del Semáforo',
        description:
          'Cada tarjeta de color te indica una tarea: Roja (Materias sin maestro), Amarilla (Maestros que no han subido su disponibilidad), Naranja (Expedientes de documentos incompletos) y Verde (Plantillas completadas al 100%).',
      },
      {
        title: 'Navega rápido entre departamentos',
        description:
          'Una vez que entres a cualquier departamento, aparecerá arriba una barra de acceso rápido numerada (1. Maestros → 7. Asistencia) para cambiar de módulo sin regresar al menú.',
      },
    ],
    buttons: [
      {
        label: 'Asignar materias pendientes',
        colorClass: 'bg-[#061266] text-white',
        meaning: 'Abre la Matriz de Horarios filtrando únicamente las clases que aún no tienen docente.',
      },
      {
        label: 'Enviar recordatorios →',
        colorClass: 'bg-amber-100 text-amber-800 border border-amber-300',
        meaning: 'Te lleva al listado de maestros que aún no han llenado sus horas disponibles.',
      },
    ],
    proTip:
      'Al iniciar cada cuatrimestre, tu meta es llevar la tarjeta roja ("Materias sin asignar") y la tarjeta amarilla ("Sin disponibilidad") a cero.',
  },
  {
    id: 'grupos',
    number: '02',
    title: 'Departamento de Grupos y Plantillas',
    subtitle: 'El primer paso al iniciar un ciclo escolar o cuatrimestre',
    href: '/grupos',
    icon: GraduationCap,
    accentColor: 'text-indigo-700',
    bgSoft: 'bg-indigo-50',
    whatIsItFor:
      'Aquí defines qué grupos existen en la universidad (ej. LAET1, I.I2, CYF1), a qué carrera, cuatrimestre, módulo, turno y aula pertenecen, y qué materias lleva cada grupo.',
    steps: [
      {
        title: 'Filtra por Nivel Académico, Carrera o Cuatrimestre',
        description:
          'Usa las pestañas superiores para ver todas las licenciaturas o enfocarte en una carrera específica, y filtra por Módulo 1 o Módulo 2.',
      },
      {
        title: 'Crea una nueva Plantilla de Grupo',
        description:
          'Haz clic en "+ Crear Plantilla de Grupo", selecciona la Carrera, el Cuatrimestre, el Módulo (1 o 2), el Turno (Matutino, Vespertino, Sabatino), el Aula base y marca las materias que cursará ese grupo.',
      },
      {
        title: 'Promoción Masiva al cambiar de Cuatrimestre',
        description:
          'Cuando termina un cuatrimestre, no necesitas recrear los grupos desde cero: haz clic en "Promover Todos (+1 Cuatri)" y el sistema avanzará todos los grupos al siguiente grado con sus nuevas materias del plan de estudios.',
      },
    ],
    buttons: [
      {
        label: '+ Crear Plantilla de Grupo',
        colorClass: 'bg-purple-600 text-white',
        meaning: 'Abre la ventana para dar de alta un nuevo grupo con sus materias y horario base.',
      },
      {
        label: 'Promover Todos (+1 Cuatri)',
        colorClass: 'bg-amber-500 text-white',
        meaning: 'Avanza automáticamente todos los grupos actuales al siguiente cuatrimestre.',
      },
    ],
    proTip:
      'Siempre crea primero las Plantillas de Grupos antes de ir a Horarios, ya que las materias que agregues aquí son las que aparecerán listas para asignarles maestro.',
  },
  {
    id: 'maestros',
    number: '03',
    title: 'Departamento de Maestros y Disponibilidad',
    subtitle: 'Registro de docentes, consulta de horas libres y avisos por WhatsApp',
    href: '/maestros',
    icon: Users,
    accentColor: 'text-blue-700',
    bgSoft: 'bg-blue-50',
    whatIsItFor:
      'Permite dar de alta a los profesores, verificar quiénes ya enviaron su horario disponible desde su Portal Docente y enviarles recordatorios personalizados por WhatsApp en un solo clic.',
    steps: [
      {
        title: 'Registra a tus docentes con su correo real',
        description:
          'Haz clic en "+ Agregar Maestro" y llena su nombre, correo electrónico y teléfono. Importante: el correo que pongas aquí debe ser exactamente el mismo con el que el maestro iniciará sesión en su Portal Docente.',
      },
      {
        title: 'Consulta su Disponibilidad Semanal',
        description:
          'En la tarjeta de cada maestro verás si ya tiene bloques registrados. Haz clic en el botón del reloj para ver su cuadrícula de Lunes a Domingo con sus horas libres en color verde.',
      },
      {
        title: 'Envía Recordatorios por WhatsApp (Editable)',
        description:
          'Si un maestro no ha subido su disponibilidad o documentos, haz clic en el icono verde de campana/mensaje. Se abrirá una ventana donde podrás revisar o personalizar el texto antes de abrir WhatsApp.',
      },
    ],
    buttons: [
      {
        label: '+ Agregar Maestro',
        colorClass: 'bg-[#061266] text-white',
        meaning: 'Registra un nuevo profesor en el padrón de la escuela.',
      },
      {
        label: 'Icono Campana Verde (WhatsApp)',
        colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        meaning: 'Abre el editor de mensaje predeterminado y envía el recordatorio al WhatsApp del docente.',
      },
      {
        label: 'Guardar como predeterminado',
        colorClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        meaning: 'Dentro del modal de WhatsApp, guarda tu plantilla de mensaje favorita para futuros envíos.',
      },
    ],
    proTip:
      'Usa la variable {nombre} dentro de la plantilla de WhatsApp para que el sistema escriba automáticamente el nombre de cada profesor al enviarle el mensaje.',
  },
  {
    id: 'fusion',
    number: '04',
    title: 'Departamento de Fusión de Grupos',
    subtitle: 'Unir materias de tronco común entre distintas licenciaturas',
    href: '/fusion-grupos',
    icon: Link2,
    accentColor: 'text-orange-600',
    bgSoft: 'bg-orange-50',
    whatIsItFor:
      'Cuando dos o más carreras llevan la misma materia (tronco común) en el mismo turno, este departamento te permite unirlas para que un solo maestro les dé clase al mismo tiempo en el mismo salón.',
    steps: [
      {
        title: 'Usa el Detector Inteligente de Auto-Fusión',
        description:
          'En la parte superior verás el recuadro "Oportunidades de Fusión Detectadas". El sistema busca automáticamente materias con el mismo nombre o clave entre distintos grupos.',
      },
      {
        title: 'Fusiona en 1 Clic o Manualmente',
        description:
          'Puedes presionar "Preparar Fusión" en cualquiera de las sugerencias automáticas, o seleccionar manualmente los grupos, el maestro, el día, la hora y el salón compartido.',
      },
      {
        title: 'Verifica las Fusiones Activas',
        description:
          'En la parte inferior verás todas las clases fusionadas. En el horario del maestro aparecerán consolidadas como una sola clase indicando los grupos participantes.',
      },
    ],
    buttons: [
      {
        label: 'Preparar Fusión',
        colorClass: 'bg-amber-600 text-white',
        meaning: 'Carga automáticamente los grupos que comparten una materia para asignarlos juntos.',
      },
      {
        label: 'Crear Fusión de Grupos',
        colorClass: 'bg-[#061266] text-white',
        meaning: 'Guarda la asignación simultánea para todos los grupos seleccionados sin choque de horario.',
      },
    ],
    proTip:
      'Fusionar primero las materias de tronco común te ahorra horas de presupuesto docente y evita que el sistema marque choque de horario al asignar el mismo profesor a dos grupos a la misma hora.',
  },
  {
    id: 'horarios',
    number: '05',
    title: 'Departamento de Horarios (Matriz y Asignación)',
    subtitle: 'El corazón operativo para armar horarios sin choques y exportar a Excel',
    href: '/horarios',
    icon: Calendar,
    accentColor: 'text-amber-600',
    bgSoft: 'bg-amber-50',
    whatIsItFor:
      'Aquí asignas qué maestro dará cada materia, en qué día y a qué hora. El sistema te muestra en verde las horas disponibles del docente y te avisa si intentas asignarlo en un horario ocupado.',
    steps: [
      {
        title: 'Elige tu Vista de Trabajo (Matriz, Vista Semanal o Lista)',
        description:
          'La vista "Matriz de Asignación" es la más rápida: muestra todas las materias de cada grupo y su estado (Asignada en verde o Pendiente en amarillo).',
      },
      {
        title: 'Asigna un Maestro validando su Disponibilidad',
        description:
          'Al hacer clic en "Asignar" sobre una materia, selecciona al docente. Verás de inmediato qué días y horas marcó como disponibles (en verde) y si tiene choque con otra clase.',
      },
      {
        title: 'Imprime Horarios o Descarga el Excel Institucional',
        description:
          'Usa el botón "Exportar Excel" para descargar la sábana completa de horarios para Dirección o Control Escolar, o usa "Imprimir" para generar los formatos por grupo o por docente.',
      },
    ],
    buttons: [
      {
        label: 'Solo Pendientes',
        colorClass: 'bg-amber-100 text-amber-800 border border-amber-300',
        meaning: 'Oculta las materias que ya están listas para que te concentres únicamente en las que faltan.',
      },
      {
        label: 'Exportar Excel',
        colorClass: 'bg-emerald-600 text-white',
        meaning: 'Descarga un archivo .xlsx con todas las asignaciones, carreras, aulas, módulos y docentes.',
      },
      {
        label: 'Tour Guiado',
        colorClass: 'bg-purple-50 text-purple-700 border border-purple-200',
        meaning: 'Inicia un recorrido interactivo en pantalla explicando cada filtro de Horarios.',
      },
    ],
    proTip:
      'En cuanto asignas una materia aquí, aparece de forma instantánea en el "Portal del Docente" de ese profesor sin que tengas que enviársela por separado.',
  },
  {
    id: 'contratos',
    number: '06',
    title: 'Departamento de Contratos Docentes',
    subtitle: 'Generación e impresión de contratos individuales por ciclo escolar',
    href: '/maestros/contratos',
    icon: FileSignature,
    accentColor: 'text-rose-600',
    bgSoft: 'bg-rose-50',
    whatIsItFor:
      'Genera automáticamente el contrato legal de prestación de servicios de cada profesor tomando sus datos personales y las materias/horas que ya le asignaste en Horarios.',
    steps: [
      {
        title: 'Selecciona al Docente en la lista',
        description:
          'Busca al profesor y haz clic en ver o generar contrato. El sistema calculará sus horas semanales asignadas.',
      },
      {
        title: 'Revisa e Imprime el Contrato Oficial',
        description:
          'Verifica las cláusulas, el ciclo escolar y la tabla de materias incluidas. Haz clic en Imprimir para obtener el documento en formato A4 listo para firma.',
      },
    ],
    buttons: [
      {
        label: 'Ver / Imprimir Contrato',
        colorClass: 'bg-rose-600 text-white',
        meaning: 'Abre la vista previa formal del contrato del docente lista para impresión o PDF.',
      },
    ],
    proTip:
      'Genera los contratos una vez que hayas terminado de asignar las materias del docente en el módulo de Horarios para que su carga horaria salga completa.',
  },
  {
    id: 'documentos',
    number: '07',
    title: 'Departamento de Expedientes y Documentos',
    subtitle: 'Control de los 10 documentos oficiales requeridos a cada docente',
    href: '/documentos',
    icon: FolderOpen,
    accentColor: 'text-sky-600',
    bgSoft: 'bg-sky-50',
    whatIsItFor:
      'Permite supervisar qué maestros ya subieron sus documentos digitales (INE, CURP, RFC, CV, Título, Cédula, Comprobante de domicilio, etc.), visualizarlos o subir archivos en su nombre.',
    steps: [
      {
        title: 'Identifica Expedientes Incompletos',
        description:
          'Verás una barra de progreso por cada docente (ej. 6 / 10 documentos entregados). Puedes filtrar para ver quiénes tienen documentos pendientes.',
      },
      {
        title: 'Visualiza o Descarga los Archivos PDF',
        description:
          'Haz clic sobre el expediente de cualquier profesor para abrir y revisar la validez de los documentos que subió desde su Portal Docente.',
      },
    ],
    buttons: [
      {
        label: 'Ver Expediente',
        colorClass: 'bg-sky-600 text-white',
        meaning: 'Muestra el listado detallado de los 10 documentos del docente y permite abrirlos.',
      },
    ],
    proTip:
      'Si un maestro te entrega un documento en memoria USB o por WhatsApp, tú también puedes subirlo directamente desde aquí a su expediente.',
  },
  {
    id: 'asistencia-usuarios',
    number: '08',
    title: 'Asistencia Semanal y Control de Usuarios',
    subtitle: 'Listas de firmas para aulas y administración de cuentas de acceso',
    href: '/asistencia',
    icon: CheckSquare,
    accentColor: 'text-emerald-600',
    bgSoft: 'bg-emerald-50',
    whatIsItFor:
      'En "Asistencia" puedes generar e imprimir los formatos semanales de control de asistencia docente; y en "Usuarios" creas las cuentas (correo y contraseña) tanto de Administradores como de Docentes.',
    steps: [
      {
        title: 'Imprime Listas de Asistencia (/asistencia)',
        description:
          'Filtra por fecha o docente y genera el formato imprimible para firma de entrada y salida de clases.',
      },
      {
        title: 'Crea Cuentas de Acceso (/usuarios)',
        description:
          'Para que un maestro pueda entrar a su Portal Docente, ve a "Usuarios", crea su cuenta con rol "Docente" usando exactamente el mismo correo que registraste en su ficha de Maestro.',
      },
      {
        title: 'Desbloqueo y Cambio de Contraseña',
        description:
          'Si un docente olvida su contraseña o bloquea su cuenta por intentos fallidos, desde "Usuarios" puedes desbloquearlo o asignarle una nueva contraseña en segundos.',
      },
    ],
    buttons: [
      {
        label: '+ Nuevo Usuario',
        colorClass: 'bg-purple-600 text-white',
        meaning: 'Crea una credencial de acceso con rol Administrador o Docente.',
      },
      {
        label: 'Desbloquear / Cambiar Contraseña',
        colorClass: 'bg-gray-100 text-gray-800 border border-gray-300',
        meaning: 'Restablece el acceso de cualquier usuario sin perder su información.',
      },
    ],
    proTip:
      'Recuerda la regla de oro para el acceso de maestros: el correo en "Usuarios" (rol Docente) y el correo en "Maestros" deben ser idénticos.',
  },
];

const AI_PROMPT_EXAMPLES = [
  {
    category: 'Consultas de Datos en Vivo',
    examples: [
      '¿Qué materias faltan por asignar en este ciclo?',
      '¿Qué maestros todavía no han enviado su disponibilidad?',
      '¿A qué docentes les faltan documentos en su expediente?',
      '¿Qué grupos o materias me recomiendas fusionar?',
    ],
  },
  {
    category: 'Acciones y Navegación Automática',
    examples: [
      'Llévame a las materias pendientes en Horarios',
      'Inicia el tour guiado de horarios',
      'Envíale un recordatorio de WhatsApp al maestro José Manuel',
      'Llévame al departamento de Fusión de Grupos',
    ],
  },
];

const TEACHER_STEPS = [
  {
    stepNumber: 'Paso 1',
    title: 'Cómo Iniciar Sesión en tu Portal Docente',
    subtitle: 'Acceso seguro desde computadora o teléfono celular',
    icon: LogIn,
    color: 'bg-[#061266] text-white',
    softBg: 'bg-blue-50 border-blue-200',
    instructions: [
      'Ingresa al enlace oficial del sistema que te proporcionó Coordinación Académica.',
      'En la pantalla de bienvenida, asegúrate de seleccionar la pestaña "Portal Docente" (ubicada en la parte superior del formulario).',
      'Escribe tu Correo Electrónico institucional o personal (el mismo que registraste en Coordinación) y tu Contraseña.',
      'Presiona el botón "Iniciar Sesión". Entrarás directamente a tu menú personal con 3 tarjetas principales.',
    ],
    importantNote:
      'Si al entrar ves el aviso "Perfil No Encontrado", significa que tu correo de usuario tiene alguna letra diferente al registrado en la base de Maestros. Avísale a Coordinación para que sincronicen tu correo.',
  },
  {
    stepNumber: 'Paso 2',
    title: 'Cómo Enviar tu Disponibilidad de Horario',
    subtitle: 'Indica qué días y horas tienes libres para impartir clase',
    icon: Clock,
    color: 'bg-emerald-600 text-white',
    softBg: 'bg-emerald-50 border-emerald-200',
    instructions: [
      'En el menú principal de tu portal, haz clic en la primera tarjeta: "Envío de Disponibilidad".',
      'Verás una cuadrícula con los días de la semana (Lunes a Domingo) y los bloques de horario desde las 07:00 hasta las 21:00.',
      'Haz clic sobre los recuadros de las horas en las que SÍ puedes dar clase. Los bloques seleccionados se pintarán de color VERDE.',
      'Si deseas marcar o desmarcar un día completo, puedes hacer clic directamente sobre los recuadros correspondientes.',
      'Al terminar, presiona el botón "Guardar Disponibilidad". Coordinación Académica recibirá tus horas disponibles al instante.',
    ],
    importantNote:
      'Recuerda marcar todos los bloques dentro de tu rango disponible (por ejemplo, si puedes toda la mañana del martes, marca todos los bloques matutinos del martes).',
  },
  {
    stepNumber: 'Paso 3',
    title: 'Cómo Subir tus Documentos (Expediente Digital)',
    subtitle: 'Entrega digital de tu documentación administrativa sin papeleo',
    icon: Upload,
    color: 'bg-blue-600 text-white',
    softBg: 'bg-sky-50 border-sky-200',
    instructions: [
      'Regresa al menú de tu portal y entra en la segunda tarjeta: "Expediente de Documentos".',
      'Verás la lista de los 10 documentos requeridos por la universidad (Currículum Vitae, Acta de Nacimiento, CURP, RFC / Constancia Fiscal, INE, Comprobante de Domicilio, Título Profesional, Cédula Profesional, etc.).',
      'En cada documento, haz clic en el botón para seleccionar el archivo desde tu computadora o celular (se recomienda formato PDF legible) y súbelo.',
      'Conforme subas cada archivo, el indicador cambiará a "Entregado" en color verde y tu contador de avance (ej. 10 / 10 entregados) se actualizará automáticamente.',
    ],
    importantNote:
      'Si necesitas actualizar un documento vencido (como tu Comprobante de Domicilio o Constancia de Situación Fiscal), simplemente vuelve a subir el archivo nuevo en ese mismo apartado.',
  },
  {
    stepNumber: 'Paso 4',
    title: 'Cómo Consultar e Imprimir tu Horario Oficial de Clases',
    subtitle: 'Revisa tus materias, grupos, aulas y descarga tu hoja membretada',
    icon: Calendar,
    color: 'bg-purple-600 text-white',
    softBg: 'bg-purple-50 border-purple-200',
    instructions: [
      'En el menú de tu portal, ingresa a la tercera tarjeta: "Horario Asignado".',
      'En la parte superior verás el resumen de tu carga académica: Total de Materias Asignadas, Horas por Semana y los Días en que impartes clase.',
      'Puedes elegir cómo prefieres ver tu horario en pantalla: "Por Día (Fácil lectura)" te muestra tarjetas ordenadas por día con horario, materia, grupo, carrera y salón; o "Tabla Resumen" para verlo todo en una sola tabla compacta.',
      'Usa los botones "Todos / Módulo 1 / Módulo 2" para filtrar tus materias según el módulo actual.',
      'Para imprimir o guardar en PDF tu horario oficial, haz clic en el botón verde "Imprimir Formato Oficial". El sistema generará automáticamente una hoja membretada de Universidad Aztlán de 1 sola página con espacio de firmas, lista para imprimir o guardar como PDF.',
    ],
    importantNote:
      'Si tus materias tienen la etiqueta "Clase Fusionada", significa que impartirás esa misma asignatura simultáneamente a los grupos indicados dentro de la misma aula.',
  },
];

function ManualContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'docente' ? 'docente' : 'admin';
  const isFromDocentePortal = searchParams.get('role') === 'docente';

  const [activeManual, setActiveManual] = useState<'admin' | 'docente'>(initialRole);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAdminModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ADMIN_MODULES;
    return ADMIN_MODULES.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.whatIsItFor.toLowerCase().includes(q) ||
        m.steps.some(
          s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('es-MX');
    }
  }, []);

  return (
    <div className="min-h-screen print:min-h-0 bg-[#f4f6f8] print:bg-white font-sans pb-16 print:pb-0">
      {/* Barra superior exclusiva si viene desde el Portal Docente */}
      {isFromDocentePortal && (
        <div className="bg-gradient-to-r from-[#061266] to-[#1877f2] text-white shadow-sm print:hidden">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#fdb515]" />
              Centro de Ayuda — Portal del Docente
            </span>
            <Link
              href="/portal-docente"
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a mi Portal Docente
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 print:p-0 print:max-w-none">
        {/* =================================================================== */}
        {/* CABECERA INTERACTIVA EN PANTALLA (SE OCULTA AL IMPRIMIR)            */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-8 mb-8 print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#061266] text-xs font-extrabold uppercase tracking-wider border border-blue-200">
                <BookOpen className="w-3.5 h-3.5" />
                Documentación Oficial Paso a Paso
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#061266] tracking-tight">
                Manual de Usuario de la Plataforma
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Guía práctica diseñada para aprender a utilizar todas las herramientas desde el primer día, sin conocimientos técnicos previos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {!isFromDocentePortal && (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Ir al Panel Principal
                </Link>
              )}
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {activeManual === 'admin'
                  ? 'Imprimir / PDF Manual Administrador'
                  : 'Imprimir / PDF Manual Docente'}
              </button>
            </div>
          </div>

          {/* Selector de Manual (Administrador vs Docente) y Buscador */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 border border-gray-200/80">
              {!isFromDocentePortal && (
                <button
                  onClick={() => setActiveManual('admin')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeManual === 'admin'
                      ? 'bg-[#061266] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  1. Manual del Administrador (Completo)
                </button>
              )}
              <button
                onClick={() => setActiveManual('docente')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeManual === 'docente'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {isFromDocentePortal
                  ? 'Guía Rápida del Portal Docente'
                  : '2. Manual del Docente (Versión Corta)'}
              </button>
            </div>

            {activeManual === 'admin' && (
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar función (ej. WhatsApp, Fusión, Excel, Grupos)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MEMBRETE OFICIAL EXCLUSIVO PARA IMPRESIÓN / PDF                     */}
        {/* =================================================================== */}
        <div
          className="hidden print:block border-b-2 border-[#061266] pb-4 mb-6"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="bg-[#061266] px-3 py-2 rounded-lg">
                <img
                  src="/logo.png"
                  alt="Universidad Aztlán"
                  className="h-9 w-auto brightness-0 invert object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase text-[#061266]">
                  Universidad Aztlán — Campus Playa del Carmen
                </h1>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  {activeManual === 'admin'
                    ? 'Manual Oficial de Operación — Panel de Coordinación Académica'
                    : 'Guía Oficial Paso a Paso — Portal del Docente'}
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] font-bold text-gray-600 border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50">
              <div>DOCUMENTO DE CAPACITACIÓN</div>
              <div>Actualización: {formattedDate}</div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CONTENIDO 1: MANUAL DEL ADMINISTRADOR (AMPLIO Y PASO A PASO)        */}
        {/* =================================================================== */}
        {activeManual === 'admin' && (
          <div
            className="space-y-8"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            {/* MAPA DE 5 PASOS PARA PRINCIPIANTES */}
            <div className="bg-gradient-to-br from-[#061266] to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md avoid-break">
              <div className="flex items-center gap-2 text-[#fdb515] text-xs font-black uppercase tracking-widest mb-2">
                <PlayCircle className="w-4 h-4" />
                ¿Por dónde empiezo si es mi primera vez?
              </div>
              <h2 className="text-xl sm:text-2xl font-black mb-2">
                El Orden Ideal de Trabajo en 5 Pasos (Inicio de Cuatrimestre)
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mb-6 max-w-3xl">
                Para que el sistema trabaje a tu favor sin estrés, sigue siempre esta secuencia lógica al comenzar cualquier periodo escolar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  {
                    step: 'Paso 1',
                    title: 'Grupos y Plantillas',
                    desc: 'Crea los grupos del cuatrimestre o usa "Promover Todos" para avanzar los existentes.',
                  },
                  {
                    step: 'Paso 2',
                    title: 'Alta de Maestros',
                    desc: 'Registra a los docentes con su correo y pídeles por WhatsApp que llenen su disponibilidad.',
                  },
                  {
                    step: 'Paso 3',
                    title: 'Fusión de Grupos',
                    desc: 'Une primero las materias compartidas entre carreras con el detector automático.',
                  },
                  {
                    step: 'Paso 4',
                    title: 'Matriz de Horarios',
                    desc: 'Asigna las materias restantes guiándote por las horas verdes disponibles de cada maestro.',
                  },
                  {
                    step: 'Paso 5',
                    title: 'Contratos y Excel',
                    desc: 'Descarga el Excel general, imprime contratos y verifica los 10 documentos del docente.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#fdb515] text-[#061266] mb-2">
                        {item.step}
                      </span>
                      <h3 className="font-extrabold text-sm text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-blue-100/90 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESGLOSE DETALLADO DE LOS 8 MÓDULOS ADMINISTRATIVOS */}
            <div className="space-y-6">
              {filteredAdminModules.map(mod => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="bg-white rounded-3xl shadow-xs border border-gray-200/90 overflow-hidden avoid-break"
                  >
                    {/* Cabecera del Módulo */}
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/70">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl ${mod.bgSoft} ${mod.accentColor} flex items-center justify-center font-black text-lg shrink-0 border border-gray-200/60`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                              Módulo {mod.number}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-gray-900">
                            {mod.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">{mod.subtitle}</p>
                        </div>
                      </div>

                      <Link
                        href={mod.href}
                        className="print:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#061266] border border-gray-200 text-xs font-bold transition-colors shadow-2xs"
                      >
                        Ir al módulo <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Cuerpo del Módulo */}
                    <div className="p-6 space-y-6">
                      {/* ¿Para qué sirve? */}
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#061266] mb-1 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          ¿Para qué sirve este departamento?
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {mod.whatIsItFor}
                        </p>
                      </div>

                      {/* Pasos Numerados */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
                          ¿Cómo se usa paso a paso?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {mod.steps.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className="rounded-2xl border border-gray-200/80 p-4 bg-white flex flex-col"
                            >
                              <div className="flex items-center gap-2.5 mb-2">
                                <span className="w-6 h-6 rounded-full bg-[#061266] text-white text-xs font-black flex items-center justify-center shrink-0">
                                  {sIdx + 1}
                                </span>
                                <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-snug">
                                  {st.title}
                                </h5>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {st.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Guía Visual de Botones Clave */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
                          <MousePointerClick className="w-4 h-4 text-gray-500" />
                          Botones clave que encontrarás en esta pantalla:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mod.buttons.map((btn, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200/70"
                            >
                              <span
                                className={`inline-block px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 ${btn.colorClass}`}
                              >
                                {btn.label}
                              </span>
                              <p className="text-xs text-gray-600 leading-snug">{btn.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Consejo Práctico */}
                      <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-950 leading-relaxed">
                          <strong>Consejo práctico:</strong> {mod.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECCIÓN ESPECIAL: MANUAL DEL COPILOTO IA GEMINI */}
            <div className="bg-white rounded-3xl shadow-xs border border-blue-200 overflow-hidden avoid-break">
              <div className="bg-gradient-to-r from-[#061266] to-blue-900 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#fdb515]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#fdb515]">
                      Inteligencia Artificial Integrada
                    </span>
                    <h3 className="text-lg sm:text-xl font-black">
                      Cómo usar el Copiloto IA (Gemini)
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  En la esquina inferior derecha del panel de Administrador encontrarás el botón redondo azul con el icono de robot y una estrella dorada. Al abrirlo, puedes conversar con la IA que está conectada <strong>en tiempo real a la base de datos de la universidad</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AI_PROMPT_EXAMPLES.map((group, gIdx) => (
                    <div
                      key={gIdx}
                      className="rounded-2xl border border-gray-200 p-4 bg-gray-50/60"
                    >
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#061266] mb-3">
                        {group.category}
                      </h4>
                      <ul className="space-y-2">
                        {group.examples.map((ex, eIdx) => (
                          <li
                            key={eIdx}
                            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 font-semibold text-gray-800 flex items-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>&ldquo;{ex}&rdquo;</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* CONTENIDO 2: MANUAL DEL DOCENTE (CORTO, DIRECTO Y AMIGABLE)         */}
        {/* =================================================================== */}
        {activeManual === 'docente' && (
          <div
            className="space-y-6"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            {/* Introducción rápida para el maestro */}
            <div className="bg-gradient-to-r from-[#061266] to-[#1877f2] text-white rounded-3xl p-6 sm:p-8 shadow-sm avoid-break">
              <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#fdb515] text-[#061266] mb-3">
                Guía Rápida en 4 Pasos
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                Bienvenido al Portal del Docente — Universidad Aztlán
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
                Tu portal fue diseñado para ser rápido y sencillo. Desde aquí únicamente necesitas realizar <strong>3 actividades esenciales</strong> cada ciclo escolar: registrar tus horas libres, subir tus documentos digitales y consultar o imprimir tu horario oficial de clases.
              </p>
            </div>

            {/* Los 4 Pasos del Docente */}
            <div className="grid grid-cols-1 gap-6">
              {TEACHER_STEPS.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden avoid-break"
                  >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/70">
                      <div
                        className={`w-11 h-11 rounded-2xl ${st.color} flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                          {st.stepNumber}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-gray-900">
                          {st.title}
                        </h3>
                        <p className="text-xs text-gray-500">{st.subtitle}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <ol className="space-y-3">
                        {st.instructions.map((inst, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-blue-50 text-[#061266] border border-blue-200 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                              {iIdx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                              {inst}
                            </span>
                          </li>
                        ))}
                      </ol>

                      <div
                        className={`rounded-2xl border p-3.5 flex items-start gap-3 ${st.softBg}`}
                      >
                        <AlertCircle className="w-4 h-4 text-[#061266] shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-800 leading-relaxed">
                          <strong>Nota importante:</strong> {st.importantNote}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen de Dudas Frecuentes del Maestro */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 avoid-break">
              <h3 className="text-base font-black text-[#061266] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Preguntas Frecuentes del Docente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                  <p className="font-extrabold text-gray-900 mb-1">
                    ¿Por qué dice &ldquo;Horario en Preparación&rdquo;?
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Significa que Coordinación Académica aún está asignando tus grupos. En cuanto te asignen tus materias, aparecerán automáticamente en esa misma pantalla.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                  <p className="font-extrabold text-gray-900 mb-1">
                    ¿Puedo modificar mi disponibilidad después de enviarla?
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Sí. Puedes entrar nuevamente a &ldquo;Envío de Disponibilidad&rdquo;, marcar o desmarcar bloques y presionar &ldquo;Guardar Disponibilidad&rdquo; para actualizarla.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                  <p className="font-extrabold text-gray-900 mb-1">
                    ¿Cómo descargo mi horario en PDF para mi celular?
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Dentro de &ldquo;Horario Asignado&rdquo;, haz clic en el botón verde &ldquo;Imprimir Formato Oficial&rdquo; y en destino de impresión elige &ldquo;Guardar como PDF&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManualPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Cargando manual de usuario...
        </div>
      }
    >
      <ManualContent />
    </Suspense>
  );
}
