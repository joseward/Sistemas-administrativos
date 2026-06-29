const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/asistencia/page.tsx');

let code = fs.readFileSync(file, 'utf8');

// 1. Imports
code = code.replace(
  /} from '@\/lib\/mockData';/,
  `  MOCK_BIMESTRES,\n} from '@/lib/mockData';`
);

// 2. State changes
code = code.replace(
  /const \[selectedAssignmentId, setSelectedAssignmentId\] = useState<string>\(''\);/,
  `const [selectedModulo, setSelectedModulo] = useState<string>('');`
);

// 3. teacherAssignments filtering
code = code.replace(
  /const teacherAssignments = useMemo\(\(\) => {\n    if \(\!selectedTeacherId\) return \[\];\n    return assignments\.filter\(a => a\.teacherId === selectedTeacherId\);\n  }, \[selectedTeacherId, assignments\]\);/g,
  `const teacherAssignments = useMemo(() => {
    if (!selectedTeacherId) return [];
    return assignments.filter(a => a.teacherId === selectedTeacherId && !a.isAvailable);
  }, [selectedTeacherId, assignments]);
  
  const filteredAssignments = useMemo(() => {
    if (!selectedModulo) return [];
    return teacherAssignments.filter(a => a.modulo === Number(selectedModulo));
  }, [teacherAssignments, selectedModulo]);`
);

// 4. useEffect selectedAssignmentId to selectedModulo
code = code.replace(
  /setSelectedAssignmentId\(''\);/,
  `setSelectedModulo('');`
);

// 5. Remove unused details
code = code.replace(
  /const selectedAssignment = teacherAssignments\.find\(a => a\.id === selectedAssignmentId\);\n  const selectedTeacher = teachers\.find\(t => t\.id === selectedTeacherId\);\n  \n  \/\/ Datos relacionados a la asignación\n  const subject = selectedAssignment \? getSubjectById\(selectedAssignment\.subjectId\) : null;\n  const group = selectedAssignment \? getGroupById\(selectedAssignment\.groupId\) : null;\n  const students = selectedAssignment \? getStudentsByGroup\(selectedAssignment\.groupId\) : \[\];\n  const cuatrimestreLabel = selectedAssignment \? CUATRIMESTRES\.find\(c => c\.value === selectedAssignment\.cuatrimestre\)\?\.label : '';/,
  `const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);`
);

// 6. UI Dropdown
const oldDropdown = `              {/* Selector de Asignación (Clase) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Seleccionar Clase</label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  disabled={!selectedTeacherId || teacherAssignments.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Elija una clase --</option>
                  {teacherAssignments.map((a) => {
                    const sub = getSubjectById(a.subjectId);
                    const grp = getGroupById(a.groupId);
                    return (
                      <option key={a.id} value={a.id}>
                        {sub?.name} - {grp?.name} ({DAYS_OF_WEEK[a.scheduleDay]} {a.startTime})
                      </option>
                    );
                  })}
                </select>
              </div>`;

const newDropdown = `              {/* Selector de Bimestre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Bimestre (Módulo)</label>
                <select
                  value={selectedModulo}
                  onChange={(e) => setSelectedModulo(e.target.value)}
                  disabled={!selectedTeacherId || teacherAssignments.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Elija un bimestre --</option>
                  {MOCK_BIMESTRES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>`;
code = code.replace(oldDropdown, newDropdown);

// 7. Imprimir btn state
code = code.replace(
  /disabled=\{\!selectedAssignmentId\}/g,
  `disabled={!selectedModulo || filteredAssignments.length === 0}`
);

// 8. Documento Imprimible
const oldPrintableStart = `{selectedAssignment && selectedTeacher && subject && group && (`
const oldPrintableEnd = `      {/* Mensaje cuando no hay nada seleccionado */}`

const printableRegex = /\{selectedAssignment && selectedTeacher && subject && group && \([\s\S]*?\{!selectedAssignment && \(/;

const newPrintable = `{selectedTeacher && selectedModulo && filteredAssignments.length > 0 && (
          <div className="print:block">
            {filteredAssignments.map((assignment, index) => {
              const subject = getSubjectById(assignment.subjectId);
              const group = getGroupById(assignment.groupId);
              const students = getStudentsByGroup(assignment.groupId);
              const cuatrimestreLabel = CUATRIMESTRES.find(c => c.value === group?.cuatrimestre)?.label || '';

              if (!subject || !group) return null;

              return (
                <div key={assignment.id} className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0 page-break-after-always mb-8">
                  
                  {/* Cabecera del documento */}
                  <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Instituto Tech</h2>
                      <h3 className="text-lg font-semibold text-gray-700 mt-1">Lista de Asistencia Oficial</h3>
                    </div>
                    <div className="text-right text-sm">
                      <p><span className="font-bold">Fecha de clase:</span> {new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><span className="font-bold">Ciclo Escolar:</span> {group.academicYear}</p>
                    </div>
                  </div>

                  {/* Información del Maestro y la Clase */}
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm border border-gray-300 rounded-lg p-4 bg-gray-50 print:bg-white print:border-gray-400">
                    <div className="space-y-2">
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Docente:</span> <span className="uppercase">{selectedTeacher.firstName} {selectedTeacher.lastName}</span></p>
                      <p><span className="font-bold text-gray-700 w-24 inline-block">E-mail:</span> {selectedTeacher.email}</p>
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Teléfono:</span> {selectedTeacher.phone || 'N/A'}</p>
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Especialidad:</span> {selectedTeacher.specialization || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Asignatura:</span> <span className="uppercase">{subject.name}</span></p>
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Programa:</span> {group.carrera} ({cuatrimestreLabel})</p>
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Grupo:</span> {group.name}</p>
                      <p><span className="font-bold text-gray-700 w-24 inline-block">Horario:</span> {DAYS_OF_WEEK[assignment.scheduleDay]} de {assignment.startTime} a {assignment.endTime} hrs.</p>
                    </div>
                  </div>

                  {/* Tabla de Alumnos */}
                  <div className="mb-12">
                    <table className="w-full text-sm border-collapse border border-gray-400">
                      <thead>
                        <tr className="bg-gray-100 print:bg-gray-100">
                          <th className="border border-gray-400 px-3 py-2 w-12 text-center">No.</th>
                          <th className="border border-gray-400 px-3 py-2 w-32 text-center">Matrícula</th>
                          <th className="border border-gray-400 px-3 py-2 text-left">Nombre del Alumno</th>
                          <th className="border border-gray-400 px-3 py-2 w-24 text-center">Asistencia</th>
                          <th className="border border-gray-400 px-3 py-2 w-48 text-center">Firma del Alumno</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="border border-gray-400 px-3 py-6 text-center text-gray-500">
                              No hay alumnos registrados en este grupo.
                            </td>
                          </tr>
                        ) : (
                          students.sort((a, b) => a.lastName.localeCompare(b.lastName)).map((student, idx) => (
                            <tr key={student.id} className="print:break-inside-avoid">
                              <td className="border border-gray-400 px-3 py-3 text-center">{idx + 1}</td>
                              <td className="border border-gray-400 px-3 py-3 text-center font-mono text-xs">{student.registrationNumber}</td>
                              <td className="border border-gray-400 px-3 py-3 uppercase">
                                {student.lastName}, {student.firstName}
                              </td>
                              <td className="border border-gray-400 px-3 py-3 text-center">
                                 <div className="w-5 h-5 border border-gray-500 mx-auto rounded-sm print:border-black"></div>
                              </td>
                              <td className="border border-gray-400 px-3 py-3"></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Sección de Firma del Maestro */}
                  <div className="mt-16 flex justify-center print:break-inside-avoid">
                    <div className="text-center w-80">
                      <div className="border-t border-black mb-2"></div>
                      <p className="font-bold text-sm uppercase">{selectedTeacher.firstName} {selectedTeacher.lastName}</p>
                      <p className="text-xs text-gray-600">Firma del Docente</p>
                    </div>
                  </div>

                  <div className="print:hidden my-8 border-b-4 border-dashed border-gray-200"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mensaje cuando no hay nada seleccionado */}
        {!selectedModulo && (`

code = code.replace(printableRegex, newPrintable);

fs.writeFileSync(file, code);
console.log('Done refactoring!');
