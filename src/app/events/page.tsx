'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useEventsStore } from '@/store/events-store';
import { Calendar, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function EventsPage() {
  const { events, setEvents } = useEventsStore();
  const { user } = useAuthStore();
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
        <p className="text-muted-foreground">Navegue e aposte nos eventos disponíveis</p>
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
          {events.map((event) => (
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
                  <p className="text-sm font-medium text-muted-foreground">Opções:</p>
                  <div className="grid gap-2">
                    {event.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <span className="text-sm">{option.name}</span>
                        <Badge variant="secondary" className="font-mono">
                          {option.currentOdd.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                {!isAdmin && (
                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full">Apostar</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
