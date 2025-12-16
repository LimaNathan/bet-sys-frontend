# Scripts de Desenvolvimento - Frontend

Este diretório contém scripts auxiliares para desenvolvimento e build do frontend CoticBet.

## Scripts Disponíveis

### `CoticBet Frontend.vbs` ⭐ **RECOMENDADO**
Launcher principal - **apenas dê dois cliques!**

**O que faz:**
- Inicia o frontend (`npm run dev`) em background
- Cria ícone na bandeja do sistema (system tray)
- Ícone verde = rodando, vermelho = parado
- Menu de contexto com opções:
  - Iniciar/Parar Frontend
  - Abrir no Browser
  - Sair

**Como usar:**
1. Dois cliques no arquivo `CoticBet Frontend.vbs`
2. OU use o atalho na área de trabalho (criado automaticamente)
3. Ícone aparece na bandeja (canto direito da barra de tarefas)
4. Duplo clique no ícone alterna entre iniciar/parar

### `start-frontend-tray.ps1`
Script PowerShell usado pelo launcher (não execute diretamente).

### `criar-atalho.ps1`
Cria atalho na área de trabalho para o launcher.

**Uso:**
```powershell
.\scripts\criar-atalho.ps1
```

### `build.ps1`
Script para build e deploy da imagem Docker do frontend.

**Uso:**
```powershell
.\scripts\build.ps1
```

## 🎯 Uso Recomendado

**Para desenvolvimento diário:**
1. Dois cliques em `CoticBet Frontend.vbs` (ou no atalho da área de trabalho)
2. Aguardar ícone verde na bandeja
3. Acessar http://localhost:3000

**Para parar:**
- Clique direito no ícone da bandeja → "Parar Frontend"
- OU clique direito → "Sair" (para e fecha)
