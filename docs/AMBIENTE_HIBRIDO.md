# Ambiente Híbrido: Docker + Local

Este documento descreve como rodar o CoticBet em ambiente híbrido, com **Backend e MongoDB no Docker** e **Frontend rodando localmente**.

## 🎯 Por que Híbrido?

- **Problema:** Frontend no Docker não é acessível externamente devido a limitações de roteamento Docker/WSL2 em redes corporativas
- **Solução:** Rodar frontend localmente (já funciona para acesso externo) enquanto backend e banco de dados rodam no Docker

## 📋 Arquitetura

```
┌─────────────────────┐
│  MongoDB (Docker)   │ :27017
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Backend (Docker)   │ 172.25.10.34:8090
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Frontend (Local)   │ 172.25.10.34:3000
│    npm run dev      │
└─────────────────────┘
           │
      ┌────▼────┐
      │ Colegas │ (acessam via rede)
      └─────────┘
```

## 🚀 Como Iniciar

### 1. Subir Backend + MongoDB (Docker)

No diretório do backend:

```powershell
cd c:\Users\nathan.lima\Projetos\coticbet\bet-sys-backend
docker-compose up -d
```

**Verificar se está rodando:**
```powershell
docker ps --filter "name=coticbet"
```

Você deve ver:
- `coticbet-backend` - Status: Up
- `coticbet-mongodb` - Status: Up

**Testar o backend:**
```powershell
curl http://172.25.10.34:8090/api/auth/login
```
Deve retornar erro 500 (esperado para GET) - significa que está rodando!

### 2. Rodar Frontend (Local)

#### Opção A: Usando System Tray Launcher ⭐ **RECOMENDADO**

Na área de trabalho ou na pasta do projeto:

1. **Duplo clique** em `CoticBet Frontend.vbs` ou no atalho da área de trabalho
2. Ícone aparece na bandeja do sistema (canto direito da barra de tarefas)
3. Aguardar ícone ficar **verde** (rodando)
4. Pronto! Frontend está rodando em background

**Controles:**
- **Duplo clique no ícone:** Alternar iniciar/parar
- **Clique direito no ícone:**
  - ▶ Iniciar/⏹ Parar Frontend
  - 🌐 Abrir no Browser
  - ✕ Sair

#### Opção B: Linha de Comando (Tradicional)

No diretório do frontend:

```powershell
cd c:\Users\nathan.lima\Projetos\coticbet\bet-sys-frontend
npm run dev
```

**Observação:** Com esta opção, você precisa manter o terminal aberto.

## ⚙️ Configuração

### Backend (`docker-compose.yml`)

- **Porta:** 8090 (binding em `172.25.10.34:8090`)
- **MongoDB:** Porta 27017 (interno)
- **Rede:** `coticbet-network` (bridge)

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://172.25.10.34:8090/api
```

Este arquivo configura o frontend para se comunicar com o backend Docker.

## 🔍 Verificação

### Checklist de Funcionamento

- [ ] Containers rodando: `docker ps | findstr coticbet`
- [ ] Backend acessível: `curl http://172.25.10.34:8090/api/auth/login`
- [ ] Frontend iniciado: `npm run dev` sem erros
- [ ] Acesso local: `http://localhost:3000` carrega
- [ ] Acesso externo: Colega consegue acessar `http://172.25.10.34:3000`
- [ ] Login funciona (requisição vai para backend Docker)

### Troubleshooting

**Backend não inicia:**
```powershell
docker logs coticbet-backend
```

**Frontend não conecta ao backend:**
- Verificar se `.env.local` existe
- Reiniciar `npm run dev` após alterar variáveis de ambiente
- Verificar console do navegador (F12) para erros de CORS

**Colegas não conseguem acessar frontend:**
- Verificar firewall: porta 3000 deve estar aberta
- Executar `scripts\configure-firewall.ps1` (como Admin)

## 🛑 Parar os Serviços

### Parar Backend + MongoDB
```powershell
cd c:\Users\nathan.lima\Projetos\coticbet\bet-sys-backend
docker-compose down
```

### Parar Frontend
Pressione `Ctrl+C` no terminal onde está rodando `npm run dev`

## 📝 Notas Importantes

1. **Frontend DEVE rodar localmente** (não no Docker) para permitir acesso externo
2. **Sempre reiniciar `npm run dev`** após alterar `.env.local`
3. **Dados persistem** no volume Docker `mongodb_data`
4. **Porta 3000** precisa estar aberta no firewall para acesso de colegas

## 🔗 URLs Importantes

- **Frontend (Local):** http://localhost:3000 ou http://172.25.10.34:3000
- **Backend (Docker):** http://172.25.10.34:8090/api
- **MongoDB (Docker):** localhost:27017 (apenas para conexões locais)
