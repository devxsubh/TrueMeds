'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const hideNavbar =
    pathname === '/login' || pathname === '/signup' || pathname === '/';

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'}>{children}</div>
    </AuthProvider>
  );
}
