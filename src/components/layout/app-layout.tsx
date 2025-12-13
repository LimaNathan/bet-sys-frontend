'use client';

import { Toaster } from '@/components/ui/sonner';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

const publicPaths = ['/login', '/register'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { connect, disconnect } = useWebSocket();

  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
  }, [isAuthenticated, isPublicPath, router]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Public pages (login, register)
  if (isPublicPath) {
    return (
      <>
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-right" />
      </>
    );
  }

  // Protected pages with full layout
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-64 min-h-screen pt-16">
        <div className="p-6">{children}</div>
      </main>
      <Toaster position="top-right" />
    </>
  );
}
