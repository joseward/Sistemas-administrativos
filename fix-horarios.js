const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/horarios/page.tsx');

let code = fs.readFileSync(file, 'utf8');

// 1. Merge logic in useEffect
code = code.replace(
  /if \(availabilityRes\.success\) \{\s*\/\/ Disponibilidad mapeada para que la interfaz la pinte verde\s*const availAsAssigns = availabilityRes\.data\.map\(\(av: any\) => \(\{/g,
  `if (availabilityRes.success) {
        const realAssignments = assignmentsRes.success ? assignmentsRes.data : [];
        const availAsAssigns = availabilityRes.data
          .filter((av: any) => {
            return !realAssignments.some((ra: any) => 
              ra.teacherId === av.teacherId && 
              ra.scheduleDay === av.dayOfWeek && 
              ra.startTime === av.startTime
            );
          })
          .map((av: any) => ({`
);

// 2. Remove .filter(a => a.isAvailable) from the Table rendering (2 places: empty state and map)
code = code.replace(
  /\{filteredAssignments\.filter\(a => a\.isAvailable\)\.length === 0 \? \(/g,
  `{filteredAssignments.length === 0 ? (`
);

code = code.replace(
  /\[\.\.\.filteredAssignments\]\s*\.filter\(a => a\.isAvailable\)\s*\.sort/g,
  `[...filteredAssignments]
                        .sort`
);

// 3. Dropdown onChange Logic
const oldOnChange = `onChange={(e) => {
                                    const val = e.target.value;
                                    const newAsg = [...assignments];
                                    const index = newAsg.findIndex(asg => asg.id === a.id);
                                    if(index !== -1) {
                                      if (val === "") {
                                        // Desasignar
                                        newAsg[index].subjectId = '';
                                        newAsg[index].groupId = '';
                                        newAsg[index].classroom = '';
                                        newAsg[index].modulo = undefined;
                                        newAsg[index].isAvailable = true;
                                      } else {
                                        // Asignar de plantilla
                                        const [tplId, subjId] = val.split('_');
                                        const tpl = MOCK_GROUP_TEMPLATES.find(t => t.id === tplId);
                                        if (tpl) {
                                          newAsg[index].subjectId = subjId;
                                          newAsg[index].groupId = tpl.groupId;
                                          newAsg[index].classroom = tpl.classroom;
                                          newAsg[index].modulo = tpl.modulo;
                                          newAsg[index].isAvailable = false;
                                          if (!newAsg[index].id.startsWith('mock-a')) {
                                            newAsg[index].id = \`mock-a-\${Date.now()}-\${Math.random()}\`;
                                          }
                                        }
                                      }
                                      setAssignments(newAsg);
                                      
                                      // Guardar en la base de datos
                                      const tid = newAsg[index].teacherId;
                                      const teacherAssignments = newAsg.filter(asg => asg.teacherId === tid && !asg.isAvailable);
                                      fetch('/api/assignments', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ teacherId: tid, assignments: teacherAssignments })
                                      }).catch(console.error);
                                    }
                                  }}`;

const newOnChange = `onChange={(e) => {
                                    const val = e.target.value;
                                    const newAsg = [...assignments];
                                    const index = newAsg.findIndex(asg => asg.id === a.id);
                                    if(index !== -1) {
                                      if (val === "") {
                                        // Desasignar
                                        newAsg[index].subjectId = 'mock-s1';
                                        newAsg[index].groupId = 'mock-g1';
                                        newAsg[index].classroom = '';
                                        newAsg[index].modulo = undefined;
                                      } else {
                                        // Asignar de plantilla
                                        const [tplId, subjId] = val.split('_');
                                        const tpl = MOCK_GROUP_TEMPLATES.find(t => t.id === tplId);
                                        if (tpl) {
                                          newAsg[index].subjectId = subjId;
                                          newAsg[index].groupId = tpl.groupId;
                                          newAsg[index].classroom = tpl.classroom;
                                          newAsg[index].modulo = tpl.modulo;
                                          if (!newAsg[index].id.startsWith('mock-a') && !newAsg[index].id.startsWith('avail_')) {
                                            newAsg[index].id = \`mock-a-\${Date.now()}-\${Math.random()}\`;
                                          }
                                        }
                                      }
                                      setAssignments(newAsg);
                                      
                                      // Guardar en la base de datos solo las asignaciones reales
                                      const tid = newAsg[index].teacherId;
                                      const teacherAssignmentsToSave = newAsg.filter(asg => 
                                        asg.teacherId === tid && 
                                        asg.subjectId && 
                                        asg.subjectId !== 'mock-s1'
                                      );
                                      
                                      fetch('/api/assignments', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ teacherId: tid, assignments: teacherAssignmentsToSave })
                                      }).catch(console.error);
                                    }
                                  }}`;
code = code.replace(oldOnChange, newOnChange);

// 4. Update the green background for all blocks in "Vista Tabla"
// Actually, bg-[#5cdb5c]/20 is already applied to all rows in Vista Tabla!
// Let's make sure that isAssigned doesn't break. 
// isAssigned is defined as: const isAssigned = a.subjectId && a.subjectId !== 'mock-s1'; (line 673)
// This is perfectly correct.

fs.writeFileSync(file, code);
console.log('Fixed horarios inline assignments!');
