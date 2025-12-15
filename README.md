# Cotic Bet - Frontend

Interface web moderna para sistema de apostas com suporte a apostas múltiplas.

## 🚀 Tecnologias

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Zustand** para gerenciamento de estado
- **WebSocket** para atualizações em tempo real

## 📦 Funcionalidades

### Apostas
- ✅ **Bet Slip** flutuante para apostas simples/múltiplas
- ✅ Clique nas odds para adicionar ao cupom
- ✅ Cálculo automático de odds combinadas
- ✅ Visualização de apostas múltiplas com expansão de legs
- ✅ Compartilhamento de apostas com carimbo de resultado

### Interface
- ✅ Dark mode nativo
- ✅ Design responsivo
- ✅ Toasts e notificações em tempo real
- ✅ Onboarding para novos usuários

### Gamificação
- ✅ Página de conquistas/badges
- ✅ Leaderboards em tempo real
- ✅ Bônus diário

## 🏃 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura

```
src/
├── app/                 # Páginas (App Router)
│   ├── events/          # Lista e detalhe de eventos
│   ├── bets/            # Histórico de apostas
│   ├── achievements/    # Badges e conquistas
│   ├── leaderboard/     # Rankings
│   └── admin/           # Painel administrativo
├── components/          # Componentes reutilizáveis
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, Sidebar
│   └── bet-slip.tsx     # Cupom de apostas flutuante
├── store/               # Zustand stores
│   ├── auth-store.ts    # Autenticação
│   ├── bet-slip-store.ts # Cupom de apostas
│   └── events-store.ts  # Eventos
├── hooks/               # Custom hooks
└── lib/                 # Utilitários e API
```

## 🎰 Fluxo de Aposta Múltipla

1. Navegue para `/events`
2. Clique nas odds desejadas (de eventos diferentes)
3. O cupom flutuante mostra suas seleções
4. Insira o valor e confirme
5. Visualize em `/bets` com expansão de cada leg

## ⚙️ Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📱 Screenshots

- **Eventos**: Lista com odds clicáveis
- **Bet Slip**: Cupom flutuante no canto inferior direito
- **Histórico**: Cards expansíveis para apostas múltiplas
- **Compartilhar**: Card com carimbo diagonal de resultado
