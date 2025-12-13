'use client';

import { Badge } from '@/components/ui/badge';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { Event } from '@/store/events-store';
import { Calendar, CheckCircle, Loader2, MoreVertical, Plus, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const statusTranslations: Record<string, string> = {
  'PENDING': 'Pendente',
  'OPEN': 'Aberto',
  'LOCKED': 'Travado',
  'SETTLED': 'Encerrado',
  'CANCELED': 'Cancelado',
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [creating, setCreating] = useState(false);

  // Form state for new event
  const [title, setTitle] = useState('');
  const [pricingModel, setPricingModel] = useState<'FIXED_ODDS' | 'DYNAMIC_PARIMUTUEL'>('DYNAMIC_PARIMUTUEL');
  const [commenceTime, setCommenceTime] = useState('');
  const [options, setOptions] = useState([
    { name: '', initialOdd: '2.00' },
    { name: '', initialOdd: '2.00' },
  ]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await adminApi.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Falha ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !commenceTime || options.some(o => !o.name)) {
      toast.error('Preencha todos os campos');
      return;
    }

    setCreating(true);
    try {
      await adminApi.createEvent({
        title,
        pricingModel,
        commenceTime: new Date(commenceTime).toISOString(),
        options: options.map(o => ({
          name: o.name,
          initialOdd: parseFloat(o.initialOdd),
        })),
      });
      toast.success('Evento criado!');
      setCreateOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao criar evento');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (eventId: string, status: string) => {
    try {
      await adminApi.updateEventStatus(eventId, status);
      toast.success(`Evento ${statusTranslations[status]?.toLowerCase() || status}`);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao atualizar status');
    }
  };

  const handleSettleEvent = async () => {
    if (!selectedEvent || !selectedWinner) {
      toast.error('Selecione um vencedor');
      return;
    }

    try {
      await adminApi.settleEvent(selectedEvent.id, selectedWinner);
      toast.success('Evento encerrado!');
      setSettleOpen(false);
      setSelectedEvent(null);
      setSelectedWinner('');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao encerrar evento');
    }
  };

  const resetForm = () => {
    setTitle('');
    setPricingModel('DYNAMIC_PARIMUTUEL');
    setCommenceTime('');
    setOptions([
      { name: '', initialOdd: '2.00' },
      { name: '', initialOdd: '2.00' },
    ]);
  };

  const addOption = () => {
    setOptions([...options, { name: '', initialOdd: '2.00' }]);
  };

  const updateOption = (index: number, field: 'name' | 'initialOdd', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'LOCKED': return 'bg-blue-500';
      case 'SETTLED': return 'bg-gray-500';
      case 'CANCELED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Eventos</h1>
          <p className="text-muted-foreground">Crie, edite e encerre eventos</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Crie um evento interno de apostas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Quem vai ganhar o jogo?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data/Hora de Início</Label>
                <Input
                  type="datetime-local"
                  value={commenceTime}
                  onChange={(e) => setCommenceTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo de Preço</Label>
                <select
                  className="w-full rounded-md border p-2 bg-background"
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as any)}
                >
                  <option value="DYNAMIC_PARIMUTUEL">Dinâmico (Parimutuel)</option>
                  <option value="FIXED_ODDS">Odds Fixas</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Opções</Label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder={`Nome da opção ${idx + 1}`}
                      value={opt.name}
                      onChange={(e) => updateOption(idx, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Odd"
                      className="w-24"
                      value={opt.initialOdd}
                      onChange={(e) => updateOption(idx, 'initialOdd', e.target.value)}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  + Adicionar Opção
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum evento ainda</p>
              <p className="text-muted-foreground">Crie seu primeiro evento para começar</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{event.title}</CardTitle>
                      <Badge className={getStatusColor(event.status)}>
                        {statusTranslations[event.status]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.commenceTime).toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {event.status === 'PENDING' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'OPEN')}>
                          Abrir para Apostas
                        </DropdownMenuItem>
                      )}
                      {event.status === 'OPEN' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'LOCKED')}>
                          Travar Apostas
                        </DropdownMenuItem>
                      )}
                      {event.status === 'LOCKED' && (
                        <DropdownMenuItem onClick={() => {
                          setSelectedEvent(event);
                          setSettleOpen(true);
                        }}>
                          Encerrar Evento
                        </DropdownMenuItem>
                      )}
                      {(event.status === 'PENDING' || event.status === 'OPEN') && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleUpdateStatus(event.id, 'CANCELED')}
                        >
                          Cancelar Evento
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-3">
                  {event.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        event.winnerOptionId === option.id ? 'border-green-500 bg-green-500/10' : ''
                      }`}
                    >
                      <div>
                        <span className="font-medium">{option.name}</span>
                        {event.winnerOptionId === option.id && (
                          <CheckCircle className="inline ml-2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{option.currentOdd.toFixed(2)}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pool: R$ {option.totalStaked.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Settle Dialog */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar Evento</DialogTitle>
            <DialogDescription>
              Selecione a opção vencedora para "{selectedEvent?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEvent?.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedWinner(option.id)}
                className={`w-full flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
                  selectedWinner === option.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-primary'
                }`}
              >
                <span className="font-medium">{option.name}</span>
                <span>Pool: R$ {option.totalStaked.toFixed(0)}</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSettleEvent} disabled={!selectedWinner}>
              Confirmar Encerramento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
