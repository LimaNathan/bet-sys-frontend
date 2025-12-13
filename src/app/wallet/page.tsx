'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { moneyRequestsApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Gift, Loader2, Send, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  origin: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

const originTranslations: Record<string, string> = {
  'DAILY_BONUS': 'Bônus Diário',
  'BET_ENTRY': 'Aposta Realizada',
  'BET_WIN': 'Aposta Ganha',
  'ADMIN_GIFT': 'Presente do Admin',
  'MANUAL_ADJUSTMENT': 'Ajuste Manual',
};

export default function WalletPage() {
  const { user, updateBalance } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, transactionsRes] = await Promise.all([
          walletApi.getBalance(),
          walletApi.getTransactions(),
        ]);
        updateBalance(walletRes.data.balance);
        setTransactions(transactionsRes.data.content || []);
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [updateBalance]);

  const handleClaimBonus = async () => {
    setClaimingBonus(true);
    try {
      const response = await walletApi.claimDailyBonus();
      updateBalance(response.data.balance);
      toast.success('Bônus diário resgatado!');

      // Refresh transactions
      const transactionsRes = await walletApi.getTransactions();
      setTransactions(transactionsRes.data.content || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao resgatar bônus');
    } finally {
      setClaimingBonus(false);
    }
  };

  const handleRequestMoney = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      toast.error('Insira um valor válido');
      return;
    }

    setSubmitting(true);
    try {
      await moneyRequestsApi.createRequest(parseFloat(requestAmount), requestReason);
      toast.success('Solicitação enviada! Um admin irá analisar em breve.');
      setRequestOpen(false);
      setRequestAmount('');
      setRequestReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao enviar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(user?.walletBalance || 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Carteira</h1>
        <p className="text-muted-foreground">Gerencie seu saldo e transações</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Saldo Atual</CardTitle>
              <CardDescription>Disponível para apostas</CardDescription>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{formattedBalance}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bônus Diário</CardTitle>
              <CardDescription>Resgate uma vez por dia</CardDescription>
            </div>
            <Gift className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-bold">R$ 100</p>
            <Button
              className="w-full"
              onClick={handleClaimBonus}
              disabled={claimingBonus}
            >
              {claimingBonus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resgatando...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Resgatar Bônus
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Request Money */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Precisa de mais saldo?</CardTitle>
            <CardDescription>Solicite dinheiro a um administrador</CardDescription>
          </div>
          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Solicitar Dinheiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Dinheiro</DialogTitle>
                <DialogDescription>
                  Envie uma solicitação para um administrador.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="request-amount">Valor (R$)</Label>
                  <Input
                    id="request-amount"
                    type="number"
                    placeholder="500"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-reason">Motivo</Label>
                  <Input
                    id="request-reason"
                    placeholder="Perdi tudo apostando..."
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleRequestMoney} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitação'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Suas movimentações recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma transação ainda
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {originTranslations[tx.origin] || tx.origin.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        tx.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Saldo: R$ {tx.balanceAfter.toFixed(2)}
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
