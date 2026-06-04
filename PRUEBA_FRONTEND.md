# 🧪 GUÍA DE PRUEBA - FRONTEND MAESTROS

## ✅ Pre-requisitos

1. **Backend corriendo**: `npm run dev` en otra terminal
2. **Base de datos poblada**: `npm run db:seed` (ejecutado previamente)
3. **Node version**: v18+

---

## 🚀 Pasos para Probar

### 1. Verificar que el backend esté funcionando

```bash
# En una terminal:
npm run dev
```

Debe mostrar: `ready - started server on 0.0.0.0:3000`

### 2. Verificar que la BD esté poblada

```bash
# Obtener un schoolId válido:
npx prisma studio

# Navega a Teacher → Ver un teacher y copiar su schoolId
# Ej: "clu2oj0lp0000gxvs7f7f7f7f"
```

### 3. Actualizar schoolId en la página

Edita `src/app/dashboard/teachers/page.tsx`:

```typescript
const SCHOOL_ID = 'clu2oj0lp0000gxvs7f7f7f7f'; // Reemplazar con tu ID
```

### 4. Abrir la página en el navegador

```
http://localhost:3000/dashboard/teachers
```

---

## 🧪 Casos de Prueba

### Test 1: Cargar Lista de Maestros ✅

**Pasos:**
1. Ir a `/dashboard/teachers`
2. Esperar a que cargue la tabla

**Resultado esperado:**
- [ ] Tabla se carga con maestros existentes
- [ ] Se muestran 3 maestros de ejemplo (Juan, María, Carlos)
- [ ] Paginación funciona
- [ ] Estados mostrados en badges

---

### Test 2: Buscar Maestro ✅

**Pasos:**
1. En el input "Buscar por nombre..."
2. Escribir "Juan"

**Resultado esperado:**
- [ ] Solo Juan Pérez aparece
- [ ] Busca funciona en tiempo real
- [ ] Limpiar input muestra todos de nuevo

**Prueba adicional:**
- [ ] Buscar por email: "juan.perez@institutotech.edu"
- [ ] Buscar por especialidad: "Matemáticas"

---

### Test 3: Crear Nuevo Maestro ✅

**Pasos:**
1. Click en "+ Nuevo Maestro"
2. Llenar formulario:
   - Nombre: "Roberto"
   - Apellido: "López"
   - Email: "roberto.lopez@institutotech.edu"
   - Teléfono: "+506-8765-4321"
   - Especialidad: "Historia"
   - Estado: "Active"
3. Click "Crear Maestro"

**Resultado esperado:**
- [ ] Modal se cierra
- [ ] Nuevo maestro aparece en la tabla
- [ ] Recuento de maestros aumenta
- [ ] Email es único (no permite duplicados)

**Validación error:**
- [ ] Dejar email vacío → muestra error
- [ ] Email inválido (ej: "abc") → muestra error
- [ ] Nombre < 2 caracteres → muestra error

---

### Test 4: Editar Maestro ✅

**Pasos:**
1. Click en botón "Editar" de Juan Pérez
2. Cambiar teléfono a "+506-9999-8888"
3. Click "Actualizar Maestro"

**Resultado esperado:**
- [ ] Modal se abre con datos prerellenados
- [ ] Cambios se guardan
- [ ] Tabla se actualiza
- [ ] Modal se cierra

---

### Test 5: Gestionar Disponibilidad ✅

**Pasos:**
1. Seleccionar maestro (Juan Pérez) de la tabla
2. Ver grid de disponibilidad debajo
3. Para Lunes: Click "Editar" (o "Agregar disponibilidad")
4. Hora inicio: 08:00
5. Hora fin: 12:00
6. Click "Guardar"

**Resultado esperado:**
- [ ] Grid muestra disponibilidad para Lunes en verde
- [ ] Se muestra horario "08:00 - 12:00"
- [ ] Otros días sin disponibilidad

**Prueba adicional:**
- [ ] Agregar disponibilidad a Martes
- [ ] Editar disponibilidad (cambiar a 09:00-13:00)
- [ ] Eliminar disponibilidad

---

### Test 6: Eliminar Maestro ✅

**Pasos:**
1. Click en "Eliminar" para Roberto López (el que creamos)
2. Confirmar eliminación en el popup

**Resultado esperado:**
- [ ] Se muestra confirmación "¿Estás seguro...?"
- [ ] Si confirmas, maestro desaparece de la tabla
- [ ] Si cancelas, maestro sigue en la tabla
- [ ] Recuento disminuye

---

### Test 7: Paginación ✅

**Pasos:**
1. Si hay muchos maestros, ver botones "Anterior" y "Siguiente"
2. Click en página 2, 3, etc.

**Resultado esperado:**
- [ ] Los números de página funcionan
- [ ] Botones "Anterior"/"Siguiente" están disabled cuando corresponde
- [ ] Se muestran 10 maestros por página

---

### Test 8: Validaciones ✅

**Email duplicado:**
1. Intenta crear maestro con email de Juan: "juan.perez@institutotech.edu"
2. Verás error del backend

**Especialidad en búsqueda:**
1. Buscar "Matemáticas"
2. Solo Juan debe aparecer

---

## 🐛 Troubleshooting

### Error: "Cannot GET /dashboard/teachers"
- [ ] Verifica que la ruta sea correcta: `/dashboard/teachers`
- [ ] El servidor Next.js está corriendo?

### Error: "Error al cargar los maestros"
- [ ] ¿El backend está running?
- [ ] ¿El schoolId es válido?
- [ ] Revisa la consola del navegador (F12)

### Tabla vacía
- [ ] ¿Ejecutaste `npm run db:seed`?
- [ ] ¿El schoolId es el correcto?
- [ ] Revisa en `prisma studio` si hay maestros

### Formulario no se envía
- [ ] ¿Todos los campos requeridos están llenos?
- [ ] Revisa errores en la consola (F12)
- [ ]¿El email ya existe?

### Disponibilidad no se guarda
- [ ] ¿El maestro se cargó correctamente?
- [ ] ¿Las horas son válidas (inicio < fin)?
- [ ] Revisa errores en Network (F12 → Network tab)

---

## 📊 Datos de Prueba (Seed)

**Maestros creados por seed:**

| Nombre | Email | Especialidad | Disponibilidad |
|--------|-------|--------------|----------------|
| Juan Pérez | juan.perez@institutotech.edu | Matemáticas | Lun/Mié (08-12) |
| María López | maria.lopez@institutotech.edu | Lenguaje | Mar/Jue (08-12) |
| Carlos Rodríguez | carlos.rodriguez@institutotech.edu | Sociales | Lun/Mié/Vie (14-18) |

---

## 🎯 Casos Avanzados

### Test: Editar disponibilidad

**Pasos:**
1. Ir a disponibilidad de Juan
2. Click en "Editar" para Lunes
3. Cambiar a 09:00-13:00
4. Click "Guardar"

**Resultado:** Horario cambia de 08:00-12:00 a 09:00-13:00

---

### Test: Múltiples disponibilidades por día

**Nota:** La BD actual permite 1 disponibilidad por día
- Si intentas agregar otra para el mismo día, se actualiza

---

### Test: Estados del Contrato

**Pasos:**
1. Crear maestro con estado "Pending"
2. Ver badge en tabla (⊙ Pendiente)
3. Editar a "Active" (✓ Activo)
4. Ver cambio en badge

---

## 📱 Responsive Testing

1. Abre DevTools (F12)
2. Click en "Device Toggle" (Ctrl+Shift+M)
3. Prueba en:
   - [ ] iPhone 12
   - [ ] iPad
   - [ ] Desktop

**Debe:** Tabla tomar ancho completo, botones adaptar

---

## 🔍 Network Debugging

1. Abre DevTools (F12)
2. Ve a pestaña "Network"
3. Realiza una acción (crear, editar, eliminar)
4. Verás:
   - [ ] POST a `/api/teachers` (crear)
   - [ ] PUT a `/api/teachers/[id]` (editar)
   - [ ] DELETE a `/api/teachers/[id]` (eliminar)

**Headers esperados:**
```
Content-Type: application/json
```

**Response esperada:**
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

---

## ✅ Sign-off Checklist

Cuando termines todas las pruebas:

- [ ] CRUD de maestros funciona
- [ ] Búsqueda filtra correctamente
- [ ] Paginación funciona
- [ ] Disponibilidad se puede agregar/editar/eliminar
- [ ] Validaciones funcionan
- [ ] Errores se muestran
- [ ] Loading states funcionan
- [ ] Confirmaciones de eliminación funcionan
- [ ] Responsive en mobile
- [ ] No hay errores en console (F12)
- [ ] No hay errores en servidor (terminal)

---

## 📝 Notas

- Los time inputs (`<input type="time">`) funcionan mejor en Chrome
- En Firefox puede necesitar formato HH:mm
- Safari tiene comportamiento diferente con time inputs

---

## 🆘 Contacto

Si encuentras errores:
1. Revisa la consola del navegador (F12 → Console)
2. Revisa logs del servidor (terminal)
3. Revisa Network tab (F12 → Network)
4. Verifica que schoolId sea válido

**Debug rápido:**
```javascript
// En console del navegador (F12):
// Ver si se hacen llamadas al API
// Ver respuestas en Network tab
```

---

¡Listo para probar! 🚀
