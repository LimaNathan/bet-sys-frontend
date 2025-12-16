'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  BarChart3,
  History,
  Home,
  LogOut,
  Menu,
  Trophy,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const userNavItems = [
  { href: '/', icon: Home, label: 'Painel' },
  { href: '/events', icon: Trophy, label: 'Eventos' },
  { href: '/rankings', icon: BarChart3, label: 'Rankings' },
  { href: '/achievements', icon: Trophy, label: 'Conquistas' },
  { href: '/wallet', icon: Wallet, label: 'Carteira' },
  { href: '/bets', icon: History, label: 'Minhas Apostas' },
];

const adminNavItems = [
  { href: '/admin', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/events', icon: Trophy, label: 'Gerenciar Eventos' },
  { href: '/admin/requests', icon: Wallet, label: 'Solicitações' },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const menuTitle = isAdmin ? 'Administração' : 'Menu';

  return (
    <>
      <ScrollArea className="flex-1">
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
                  onClick={onItemClick}
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
      </ScrollArea>

      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            logout();
            onItemClick?.();
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  );
}

// Mobile Sidebar (Sheet)
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAuthenticated) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 glass-strong">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="rounded-lg bg-primary/20 p-1.5">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Cotic Bet
            </span>
          </Link>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <SidebarContent onItemClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
export function Sidebar() {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAuthenticated) return null;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl">
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
      <SidebarContent />
    </aside>
  );
}
