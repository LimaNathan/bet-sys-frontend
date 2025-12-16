# Guia de Teste de Conectividade - CoticBet

## 📋 Situação Atual

### ✅ O que FUNCIONA:
- Ping para `172.25.10.34` - **OK**
- Frontend rodando localmente (`npm run dev`) - **ACESSÍVEL**
- Curl local para `http://172.25.10.34:3000` - **OK**

### ❌ O que NÃO funciona:
- Frontend rodando via Docker/Portainer - **NÃO ACESSÍVEL** de outras máquinas

## 🔍 Testes para Fazer COM SEU COLEGA

### Teste 1: Telnet (verificar se a porta está aberta)

Peça para seu colega executar no cmd/powershell dele:

```cmd
telnet 172.25.10.34 3000
```

**Resultados possíveis:**
- ✅ **Se conectar**: A porta está aberta, o problema é na aplicação
- ❌ **"Não foi possível abrir conexão"**: A porta está bloqueada (rede ou firewall)

> **Nota:** Se o Windows do colega não tiver telnet, ative em: Painel de Controle → Programas → Ativar ou desativar recursos do Windows → Telnet Client

### Teste 2: PowerShell (test de porta)

```powershell
Test-NetConnection -ComputerName 172.25.10.34 -Port 3000
```

Verifique o resultado de `TcpTestSucceeded`:
- `True` = Porta aberta ✅
- `False` = Porta bloqueada ❌

### Teste 3: Curl (se tiver instalado)

```cmd
curl -v http://172.25.10.34:3000
```

## 🔧 Possíveis Causas

### 1. Docker Desktop em modo NAT incorreto
O Docker Desktop no Windows pode ter problemas de binding em redes corporativas.

**Solução:** Garantir que o Docker está usando o adaptador de rede correto.

### 2. Bloqueio de Rede Corporativa
Algumas redes corporativas bloqueiam portas não-padrão entre hosts.

**Solução:** Conversar com TI para liberar a porta 3000, ou usar uma porta padrão (80, 443).

### 3. Múltiplos adaptadores de rede
Sua máquina tem múltiplas interfaces de rede (WSL, Hyper-V, Ethernet).

**Solução:** Forçar Docker a usar o IP específico `172.25.10.34`.

## 💡 Próximos Passos

1. Faça os testes acima com seu colega
2. Reporte os resultados:
   - Telnet conseguiu conectar? (Sim/Não)
   - Test-NetConnection mostrou TcpTestSucceeded = True? (Sim/Não)
   - Curl funcionou? (Sim/Não)

Com essas informações podemos identificar exatamente onde está o bloqueio!
