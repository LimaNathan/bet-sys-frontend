'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { leaderboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Crown, Loader2, Medal, TrendingDown, TrendingUp, Trophy, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  value: number;
  valueLabel: string;
}

export default function RankingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [wealthRanking, setWealthRanking] = useState<LeaderboardEntry[]>([]);
  const [profitRanking, setProfitRanking] = useState<LeaderboardEntry[]>([]);
  const [lossRanking, setLossRanking] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const [wealthRes, profitRes, lossRes] = await Promise.all([
          leaderboardApi.getWealth(),
          leaderboardApi.getProfit(),
          leaderboardApi.getLoss(),
        ]);
        setWealthRanking(wealthRes.data);
        setProfitRanking(profitRes.data);
        setLossRanking(lossRes.data);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-mono">{rank}</span>;
    }
  };

  const RankingTable = ({
    entries,
    valueColor = 'text-primary',
    emptyMessage = 'Sem dados disponíveis',
  }: {
    entries: LeaderboardEntry[];
    valueColor?: string;
    emptyMessage?: string;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Jogador</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          entries.map((entry) => (
            <TableRow
              key={entry.userId}
              className={entry.userId === user?.id ? 'bg-primary/10' : ''}
            >
              <TableCell className="font-medium">{getMedalIcon(entry.rank)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className={`h-8 w-8 ${entry.rank <= 3 ? 'ring-2 ring-yellow-500/50' : ''}`}>
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {getInitials(entry.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {entry.name}
                    {entry.userId === user?.id && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Você
                      </Badge>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className={`text-right font-bold ${valueColor}`}>
                {entry.valueLabel}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Rankings
        </h1>
        <p className="text-muted-foreground">Veja os melhores (e piores) apostadores</p>
      </div>

      <Tabs defaultValue="wealth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wealth" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Patrimônio</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Lucro Mensal</span>
          </TabsTrigger>
          <TabsTrigger value="loss" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Prejuízo Semanal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wealth">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                O Magnata
              </CardTitle>
              <CardDescription>
                Ranking por patrimônio total na carteira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingTable entries={wealthRanking} valueColor="text-primary" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                O Trader
              </CardTitle>
              <CardDescription>
                Maior lucro líquido no mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingTable
                entries={profitRanking}
                valueColor="text-green-500"
                emptyMessage="Nenhuma aposta encerrada este mês"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loss">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Mão de Alface
              </CardTitle>
              <CardDescription>
                Maior prejuízo na semana atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingTable
                entries={lossRanking}
                valueColor="text-red-500"
                emptyMessage="Nenhuma aposta encerrada esta semana"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
