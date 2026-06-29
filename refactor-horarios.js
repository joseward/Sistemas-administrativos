const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/horarios/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Refactor checkConflict to accept a custom list
code = code.replace(
  /const checkConflict = \(newAssignment: Omit<MockScheduleAssignment, 'id'>\): string \| null => {/g,
  `const checkConflict = (newAssignment: Omit<MockScheduleAssignment, 'id'>, checkList = assignments): string | null => {`
);

code = code.replace(
  /for \(const existing of assignments\) {/g,
  `for (const existing of checkList) {`
);

// 2. Add handleAutoAssign function before handleSubmit
const autoAssignFunc = `
  const handleAutoAssign = () => {
    let currentList = [...assignments];
    let newAssignedCount = 0;
    
    // Obtener las materias pendientes
    const pending = availableTemplateSlots.flatMap(opt => opt[1]);
    
    for (const slot of pending) {
      // Buscar disponibilidades (nodos verdes)
      const availabilitiesOnly = currentList.filter(a => a.isAvailable === true);
      let assigned = false;
      
      for (const av of availabilitiesOnly) {
        const testA = {
          teacherId: av.teacherId,
          subjectId: slot.subjectId,
          groupId: slot.tpl.groupId,
          scheduleDay: av.scheduleDay,
          startTime: av.startTime,
          endTime: av.endTime,
          classroom: slot.tpl.classroom,
          modulo: slot.tpl.modulo
        };
        
        if (!checkConflict(testA, currentList)) {
          // Asignado!
          currentList.push({
            ...testA,
            id: \`mock-auto-\${Date.now()}-\${Math.random()}\`
          });
          newAssignedCount++;
          assigned = true;
          break;
        }
      }
    }
    
    if (newAssignedCount > 0) {
      setAssignments(currentList);
      alert(\`✨ Magia completada: Se asignaron \${newAssignedCount} materias a los horarios disponibles.\`);
    } else {
      alert('No se encontraron horarios compatibles para asignar automáticamente.');
    }
  };
`;

code = code.replace(
  /const handleSubmit = \(\) => {/,
  autoAssignFunc + '\n  const handleSubmit = () => {'
);

// 3. Add the Auto-Assign button next to Nueva Asignación
const newBtn = `
          <Button onClick={handleAutoAssign} variant="outline" className="flex items-center gap-2 border-purple-400 text-purple-700 hover:bg-purple-50">
            ✨ Auto-Asignación Mágica
          </Button>
          <Button id="btn-nueva-asignacion" onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
`;
code = code.replace(
  /<Button id="btn-nueva-asignacion" onClick={\(\) => setIsFormOpen\(true\)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">/g,
  newBtn
);

fs.writeFileSync(filePath, code);
console.log('Horarios page updated for auto-assign!');
