const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/horarios/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Modificar checkConflict
code = code.replace(
  /const checkConflict = \(newAssignment: Omit<MockScheduleAssignment, 'id'>\): string \| null => {/g,
  `const checkConflict = (newAssignment: Omit<MockScheduleAssignment, 'id'>, checkList = assignments): string | null => {`
);
code = code.replace(
  /for \(const existing of assignments\) {/g,
  `for (const existing of checkList) {`
);

// 2. Agregar handleAutoAssign
const autoAssignFunc = `
  const handleAutoAssign = () => {
    let currentList = [...assignments];
    let newAssignedCount = 0;
    
    // Obtener materias pendientes
    const pending = availableTemplateSlots.flatMap(opt => opt[1]);
    
    for (const slot of pending) {
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
      
      const affectedTeacherIds = [...new Set(currentList.filter(a => !a.isAvailable).map(a => a.teacherId))];
      Promise.all(
        affectedTeacherIds.map(tid => {
          const teacherAssignments = currentList.filter(a => a.teacherId === tid && !a.isAvailable);
          return fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: tid, assignments: teacherAssignments })
          });
        })
      ).then(() => {
        alert(\`✨ Magia completada: Se asignaron y GUARDARON \${newAssignedCount} materias a los horarios disponibles.\`);
      }).catch(err => {
        console.error(err);
        alert('Se asignaron localmente pero hubo un error al guardar en la base de datos.');
      });
    } else {
      alert('No se encontraron horarios compatibles para asignar automáticamente.');
    }
  };
`;

code = code.replace(
  /const handleSubmit = \(\) => {/,
  autoAssignFunc + '\n  const handleSubmit = () => {'
);

// 3. Modificar confirmAssignment
const oldConfirm = `  const confirmAssignment = () => {
    if (!assignPreview) return;
    setAssignments([...assignments, assignPreview as any]);
    setIsFormOpen(false);
    setAssignPreview(null);
    setFormData({
      teacherId: '',
      templateSlotId: '',
      scheduleDay: '',
      startTime: '',
      endTime: '',
    });
  };`;

const newConfirm = `  const confirmAssignment = () => {
    if (!assignPreview) return;
    const newList = [...assignments, assignPreview as any];
    setAssignments(newList);
    
    const tid = assignPreview.teacherId;
    const teacherAssignments = newList.filter(a => a.teacherId === tid && !a.isAvailable);
    
    fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: tid, assignments: teacherAssignments })
    }).catch(console.error);

    setIsFormOpen(false);
    setAssignPreview(null);
    setFormData({
      teacherId: '',
      templateSlotId: '',
      scheduleDay: '',
      startTime: '',
      endTime: '',
    });
  };`;

code = code.replace(oldConfirm, newConfirm);

// 4. Agregar botón mágico
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
console.log('Horarios page perfectly fixed and DB saving injected!');
