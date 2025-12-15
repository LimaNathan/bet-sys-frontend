'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { betsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import html2canvas from 'html2canvas';
import { Check, ChevronDown, Clock, Copy, Download, Layers, Loader2, Share2, TrendingDown, TrendingUp, Trophy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface BetLeg {
  eventId: string;
  eventTitle: string;
  chosenOptionId: string;
  chosenOptionName: string;
  lockedOdd: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID';
}

interface Bet {
  id: string;
  type: 'SINGLE' | 'MULTIPLE';
  totalOdd: number;
  amount: number;
  potentialPayout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  createdAt: string;
  legs: BetLeg[];
  // Legacy fields for backward compatibility
  eventId?: string;
  eventTitle?: string;
  chosenOptionId?: string;
  chosenOptionName?: string;
  lockedOdd?: number;
}

const statusTranslations: Record<string, string> = {
  'PENDING': 'Pendente',
  'WON': 'Ganhou',
  'LOST': 'Perdeu',
  'VOID': 'Cancelado',
};

const legStatusTranslations: Record<string, string> = {
  'PENDING': 'Aguardando',
  'WON': 'Acertou',
  'LOST': 'Errou',
  'VOID': 'Cancelado',
};

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WON': return <TrendingUp className="h-4 w-4" />;
      case 'LOST': return <TrendingDown className="h-4 w-4" />;
      case 'VOID': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'bg-green-500/10 text-green-500';
      case 'LOST': return 'bg-red-500/10 text-red-500';
      case 'VOID': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  const getLegStatusBadge = (status: string) => {
    switch (status) {
      case 'WON': return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><Check className="h-3 w-3 mr-1" />{legStatusTranslations[status]}</Badge>;
      case 'LOST': return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><X className="h-3 w-3 mr-1" />{legStatusTranslations[status]}</Badge>;
      case 'VOID': return <Badge variant="outline">{legStatusTranslations[status]}</Badge>;
      default: return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{legStatusTranslations[status]}</Badge>;
    }
  };

  const toggleExpanded = (betId: string) => {
    setExpandedBets((prev) => {
      const next = new Set(prev);
      if (next.has(betId)) {
        next.delete(betId);
      } else {
        next.add(betId);
      }
      return next;
    });
  };

  const handleShare = (bet: Bet) => {
    setSelectedBet(bet);
    setShareModalOpen(true);
    setCopied(false);
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;

    setCopying(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopied(true);
            toast.success('Imagem copiada para a área de transferência!');
          } catch {
            handleDownload();
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast.error('Erro ao copiar imagem');
    } finally {
      setCopying(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setCopying(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `bet-${selectedBet?.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Imagem baixada!');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Erro ao baixar imagem');
    } finally {
      setCopying(false);
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
  const multipleBets = bets.filter((b) => b.type === 'MULTIPLE' || (b.legs && b.legs.length > 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Apostas</h1>
        <p className="text-muted-foreground">Acompanhe seu histórico de apostas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bets.length}</div>
            <p className="text-xs text-muted-foreground">Total de Apostas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-500">{multipleBets.length}</div>
            <p className="text-xs text-muted-foreground">Apostas Múltiplas</p>
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
              {bets.map((bet) => {
                const isMultiple = bet.type === 'MULTIPLE' || (bet.legs && bet.legs.length > 1);
                const isExpanded = expandedBets.has(bet.id);
                const legs = bet.legs || [];

                return (
                  <div
                    key={bet.id}
                    className="rounded-lg border overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${getStatusColor(bet.status)}`}>
                          {getStatusIcon(bet.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {isMultiple ? (
                              <>
                                <Layers className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">Aposta Múltipla</span>
                                <Badge variant="outline" className="text-xs">
                                  {legs.length} eventos
                                </Badge>
                              </>
                            ) : (
                              <span className="font-medium">
                                {legs[0]?.eventTitle || bet.eventTitle}
                              </span>
                            )}
                          </div>
                          {!isMultiple && legs[0] && (
                            <p className="text-sm text-muted-foreground">
                              Escolha: {legs[0].chosenOptionName} @ {legs[0].lockedOdd.toFixed(2)}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(bet.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={
                            bet.status === 'WON' ? 'default' :
                              bet.status === 'LOST' ? 'destructive' : 'secondary'
                          }>
                            {statusTranslations[bet.status]}
                          </Badge>
                          <p className="text-lg font-bold mt-1">
                            R$ {bet.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Odd: {bet.totalOdd?.toFixed(2) || bet.lockedOdd?.toFixed(2)} →{' '}
                            <span className={bet.status === 'WON' ? 'text-green-500' : ''}>
                              R$ {bet.potentialPayout.toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare(bet)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          {isMultiple && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleExpanded(bet.id)}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded legs view for multiple bets */}
                    {isMultiple && isExpanded && (
                      <div className="border-t bg-muted/30 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Pernas da aposta:</p>
                        <div className="space-y-2">
                          {legs.map((leg, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-background border p-3">
                              <div>
                                <p className="text-sm font-medium">{leg.eventTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {leg.chosenOptionName} @ {leg.lockedOdd.toFixed(2)}
                                </p>
                              </div>
                              {getLegStatusBadge(leg.status)}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                          <span className="text-muted-foreground">Odd combinada:</span>
                          <span className="font-bold">{bet.totalOdd?.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Aposta</DialogTitle>
            <DialogDescription>
              Exiba sua aposta para seus amigos
            </DialogDescription>
          </DialogHeader>

          {selectedBet && (
            <div className="space-y-4">
              {/* Shareable card */}
              <div
                ref={cardRef}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Diagonal Stamp Overlay */}
                {selectedBet.status !== 'PENDING' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-25deg)',
                    width: '60%',
                    textAlign: 'center',
                    border: `4px solid ${selectedBet.status === 'WON' ? '#22c55e' : '#ef4444'}`,
                    borderRadius: '12px',
                    padding: '8px 32px',
                    color: selectedBet.status === 'WON' ? '#22c55e' : '#ef4444',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    opacity: 0.2,
                    textShadow: '0 0 10px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}>
                    {selectedBet.status === 'WON' ? '✓ GREEN' : '✗ RED'}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Trophy style={{ width: '24px', height: '24px', color: '#a855f7' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Cotic Bet</span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  {selectedBet.legs && selectedBet.legs.length > 1 ? (
                    <div>
                      <div style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '8px' }}>
                        APOSTA MÚLTIPLA ({selectedBet.legs.length} eventos)
                      </div>
                      {selectedBet.legs.map((leg, i) => (
                        <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: i < selectedBet.legs.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{leg.eventTitle}</div>
                          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                            {leg.chosenOptionName} @ {leg.lockedOdd.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {selectedBet.legs?.[0]?.eventTitle || selectedBet.eventTitle}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                        {selectedBet.legs?.[0]?.chosenOptionName || selectedBet.chosenOptionName} @{' '}
                        {(selectedBet.legs?.[0]?.lockedOdd || selectedBet.lockedOdd)?.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Valor</span>
                  <span style={{ fontWeight: 'bold' }}>R$ {selectedBet.amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Odd Total</span>
                  <span style={{ fontWeight: 'bold' }}>{(selectedBet.totalOdd || selectedBet.lockedOdd)?.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  paddingTop: '8px',
                  marginTop: '8px'
                }}>
                  <span style={{ fontWeight: 'bold' }}>Retorno Potencial</span>
                  <span style={{ fontWeight: 'bold', color: '#22c55e', fontSize: '18px' }}>
                    R$ {selectedBet.potentialPayout.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyImage}
                  disabled={copying}
                >
                  {copying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button className="flex-1" onClick={handleDownload} disabled={copying}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
