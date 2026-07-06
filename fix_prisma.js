const fs = require('fs');
const files = [
  'src/app/api/assignments/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/availability/route.ts',
  'src/app/api/teachers/[id]/route.ts',
  'src/app/api/teachers/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/users/[id]/unblock/route.ts',
  'src/app/api/users/change-password/route.ts',
  'src/app/api/users/route.ts',
  'src/app/portal-docente/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s+\{\s*PrismaClient\s*\}\s+from\s+['"]@prisma\/client['"];?/g, 'import prisma from \'@/lib/prisma\';');
    content = content.replace(/const\s+prisma\s*=\s*new\s*PrismaClient\(\);?/g, '');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } else {
    console.log('File not found:', file);
  }
}
