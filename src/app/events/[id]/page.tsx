'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useBetSlipStore } from '@/store/bet-slip-store';
import { Event } from '@/store/events-store';
import { ArrowLeft, Calendar, Check, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addSelection, getSelectionForEvent, selections } = useBetSlipStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddToBetSlip = (option: any) => {
    if (!event) return;

    addSelection({
      eventId: event.id,
      eventTitle: event.title,
      optionId: option.id,
      optionName: option.name,
      currentOdd: option.currentOdd,
    });
    toast.success(`${option.name} adicionado ao cupom`, { duration: 2000 });
  };

  const selectedOption = event ? getSelectionForEvent(event.id) : null;

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
                {isAdmin
                  ? 'Visualize as opções disponíveis'
                  : 'Clique em uma opção para adicionar ao cupom'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {event.options.map((option) => {
                const isSelected = selectedOption?.optionId === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => !isAdmin && handleAddToBetSlip(option)}
                    disabled={isAdmin}
                    className={`relative rounded-lg border-2 p-4 text-center transition-all ${
                      isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'
                    } ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
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
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Administradores não podem apostar</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      🎯 Clique em uma odd para adicionar ao cupom
                    </p>
                    <p className="text-sm text-muted-foreground">
                      🏆 Combine múltiplos eventos para apostas múltiplas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      💰 Confirme sua aposta no cupom flutuante
                    </p>
                  </div>

                  {selectedOption && (
                    <div className="rounded-lg border-2 border-primary bg-primary/5 p-3">
                      <p className="text-xs text-primary font-medium">Selecionado</p>
                      <p className="font-bold">{selectedOption.optionName}</p>
                      <Badge className="mt-1">@ {selectedOption.currentOdd.toFixed(2)}</Badge>
                    </div>
                  )}

                  {selections.length > 1 && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        🎉 Aposta Múltipla!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você tem {selections.length} eventos no cupom
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
