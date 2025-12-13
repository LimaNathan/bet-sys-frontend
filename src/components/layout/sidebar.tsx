'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  BarChart3,
  History,
  Home,
  LogOut,
  Trophy,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const userNavItems = [
  { href: '/', icon: Home, label: 'Painel' },
  { href: '/events', icon: Trophy, label: 'Eventos' },
  { href: '/wallet', icon: Wallet, label: 'Carteira' },
  { href: '/bets', icon: History, label: 'Minhas Apostas' },
];

const adminNavItems = [
  { href: '/admin', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/events', icon: Trophy, label: 'Gerenciar Eventos' },
  { href: '/admin/requests', icon: Wallet, label: 'Solicitações' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAuthenticated) return null;

  // Admin only sees admin menu, users only see user menu
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const menuTitle = isAdmin ? 'Administração' : 'Menu';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-sidebar/80 backdrop-blur-xl">
      <div className="flex h-16 items-center border-b border-border/50 px-6">
        <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/20 p-1.5">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Cotic Bet
          </span>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-muted-foreground">
              {menuTitle}
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    pathname === item.href || (item.href !== '/' && item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-primary/20 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Separator className="mb-4 opacity-50" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
}
