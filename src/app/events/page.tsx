'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useBetSlipStore } from '@/store/bet-slip-store';
import { useEventsStore } from '@/store/events-store';
import { Calendar, Check, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EventsPage() {
  const { events, setEvents } = useEventsStore();
  const { user } = useAuthStore();
  const { addSelection, getSelectionForEvent, hasEventSelected } = useBetSlipStore();
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getOpenEvents();
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [setEvents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddToBetSlip = (event: any, option: any) => {
    addSelection({
      eventId: event.id,
      eventTitle: event.title,
      optionId: option.id,
      optionName: option.name,
      currentOdd: option.currentOdd,
    });
    toast.success(`${option.name} adicionado ao cupom`, { duration: 2000 });
  };

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
        <h1 className="text-3xl font-bold">Eventos</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Visualize os eventos disponíveis' : 'Clique nas odds para adicionar ao cupom'}
        </p>
      </div>

      {isAdmin && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-4">
            <p className="text-center text-yellow-600 dark:text-yellow-400">
              ⚠️ Administradores não podem fazer apostas. Acesse o{' '}
              <Link href="/admin" className="underline font-medium">
                Painel Admin
              </Link>{' '}
              para gerenciar eventos.
            </p>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum evento disponível</p>
            <p className="text-muted-foreground">Volte mais tarde para novos eventos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const selectedOption = getSelectionForEvent(event.id);

            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {event.category === 'SPORTS' ? 'Esportes' : 'Interno'}
                        </Badge>
                        <Badge
                          variant={event.pricingModel === 'DYNAMIC_PARIMUTUEL' ? 'default' : 'secondary'}
                        >
                          {event.pricingModel === 'DYNAMIC_PARIMUTUEL' ? 'Odds Dinâmicas' : 'Odds Fixas'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(event.commenceTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {isAdmin ? 'Opções:' : 'Clique para adicionar:'}
                    </p>
                    <div className="grid gap-2">
                      {event.options.map((option) => {
                        const isSelected = selectedOption?.optionId === option.id;

                        return (
                          <button
                            key={option.id}
                            disabled={isAdmin}
                            onClick={() => handleAddToBetSlip(event, option)}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${
                              isAdmin
                                ? 'cursor-default opacity-70'
                                : 'hover:border-primary hover:bg-primary/5 cursor-pointer'
                            } ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                : 'border-border'
                            }`}
                          >
                            <span className="text-sm flex items-center gap-2">
                              {isSelected && <Check className="h-3 w-3 text-primary" />}
                              {option.name}
                            </span>
                            <Badge
                              variant={isSelected ? 'default' : 'secondary'}
                              className="font-mono"
                            >
                              {option.currentOdd.toFixed(2)}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {!isAdmin && (
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
