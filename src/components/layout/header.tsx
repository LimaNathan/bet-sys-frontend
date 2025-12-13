'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationsStore } from '@/store/notifications-store';
import { Bell, Gift, Lock, Monitor, Moon, Sun, Trophy, Wallet, XCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isAuthenticated) return null;

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(user?.walletBalance || 0);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BET_WON':
        return <Trophy className="h-4 w-4 text-green-500" />;
      case 'BET_LOST':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'MONEY_REQUEST_APPROVED':
        return <Gift className="h-4 w-4 text-green-500" />;
      case 'MONEY_REQUEST_REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'EVENT_LOCKED':
        return <Lock className="h-4 w-4 text-blue-500" />;
      case 'NEW_MONEY_REQUEST':
        return <Wallet className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const ThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />;
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    if (theme === 'light') return <Sun className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          {isAdmin ? 'Painel Administrativo' : 'Bem-vindo de volta!'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Balance Display - Only for users */}
        {!isAdmin && (
          <Link href="/wallet">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 transition-all hover:bg-primary/20 hover:border-primary/40">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">{formattedBalance}</span>
            </div>
          </Link>
        )}

        {/* Role Badge */}
        {isAdmin && (
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            Administrador
          </Badge>
        )}

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <ThemeIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Claro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Escuro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-lg">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 backdrop-blur-xl bg-popover/95">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 cursor-pointer ${
                      !notification.read ? 'bg-accent/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-snug">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 backdrop-blur-xl bg-popover/95" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
