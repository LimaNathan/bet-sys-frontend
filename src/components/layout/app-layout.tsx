'use client';

import { BetSlip } from '@/components/bet-slip';
import { OnboardingModal } from '@/components/onboarding-modal';
import { Toaster } from '@/components/ui/sonner';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

const publicPaths = ['/login', '/register'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { connect, disconnect } = useWebSocket();
  const [hydrated, setHydrated] = useState(false);

  const isPublicPath = publicPaths.includes(pathname);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Only redirect after hydration is complete
    if (hydrated && !isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, isPublicPath, router]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Show loading while hydrating (prevents flash)
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
      <main className="md:ml-64 min-h-screen pt-16">
        <div className="p-4 md:p-6">{children}</div>
      </main>
      <BetSlip />
      <OnboardingModal />
      <Toaster position="top-right" />
    </>
  );
}

