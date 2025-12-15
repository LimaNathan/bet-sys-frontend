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
import { MobileSidebar } from './sidebar';

export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

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
    <header className="fixed left-0 md:left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <MobileSidebar />

        <h1 className="text-base md:text-lg font-semibold truncate">
          {isAdmin ? 'Painel Admin' : 'Bem-vindo!'}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Balance Display - Only for users, hidden on very small screens */}
        {!isAdmin && (
          <Link href="/wallet" className="hidden sm:block">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 md:px-4 md:py-2 transition-all hover:bg-primary/20 hover:border-primary/40">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary text-sm md:text-base">{formattedBalance}</span>
            </div>
          </Link>
        )}

        {/* Role Badge - Hidden on mobile for admin */}
        {isAdmin && (
          <Badge variant="secondary" className="hidden sm:flex bg-primary/20 text-primary border-primary/30 text-xs">
            Admin
          </Badge>
        )}

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
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
            <Button variant="ghost" size="icon" className="relative rounded-lg h-9 w-9">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-destructive text-[10px] md:text-xs text-destructive-foreground font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80 backdrop-blur-xl bg-popover/95">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={markAllAsRead}
                >
                  Marcar lidas
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[250px] md:h-[300px]">
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
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm leading-snug line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
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
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 backdrop-blur-xl bg-popover/95" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{user?.name || user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </p>
                {/* Show balance in mobile dropdown for users */}
                {!isAdmin && (
                  <p className="text-xs font-medium text-primary sm:hidden pt-1">
                    Saldo: {formattedBalance}
                  </p>
                )}
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
