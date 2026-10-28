'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <AuthProvider>
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'}>{children}</div>
    </AuthProvider>
  );
}
