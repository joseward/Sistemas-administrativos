import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { HeaderUserMenu } from '@/components/layout/HeaderUserMenu';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aztlán Playa del Carmen - Sistema Administrativo',
  description: 'Plataforma para gestión administrativa de escuelas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Global Header Brand */}
        <header className="bg-[#061266] text-white border-b-4 border-[#fdb515] sticky top-0 z-[60] shadow-md print:hidden">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Aztlán Playa del Carmen Logo" 
                className="h-10 w-auto brightness-0 invert object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              <HeaderUserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
