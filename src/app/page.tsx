'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { betsApi, eventsApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useEventsStore } from '@/store/events-store';
import { ArrowRight, Flame, Sparkles, Star, TrendingUp, Trophy, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BetStats {
  total: number;
  won: number;
  lost: number;
  pending: number;
}

export default function DashboardPage() {
  const { user, updateBalance } = useAuthStore();
  const { events, setEvents } = useEventsStore();
  const [loading, setLoading] = useState(true);
  const [betStats, setBetStats] = useState<BetStats>({ total: 0, won: 0, lost: 0, pending: 0 });
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, walletRes, betsRes] = await Promise.all([
          eventsApi.getOpenEvents(),
          walletApi.getBalance(),
          betsApi.getMyBets(),
        ]);
        setEvents(eventsRes.data);
        updateBalance(walletRes.data.balance);

        // Calculate bet stats
        const bets = betsRes.data;
        setBetStats({
          total: bets.length,
          won: bets.filter((b: any) => b.status === 'WON').length,
          lost: bets.filter((b: any) => b.status === 'LOST').length,
          pending: bets.filter((b: any) => b.status === 'PENDING').length,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setEvents, updateBalance]);

  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(user?.walletBalance || 0);

  const openEvents = events.filter((e) => e.status === 'OPEN');
  const winRate = betStats.total > 0
    ? Math.round((betStats.won / (betStats.won + betStats.lost || 1)) * 100)
    : 0;

  // Redirect admin to admin dashboard
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground mb-6">Você está logado como administrador</p>
          <Link href="/admin">
            <Button size="lg">
              Ir para Dashboard Admin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-5 md:p-8 border border-border/50">
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-primary/10 rounded-full blur-3xl -translate-y-16 md:-translate-y-32 translate-x-16 md:translate-x-32" />
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-accent-foreground/10 rounded-full blur-3xl translate-y-12 md:translate-y-24 -translate-x-12 md:-translate-x-24" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground" />
            <span className="text-xs md:text-sm font-medium text-accent-foreground">Bem-vindo de volta!</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Pronto para apostar?
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mb-4 md:mb-6">
            Explore os eventos disponíveis e faça suas apostas. Boa sorte! 🍀
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/events">
              <Button size="lg" className="gap-2 glow-primary">
                <Flame className="h-5 w-5" />
                Ver Eventos
              </Button>
            </Link>
            <Link href="/wallet">
              <Button size="lg" variant="outline" className="gap-2">
                <Wallet className="h-5 w-5" />
                Resgatar Bônus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card */}
        <Card className="glass relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 border-primary/20 hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seu Saldo</CardTitle>
            <div className="rounded-lg bg-primary/10 dark:bg-primary/20 p-2 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-primary">{formattedBalance}</div>
            <Link href="/wallet">
              <p className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer mt-1">
                Gerenciar carteira →
              </p>
            </Link>
          </CardContent>
        </Card>

        {/* Win Rate Card */}
        <Card className="glass relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20 border-green-500/20 hover:border-green-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-green-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Vitória</CardTitle>
            <div className="rounded-lg bg-green-500/10 dark:bg-green-500/20 p-2 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-500">{winRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {betStats.won} vitórias de {betStats.won + betStats.lost} finalizadas
            </p>
          </CardContent>
        </Card>

        {/* Pending Bets Card */}
        <Card className="glass relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/20 border-yellow-500/20 hover:border-yellow-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Apostas Ativas</CardTitle>
            <div className="rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 p-2 group-hover:bg-yellow-500/20 dark:group-hover:bg-yellow-500/30 transition-colors">
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-yellow-500">{betStats.pending}</div>
            <Link href="/bets">
              <p className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors cursor-pointer mt-1">
                Ver minhas apostas →
              </p>
            </Link>
          </CardContent>
        </Card>

        {/* Events Card */}
        <Card className="glass relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 border-cyan-500/20 hover:border-cyan-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Abertos</CardTitle>
            <div className="rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 p-2 group-hover:bg-cyan-500/20 dark:group-hover:bg-cyan-500/30 transition-colors">
              <Trophy className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-cyan-500">{openEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponíveis para apostar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hot Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold">Eventos em Alta</h2>
          </div>
          <Link href="/events">
            <Button variant="ghost" size="sm">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-6" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-muted rounded flex-1" />
                    <div className="h-10 bg-muted rounded flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : openEvents.length === 0 ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum evento disponível</p>
              <p className="text-muted-foreground">Volte mais tarde para novos eventos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openEvents.slice(0, 6).map((event, index) => (
              <Card
                key={event.id}
                className="glass group hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                {index === 0 && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 gap-1">
                      <Flame className="h-3 w-3" />
                      Hot
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {event.category === 'SPORTS' ? '⚽ Esportes' : '🎯 Interno'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {event.pricingModel === 'DYNAMIC_PARIMUTUEL' ? '📈 Dinâmico' : '🔒 Fixo'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {event.options.slice(0, 2).map((option) => (
                      <div
                        key={option.id}
                        className="rounded-lg bg-muted/50 border border-border/50 p-3 text-center"
                      >
                        <p className="text-xs text-muted-foreground truncate mb-1">{option.name}</p>
                        <p className="text-lg font-bold text-primary">{option.currentOdd.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  {event.options.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      +{event.options.length - 2} opções disponíveis
                    </p>
                  )}
                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full group-hover:glow-primary transition-all">
                      <Star className="mr-2 h-4 w-4" />
                      Apostar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <CardTitle>Seu Resumo</CardTitle>
          </div>
          <CardDescription>Estatísticas da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-2xl font-bold">{betStats.total}</p>
              <p className="text-xs text-muted-foreground">Total de Apostas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-2xl font-bold text-green-500">{betStats.won}</p>
              <p className="text-xs text-muted-foreground">Vitórias</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-2xl font-bold text-red-500">{betStats.lost}</p>
              <p className="text-xs text-muted-foreground">Derrotas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-500">{betStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
