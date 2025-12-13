'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { betsApi, eventsApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Event } from '@/store/events-store';
import { ArrowLeft, Calendar, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, updateBalance } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.getEvent(params.id as string);
        setEvent(response.data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
        toast.error('Evento não encontrado');
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, router]);

  const handlePlaceBet = async () => {
    if (!selectedOption || !betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Selecione uma opção e insira um valor válido');
      return;
    }

    setBetting(true);

    try {
      await betsApi.placeBet(event!.id, selectedOption, parseFloat(betAmount));

      // Refresh balance
      const walletRes = await walletApi.getBalance();
      updateBalance(walletRes.data.balance);

      toast.success('Aposta realizada com sucesso!');
      router.push('/bets');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao realizar aposta');
    } finally {
      setBetting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedOptionData = event?.options.find((o) => o.id === selectedOption);
  const potentialPayout = selectedOptionData && betAmount
    ? (parseFloat(betAmount) * selectedOptionData.currentOdd).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(event.commenceTime)}
          </div>
        </div>
      </div>

      {isAdmin && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-4">
            <p className="text-center text-yellow-600 dark:text-yellow-400">
              ⚠️ Administradores não podem fazer apostas.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Betting Options */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escolha sua opção</CardTitle>
              <CardDescription>
                Selecione uma opção para fazer sua aposta
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {event.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !isAdmin && setSelectedOption(option.id)}
                  disabled={isAdmin}
                  className={`relative rounded-lg border-2 p-4 text-center transition-all ${
                    isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                  } ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  <p className="font-medium">{option.name}</p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {option.currentOdd.toFixed(2)}
                  </p>
                  {event.pricingModel === 'DYNAMIC_PARIMUTUEL' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pool: R$ {option.totalStaked.toFixed(0)}
                    </p>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bet Slip */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Cupom de Aposta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Administradores não podem apostar</p>
                </div>
              ) : selectedOption ? (
                <>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">Sua escolha</p>
                    <p className="font-medium">{selectedOptionData?.name}</p>
                    <p className="text-lg font-bold text-primary">
                      @ {selectedOptionData?.currentOdd.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor da Aposta (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="1"
                      step="10"
                    />
                  </div>

                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor</span>
                      <span>R$ {betAmount || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Odd</span>
                      <span>{selectedOptionData?.currentOdd.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Retorno Potencial</span>
                      <span className="text-primary">R$ {potentialPayout}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceBet}
                    disabled={betting || !betAmount}
                  >
                    {betting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Apostando...
                      </>
                    ) : (
                      'Confirmar Aposta'
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Selecione uma opção para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
