'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import { Check, Loader2, User, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MoneyRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountRequested: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function AdminMoneyRequestsPage() {
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await adminApi.getPendingMoneyRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Falha ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await adminApi.approveMoneyRequest(id);
      toast.success('Solicitação aprovada!');
      setRequests(requests.filter(r => r.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao aprovar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await adminApi.rejectMoneyRequest(id);
      toast.success('Solicitação rejeitada');
      setRequests(requests.filter(r => r.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao rejeitar');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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
        <h1 className="text-3xl font-bold">Solicitações de Dinheiro</h1>
        <p className="text-muted-foreground">Aprove ou rejeite solicitações de saldo</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma solicitação pendente</p>
            <p className="text-muted-foreground">Tudo em dia!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{request.userEmail}</CardTitle>
                    </div>
                    <CardDescription>{formatDate(request.createdAt)}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    R$ {request.amountRequested.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Motivo:</p>
                    <p className="font-medium">{request.reason || 'Nenhum motivo informado'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Rejeitar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Aprovar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
