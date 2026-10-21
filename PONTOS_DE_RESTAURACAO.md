# 📌 Registro Oficial de Pontos de Restauração (PR)

Este documento registra cronologicamente todos os pontos de restauração do projeto para recuperação imediata sob demanda.

---

## 🔒 REGRA DE OURO DAS RESTAURAÇÕES (ISOLAMENTO DE DADOS vs ESTRUTURA DO SITE)

Toda e qualquer restauração solicitada por você (ex: `PR.001`, `PR.002`, `PR.003`, etc.) segue rigorosamente estes dois pilares:

### 1. O que ENTRA no Ponto de Restauração (É Restaurado):
- **Toda a parte estrutural do site**: HTML, Javascript, CSS e arquivos de código;
- **Layout e disposição visual**: balõezinhos, cards, barras de navegação, sub-cabeçalhos, containers e seções;
- **Comportamento e lógica das abas**: criação, remoção, alternância, filtros e regras de exibição;
- **Quaisquer modificações estruturais futuras** que possam surgir no desenvolvimento do site.

### 2. O que NÃO ENTRA no Ponto de Restauração (É Mantido e Preservado Intacto):
- **Arquivos base e dados do sistema**;
- **Anexos adicionados pelo usuário** (arquivos de projetos, plantas, memoriais, etc.);
- **Fotos de escolas** anexadas ou movidas;
- **Modificações de ambientes nas fotos**;
- **Planilhas e links das planilhas** preenchidos na aba de ajustes;
- **Configurações de sincronização e autorização do robô**;
- Dados armazenados em `app_config.json`, `uploads/`, `localStorage` e `IndexedDB`.

---

### [PR.003]
- **Data/Hora:** 20/10/2026 23:00 (Horário Local)
- **Tag Git:** `PR.003` (local e remota no GitHub)
- **Status:** Ativo / Em Produção
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
- **Resumo das Alterações Contidas:**
  1. **Exibição do Número da Ordem de Serviço:** Extração da coluna `ORDEM DE SERVIÇO` (coluna 10) da planilha de contratos e exibição destacada em badge no card de cada obra.
  2. **Exibição do Valor da Ordem de Serviço:** Extração da coluna `VALOR` (coluna 9) da planilha de contratos e exibição destacada em badge verde com ícone de moeda no card de cada obra.
  3. **Correção da Coluna de Previsão / Término:** Correção do algoritmo de mapeamento de colunas para puxar rigorosamente da coluna `TÉRMINO / PREVISÃO` (coluna 16) em vez da coluna de `INÍCIO / PREVISÃO` (coluna 15).
  4. **Pesquisa Expandida:** A barra de busca de obras de contrato agora permite filtrar instantaneamente digitando o número da Ordem de Serviço ou o Valor.
  5. **Atualização Automática do Cache:** Invalidação controlada do cache local para que todos os dispositivos conectados recarreguem de imediato os novos dados corretos da planilha.

---

### [PR.002]
- **Data/Hora:** 20/10/2026 22:36 (Horário Local)
- **Tag Git:** `PR.002` (local e remota no GitHub)
- **Status:** Arquivado
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
- **Resumo das Alterações Contidas:**
  1. **Persistência Universal das Planilhas**: Inclusão de `DEFAULT_CONTRACTS_SHEET_URL`, `DEFAULT_PACTUE_SHEET_URL` e `DEFAULT_MEDICOES_SHEET_URL` no código cliente e na API serverless do Vercel.
  2. **Auto-inicialização no Celular/Novo Navegador**: Qualquer dispositivo, celular ou navegador que abrir o site pela primeira vez já carrega automaticamente com as planilhas de Contratos, PACTUE e Medições pré-configuradas e sincronizadas, sem exigir inserção manual.
  3. **Correção de `api/config.js`**: A API do Vercel agora entrega a configuração completa do `app_config.json` para todos os clientes conectados.
  4. Preservação integral das configurações, planilhas e autorização do robô.

---

### [PR.001]
- **Data/Hora:** 18/10/2026 01:54 (Horário Local)
- **Commit Git:** `ab999e0`
- **Tag Git:** `PR.001` (local e remota no GitHub)
- **Status:** Arquivado
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
