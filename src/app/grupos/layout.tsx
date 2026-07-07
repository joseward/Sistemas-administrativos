import { CurriculumProvider } from '@/context/CurriculumContext';

export default function GruposLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurriculumProvider>
      {children}
    </CurriculumProvider>
  );
}
