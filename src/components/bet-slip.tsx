'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { betsApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useBetSlipStore } from '@/store/bet-slip-store';
import { ChevronDown, ChevronUp, Loader2, ShoppingCart, Trash2, Trophy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function BetSlip() {
  const router = useRouter();
  const { user, updateBalance } = useAuthStore();
  const {
    selections,
    amount,
    setAmount,
    removeSelection,
    clearSlip,
    getTotalOdd,
    getPotentialPayout,
  } = useBetSlipStore();

  const [expanded, setExpanded] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const totalOdd = getTotalOdd();
  const potentialPayout = getPotentialPayout();

  const handlePlaceBet = async () => {
    if (selections.length === 0) {
      toast.error('Adicione pelo menos uma seleção');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Insira um valor válido');
      return;
    }

    setSubmitting(true);

    try {
      const selectionsPayload = selections.map((s) => ({
        eventId: s.eventId,
        optionId: s.optionId,
      }));

      await betsApi.placeBet(selectionsPayload, parsedAmount);

      // Refresh balance
      const walletRes = await walletApi.getBalance();
      updateBalance(walletRes.data.balance);

      clearSlip();
      toast.success(
        selections.length > 1
          ? 'Aposta múltipla realizada com sucesso!'
          : 'Aposta realizada com sucesso!'
      );
      router.push('/bets');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao realizar aposta');
    } finally {
      setSubmitting(false);
    }
  };

  // Don't show for admins or when empty on desktop
  if (isAdmin) return null;

  // Floating bet slip
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl">
        {/* Header - always visible */}
        <CardHeader
          className="py-3 px-4 cursor-pointer flex flex-row items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-1.5">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">
              Cupom de Aposta
              {selections.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selections.length}
                </Badge>
              )}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>

        {/* Collapsible content */}
        {expanded && (
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            {selections.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Clique em uma odd para adicionar</p>
              </div>
            ) : (
              <>
                {/* Selections list */}
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {selections.map((selection) => (
                      <div
                        key={selection.eventId}
                        className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 p-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {selection.eventTitle}
                          </p>
                          <p className="text-sm font-medium truncate">
                            {selection.optionName}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {selection.currentOdd.toFixed(2)}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSelection(selection.eventId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Bet type indicator */}
                {selections.length > 1 && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Trophy className="h-3 w-3" />
                    <span>Aposta Múltipla ({selections.length} eventos)</span>
                  </div>
                )}

                {/* Amount input */}
                <div className="space-y-1">
                  <Label htmlFor="bet-amount" className="text-xs">
                    Valor (R$)
                  </Label>
                  <Input
                    id="bet-amount"
                    type="number"
                    placeholder="50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="10"
                    className="h-9"
                  />
                </div>

                {/* Summary */}
                <div className="rounded-lg border p-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odd Total</span>
                    <span className="font-bold text-primary">
                      {totalOdd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Retorno</span>
                    <span className="font-bold text-green-500">
                      R$ {potentialPayout.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={clearSlip}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handlePlaceBet}
                    disabled={submitting || !amount}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Apostando...
                      </>
                    ) : (
                      'Apostar'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
