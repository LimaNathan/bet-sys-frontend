'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { betsApi } from '@/lib/api';
import { Clock, Loader2, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Bet {
  id: string;
  eventId: string;
  eventTitle: string;
  chosenOptionId: string;
  chosenOptionName: string;
  lockedOdd: number;
  amount: number;
  potentialPayout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  createdAt: string;
}

const statusTranslations: Record<string, string> = {
  'PENDING': 'Pendente',
  'WON': 'Ganhou',
  'LOST': 'Perdeu',
};

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await betsApi.getMyBets();
        setBets(response.data);
      } catch (error) {
        console.error('Failed to fetch bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: Bet['status']) => {
    switch (status) {
      case 'WON': return <TrendingUp className="h-4 w-4" />;
      case 'LOST': return <TrendingDown className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Bet['status']) => {
    switch (status) {
      case 'WON': return 'bg-green-500/10 text-green-500';
      case 'LOST': return 'bg-red-500/10 text-red-500';
      default: return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingBets = bets.filter((b) => b.status === 'PENDING');
  const settledBets = bets.filter((b) => b.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Apostas</h1>
        <p className="text-muted-foreground">Acompanhe seu histórico de apostas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bets.length}</div>
            <p className="text-xs text-muted-foreground">Total de Apostas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{pendingBets.length}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {bets.filter((b) => b.status === 'WON').length}
            </div>
            <p className="text-xs text-muted-foreground">Ganhas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {bets.filter((b) => b.status === 'LOST').length}
            </div>
            <p className="text-xs text-muted-foreground">Perdidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Bets List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Apostas</CardTitle>
          <CardDescription>Seu histórico completo de apostas</CardDescription>
        </CardHeader>
        <CardContent>
          {bets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma aposta ainda</p>
              <p className="text-muted-foreground">Faça sua primeira aposta para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bets.map((bet) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${getStatusColor(bet.status)}`}>
                      {getStatusIcon(bet.status)}
                    </div>
                    <div>
                      <p className="font-medium">{bet.eventTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Escolha: {bet.chosenOptionName} @ {bet.lockedOdd.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(bet.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      bet.status === 'WON' ? 'default' :
                      bet.status === 'LOST' ? 'destructive' : 'secondary'
                    }>
                      {statusTranslations[bet.status]}
                    </Badge>
                    <p className="mt-1 text-sm">
                      Valor: <span className="font-medium">R$ {bet.amount.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bet.status === 'WON' ? 'Ganhou' : 'Potencial'}: R$ {bet.potentialPayout.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
