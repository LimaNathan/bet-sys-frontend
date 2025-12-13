'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import { BarChart3, Loader2, TrendingDown, TrendingUp, Trophy, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HouseStatistics {
  totalBetsReceived: number;
  totalPayouts: number;
  houseProfit: number;
  totalInUserWallets: number;
  totalBetsCount: number;
  pendingBetsCount: number;
  totalUsers: number;
  totalEvents: number;
  openEvents: number;
  settledEvents: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<HouseStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getDashboardStatistics();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Falha ao carregar estatísticas</p>
      </div>
    );
  }

  const isProfitable = stats.houseProfit >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Visão geral financeira da casa</p>
      </div>

      {/* Main Financial Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Apostas Recebidas */}
        <Card className="glass border-green-500/30 overflow-hidden group hover:border-green-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Apostas Recebidas</CardTitle>
            <div className="rounded-lg bg-green-500/20 p-2">
              <Wallet className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(stats.totalBetsReceived)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De {stats.totalBetsCount} apostas
            </p>
          </CardContent>
        </Card>

        {/* Pagamentos */}
        <Card className="glass border-red-500/30 overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagamentos</CardTitle>
            <div className="rounded-lg bg-red-500/20 p-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {formatCurrency(stats.totalPayouts)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pago aos vencedores</p>
          </CardContent>
        </Card>

        {/* Lucro da Casa */}
        <Card className={`glass overflow-hidden group transition-all ${isProfitable ? 'border-green-500/30 hover:border-green-500/50' : 'border-red-500/30 hover:border-red-500/50'}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${isProfitable ? 'from-green-500/5' : 'from-red-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro da Casa</CardTitle>
            <div className={`rounded-lg p-2 ${isProfitable ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isProfitable ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(stats.houseProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isProfitable ? 'Lucro líquido' : 'Prejuízo'}
            </p>
          </CardContent>
        </Card>

        {/* Saldo dos Usuários */}
        <Card className="glass border-primary/30 overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo dos Usuários</CardTitle>
            <div className="rounded-lg bg-primary/20 p-2">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(stats.totalInUserWallets)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Em todas as carteiras</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Usuários */}
        <Card className="glass border-accent-foreground/30 overflow-hidden group hover:border-accent-foreground/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            <div className="rounded-lg bg-accent-foreground/20 p-2">
              <Users className="h-4 w-4 text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent-foreground">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Jogadores registrados</p>
          </CardContent>
        </Card>

        {/* Total de Eventos */}
        <Card className="glass border-primary/30 overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Eventos</CardTitle>
            <div className="rounded-lg bg-primary/20 p-2">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.openEvents} abertos, {stats.settledEvents} encerrados
            </p>
          </CardContent>
        </Card>

        {/* Apostas Pendentes */}
        <Card className="glass border-yellow-500/30 overflow-hidden group hover:border-yellow-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Apostas Pendentes</CardTitle>
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <Wallet className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingBetsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando resultado</p>
          </CardContent>
        </Card>

        {/* Eventos Abertos */}
        <Card className="glass border-green-500/30 overflow-hidden group hover:border-green-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Abertos</CardTitle>
            <div className="rounded-lg bg-green-500/20 p-2">
              <Trophy className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.openEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Recebendo apostas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie eventos e solicitações</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/admin/events">
            <Button className="glow-primary">
              <Trophy className="mr-2 h-4 w-4" />
              Gerenciar Eventos
            </Button>
          </Link>
          <Link href="/admin/requests">
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Solicitações de Dinheiro
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
