import { CurriculumProvider } from '@/context/CurriculumContext';

export default function FusionGruposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurriculumProvider>
      {children}
    </CurriculumProvider>
  );
}
