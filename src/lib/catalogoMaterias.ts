import { MockSubject } from './mockData';

const RAW_CAREER_SUBJECTS: Record<string, string[][]> = {
  // Derecho (c-5)
  'c-5': [
    ['Historia Universal del Derecho', 'Expresión Oral y Escrita', 'Sociología Jurídica', 'Computación I', 'Inglés I', 'Taller: Responsabilidad y Éxito Académico'],
    ['Derecho Romano', 'Economía Política', 'Computación II', 'Inglés II', 'Introducción al Estudio del Derecho', 'Derecho de la Seguridad Social', 'Taller: Finanzas Personales'],
    ['Deontología Jurídica', 'Derecho Económico', 'Derecho Penal I', 'Derecho Mercantil I', 'Derecho Civil I', 'Derecho Individual del Trabajo', 'Taller: Lectura y Redacción'],
    ['Filosofía del Derecho', 'Política y Estado', 'Derecho Penal II', 'Derecho Mercantil II', 'Derecho Civil II', 'Derecho Colectivo del Trabajo', 'Taller: Oratoria'],
    ['Ética', 'Derecho Constitucional', 'Derecho Procesal Penal I', 'Derecho Bancario', 'Derecho Civil III', 'Derecho Fiscal', 'Taller: Lengua de Señas'],
    ['Epistemología', 'Derechos Humanos I', 'Derecho Procesal Penal II', 'Derecho Notarial', 'Derecho Civil IV', 'Derecho Procesal Fiscal', 'Taller: Técnicas de Litigación Oral'],
    ['Metodología de la Investigación', 'Derechos Humanos II', 'Seminario de Derecho Penal', 'Sociedad Anónima', 'Derecho Procesal Civil I', 'Derecho Administrativo', 'Taller: Argumentación Jurídica y Redacción de Documentos Legales'],
    ['Diseño del Proyecto de Investigación', 'Derecho de Amparo', 'Delitos Especiales', 'Contratos Mercantiles', 'Derecho Procesal Civil II', 'Derecho Internacional Público', 'Taller: Mediación y Resolución de Conflictos'],
    ['Seminario de Tesis I', 'Amparo en Materia Civil', 'Criminología', 'Derecho Corporativo', 'Seminario de Derecho Civil', 'Derecho Internacional Privado', 'Agrarismo en México', 'Taller: Ética Profesional y Responsabilidad Legal'],
    ['Seminario de Tesis II', 'Amparo en Materia Penal', 'Medicina Legal', 'Derecho Ecológico', 'Derecho Aduanero', 'Derecho Agrario', 'Taller: Derecho Digital y Protección de Datos']
  ],
  // Administración de Empresas Turísticas (c-8)
  'c-8': [
    ['Fundamentos de Administración', 'Fundamentos de Contabilidad', 'Computación I', 'Matemáticas', 'Introducción al Turismo', 'Inglés I', 'Taller: Responsabilidad y Éxito Académico'],
    ['Proceso Administrativo', 'Contabilidad Administrativa', 'Computación II', 'Estadística', 'Servicio de Alimentos y Bebidas', 'Inglés II', 'Taller: Finanzas Personales'],
    ['Planeación Estratégica', 'Contabilidad de Costos', 'Computación y Negocios', 'Gastronomía', 'Desarrollo Organizacional', 'Inglés III', 'Taller: Lectura y Redacción'],
    ['Organización Inteligente', 'Administración Financiera I', 'Mercadotecnia', 'Métodos Cuantitativos en Administración', 'Derecho Laboral', 'Inglés IV', 'Taller: Oratoria'],
    ['Teorías Administrativas Contemporáneas', 'Administración Financiera II', 'Mercadotecnia de Productos Turísticos', 'Productos y Servicios Turísticos', 'Agencias de Viajes', 'Inglés V', 'Taller: Lengua de Señas'],
    ['Creatividad Gerencial', 'Auditoría Administrativa', 'Investigación de Mercados', 'Ecoturismo', 'Ética', 'Taller: Desarrollo de Habilidades Gerenciales'],
    ['Calidad del Servicio Turístico', 'Seguridad e Higiene', 'Organización y Operación de Eventos', 'Animación y Recreación', 'Turismo de Reuniones', 'Taller: Turismo Accesible/Estrategias para la Inclusión'],
    ['Administración de Recursos Humanos', 'Formulación y Evaluación de Proyectos', 'Servicio de Transporte', 'Planificación Turística', 'Comunicación Administrativa', 'Taller: IA Aplicada a la Administración Turística'],
    ['Administración de Sueldos y Salarios', 'Formación de Emprendedores', 'Turismo Social', 'Desarrollo Sustentable del Turismo', 'Taller: Turismo Sostenible y Responsabilidad Social'],
    ['Seminario de Hotelería', 'Geografía Turística', 'Relaciones Públicas', 'Seminario de Tesis', 'Taller: Marketing Digital y Estrategias Comerciales']
  ],
  // Contaduría y Finanzas (c-2)
  'c-2': [
    ['Fundamentos de Contabilidad', 'Computación I', 'Matemáticas', 'Fundamentos de Administración', 'Fundamentos de Derecho', 'Inglés I', 'Taller: Responsabilidad y Éxito Académico'],
    ['Contabilidad Administrativa', 'Computación II', 'Estadística I', 'Proceso Administrativo', 'Derecho Mercantil', 'Inglés II', 'Taller: Finanzas Personales'],
    ['Contabilidad de Costos I', 'Computación y Negocios', 'Estadística II', 'Planeación Estratégica', 'Derecho Fiscal', 'Inglés III', 'Taller: Lectura y Redacción'],
    ['Contabilidad de Costos II', 'Computación Aplicada a la Contaduría', 'Mercadotecnia', 'Organización Inteligente', 'Derecho Laboral', 'Inglés IV', 'Taller: Oratoria'],
    ['Impuestos', 'Auditoría Administrativa', 'Finanzas', 'Desarrollo de Habilidades Directivas', 'Seguridad Social', 'Inglés V', 'Taller: Herramientas Financieras con Excel'],
    ['Contabilidad de Sociedades', 'Auditoría de Estados Financieros', 'Finanzas Públicas', 'Comercio Internacional', 'Ética', 'Análisis del Desarrollo Nacional', 'Taller: Gestión del Patrimonio'],
    ['Contabilidad de Asociaciones y Sociedades Civiles', 'Auditoría Gubernamental', 'Finanzas Bursátiles', 'Procedimientos Fiscales', 'Metodología de la Investigación', 'Expresión Oral y Escrita', 'Taller: Planeación Financiera y Presupuestos'],
    ['Contabilidad por Área de Responsabilidad', 'Contraloría', 'Finanzas Corporativas', 'Administración de Sueldos y Salarios', 'Diseño de Proyectos de Investigación', 'Administración de Recursos Humanos', 'Taller: Evaluación de Proyectos de Inversión'],
    ['Contabilidad Bancaria', 'Portafolio de Inversiones', 'Finanzas Internacionales', 'Presupuestos y Control Presupuestal', 'Seminario de Tesis I', 'Taller: Aplicación de la IA en la Contabilidad'],
    ['Contabilidad Internacional', 'Tópicos y Perspectivas de la Contabilidad', 'Formulación y Evaluación de Proyectos', 'Desarrollo Organizacional', 'Seminario de Tesis II', 'Taller: Gestión de Riesgos Financieros']
  ],
  // Administración de Empresas (c-1)
  'c-1': [
    ['Fundamentos de Administración', 'Fundamentos de Contabilidad', 'Computación I', 'Matemáticas', 'Fundamentos de Derecho', 'Inglés I', 'Taller: Responsabilidad y Éxito Académico'],
    ['Proceso Administrativo', 'Contabilidad Administrativa', 'Computación II', 'Estadística I', 'Derecho Mercantil', 'Inglés II', 'Taller: Finanzas Personales'],
    ['Planeación Estratégica', 'Contabilidad de Costos', 'Computación y Negocios', 'Estadística II', 'Derecho Fiscal', 'Inglés III', 'Taller: Lectura y Redacción'],
    ['Organización Inteligente', 'Administración Financiera I', 'Mercadotecnia I', 'Métodos Cuantitativos en Administración', 'Derecho Laboral', 'Inglés IV', 'Taller: Oratoria'],
    ['Teorías Administrativas Contemporáneas', 'Administración Financiera II', 'Mercadotecnia II', 'Microeconomía', 'Seguridad Social', 'Inglés V', 'Taller: Lengua de Señas'],
    ['Creatividad Gerencial', 'Auditoría Administrativa', 'Investigación de Mercados', 'Macroeconomía', 'Análisis del Desarrollo Nacional', 'Taller: Desarrollo de Habilidades Gerenciales'],
    ['Administración de Calidad', 'Seminario de Finanzas', 'Promoción en la Mercadotecnia', 'Metodología de la Investigación', 'Ética', 'Taller: Aplicación de la IA en la Administración'],
    ['Administración de Recursos Humanos', 'Formulación y Evaluación de Proyectos', 'Mercadotecnia Internacional', 'Diseño del Proyecto de Investigación', 'Expresión Oral y Escrita', 'Taller: Innovación y Emprendimiento Empresarial'],
    ['Administración de Sueldos y Salarios', 'Formación de Emprendedores', 'Comercio Internacional', 'Seminario de Tesis I', 'Comunicación Administrativa', 'Taller: Negociación y Resolución de Conflictos'],
    ['Administración Pública', 'Desarrollo Organizacional', 'Relaciones Públicas', 'Seminario de Tesis II', 'Taller: Marketing Digital y Estrategias Comerciales']
  ],
  // Ingeniería en Sistemas Computacionales (c-9)
  'c-9': [
    ['Cálculo Diferencial', 'Fundamentos de Programación', 'Matemáticas Discretas', 'Introducción a la Ingeniería en Sistemas Computacionales', 'Fundamentos de Investigación', 'Inglés I', 'Taller: Computación'],
    ['Cálculo Integral', 'Programación Orientada a Objetos', 'Contabilidad Financiera', 'Álgebra Lineal', 'Cultura Empresarial', 'Inglés II', 'Taller: Responsabilidad y Éxito Académico'],
    ['Cálculo Vectorial', 'Probabilidad y Estadística', 'Química', 'Investigación de Operaciones', 'Estructura de Datos', 'Inglés III', 'Taller: Lectura y Redacción'],
    ['Ecuaciones Diferenciales', 'Tópicos Avanzados de Programación', 'Física General', 'Sistemas Operativos', 'Fundamentos de Bases de Datos', 'Inglés IV', 'Taller: Finanzas Personales'],
    ['Métodos Numéricos', 'Simulación', 'Fundamentos de Ingeniería del Software', 'Taller de Sistemas Operativos', 'Taller de Base de Datos', 'Principios Eléctricos y Aplicaciones Digitales', 'Taller: Programación Orientada a Objetos'],
    ['Fundamentos de Telecomunicaciones', 'Lenguajes y Autómatas I', 'Ingeniería del Software', 'Redes de Computadoras', 'Administración de Base de Datos', 'Arquitectura de Computadoras', 'Taller: Desarrollo de Software Seguro'],
    ['Lenguaje de Interfaz', 'Lenguajes y Autómatas II', 'Gestión de Proyectos de Software', 'Conmutación y Enrutamiento de Redes de Datos', 'Sistemas Programables', 'Graficación', 'Taller: Desarrollo de Apps'],
    ['Programación y Lógica Funcional', 'Programación Web', 'Administración de Redes', 'Patrones de Análisis y Diseño', 'Desarrollo Sustentable', 'Entorno de Desarrollo de Software', 'Taller: Sensores y Actuadores'],
    ['Inteligencia Artificial', 'Reingeniería del Software', 'Desarrollo de Software Ágil', 'Sistemas Distribuidos', 'Auditoría de Sistemas Informáticos', 'Seminario de Tesis I', 'Taller: Respuesta Ante Incidentes de Seguridad'],
    ['Programación Avanzada', 'Pruebas y Mantenimiento de Software', 'Seminario de Tesis II', 'Seguridad en Desarrollo de Software', 'Producción Multimedia Digital', 'Métricas y Estimación de Software', 'Taller: Innovación y Emprendimiento']
  ],
  // Ingeniería Industrial (c-6)
  'c-6': [
    ['Introducción a la Ingeniería Industrial', 'Álgebra', 'Computación Básica', 'Fundamentos de Administración', 'Fundamentos de Contabilidad', 'Inglés I', 'Taller: Responsabilidad y Éxito Académico'],
    ['Química Básica', 'Cálculo Diferencial', 'Diseño Asistido por Computadora', 'Organización Inteligente', 'Contabilidad de Costos', 'Inglés II', 'Taller: Finanzas Personales'],
    ['Termodinámica General', 'Cálculo Integral', 'Física General', 'Geometría Analítica', 'Administración de Recursos Humanos', 'Inglés III', 'Taller: Lectura y Redacción'],
    ['Estructura y Propiedades de los Materiales', 'Ecuaciones Diferenciales', 'Investigación de Operaciones I', 'Probabilidad y Estadística', 'Mercadotecnia', 'Derecho Laboral', 'Taller: Oratoria'],
    ['Mecánica', 'Métodos Numéricos', 'Investigación de Operaciones II', 'Estadística Aplicada', 'Economía', 'Seminario de Ética', 'Taller: Lengua de Señas'],
    ['Medición en Ingeniería', 'Ingeniería Eléctrica', 'Análisis de Decisiones', 'Diseño y Desarrollo de Sistemas', 'Planeación Estratégica', 'Expresión Oral y Escrita', 'Taller: Diseño de Layouts Industriales'],
    ['Higiene y Seguridad Industrial', 'Introducción a los Sistemas Electromecánicos', 'Ingeniería de Métodos y Tiempo', 'Sistemas de Producción', 'Instalaciones Industriales', 'Metodología de la Investigación', 'Taller: Simulación de Procesos Industriales'],
    ['Procesos de Manufactura', 'Gestión de Mtto. de Equipos e Instalaciones', 'Logística Industrial y Comercial', 'Organización Industrial', 'Planeación y Control de la Producción', 'Diseño del Proyecto de Investigación', 'Taller: Ingeniería de Métodos y Estudio de Tiempos'],
    ['Control de Calidad', 'Ergonomía', 'Comercialización', 'Gerencia de Cadena de Suministros', 'Psicología Organizacional', 'Seminario de Tesis I', 'Taller: Gestión de Proyectos con Metodología Ágil'],
    ['Gestión de Calidad', 'Sistemas Integrados de Manufactura', 'Diseño de Plantas', 'Comercio Internacional', 'Formación Empresarial', 'Seminario de Tesis II', 'Taller: Uso de la IA en la Ingeniería Industrial']
  ]
};

export const GENERATED_SUBJECTS: MockSubject[] = [];

Object.entries(RAW_CAREER_SUBJECTS).forEach(([careerId, cuatrimestres]) => {
  cuatrimestres.forEach((subjectsList, index) => {
    const cuatrimestreNum = index + 1;
    subjectsList.forEach((subjectName, subIdx) => {
      GENERATED_SUBJECTS.push({
        id: `mock-s-${careerId}-${cuatrimestreNum}-${subIdx}`,
        name: subjectName,
        // Limpiar un poco el código, quitar tildes
        code: `C${cuatrimestreNum}-${subjectName.substring(0, 3).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${subIdx}`,
        credits: 4,
        careerId: careerId,
        cuatrimestre: cuatrimestreNum,
      });
    });
  });
});
