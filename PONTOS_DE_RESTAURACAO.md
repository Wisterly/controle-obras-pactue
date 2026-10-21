# 📌 Registro Oficial de Pontos de Restauração (PR)

Este documento registra cronologicamente todos os pontos de restauração do projeto para recuperação imediata sob demanda.

---

## 🔒 REGRA DE OURO DAS RESTAURAÇÕES (ISOLAMENTO DE DADOS vs ESTRUTURA DO SITE)

Toda e qualquer restauração solicitada por você (ex: `PR.001`, `PR.002`, `PR.003`, `PR.004`, etc.) segue rigorosamente estes dois pilares:

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

### [PR.005]
- **Data/Hora:** 21/10/2026 00:50 (Horário Local)
- **Tag Git:** `PR.005` (local e remota no GitHub)
- **Status:** Ativo / Em Produção
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
- **Resumo das Alterações Contidas:**
  1. **Barra de Navegação na Base da Tela (Mobile Bottom Navigation):** Barra permanente no rodapé da tela em celulares (estilo app móvel nativo), permitindo alternar instantaneamente entre as 5 abas (**Contratos, PACTUE, Medições, Projetos e Fotos**) com ícones destacados, badges de contagem em tempo real e iluminação temática, eliminando o corte de abas no topo.
  2. **Botão Flutuante (FAB) do WhatsApp Otimizado:** Posicionado a 74px da base para flutuar perfeitamente acima da barra de navegação, com acesso rápido ao relatório formatado de qualquer tela com 1 único toque de polegar.
  3. **Responsividade Aprimorada nos Cards:** Badges de Status, Situação Diária, Ordem de Serviço e Valor agora quebram harmoniosamente em telas estreitas (360px a 414px), sem espremer ou cortar os nomes das escolas e empresas.
  4. **Auditoria Mobile com Headless Chrome (390x844):** Bateria de testes automatizados com emulador móvel validando o posicionamento fixo `bottom: 0`, a troca de abas e a geração de relatório com 100% de sucesso.

---

### [PR.004]
- **Data/Hora:** 20/10/2026 23:40 (Horário Local)
- **Tag Git:** `PR.004` (local e remota no GitHub)
- **Status:** Arquivado
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
- **Resumo das Alterações Contidas:**
  1. **Sincronização em Mão Dupla Ativada (Bidirecional):** Integração com o Webhook Google Apps Script (`https://script.google.com/macros/s/AKfycby_uj9BL3Pcezc7BxJJ0v-DjqWdHHvGmxt2_-givBvv8Ek54C9GCAK-6J5Jj62IdSVd/exec`).
  2. **Gravação Instantânea na Planilha Google:** Ao alterar Status da Demanda, Situação Diária ou Data de Previsão/Término em qualquer card, o sistema atualiza localmente e envia a alteração em tempo real para a planilha oficial.
  3. **Backend Proxy (/api/sync-sheet):** Implementado no servidor local (`server.cjs`) e no Vercel (`api/sync-sheet.js`) com tratamento de redirecionamento 302 do Google e notificações toast na interface.
  4. **Filtro Unificado em Cascata para Relatório do WhatsApp:** O relatório gerado para o WhatsApp, o banner de contadores e a listagem de cards agora são 100% sincronizados via motor único `getFilteredDataset()`. Ao filtrar por GRE, por Status, ou digitando o nome da escola, OS, município ou valor na busca, o WhatsApp exporta apenas e exatamente as obras filtradas visíveis em tela, exibindo também Ordem de Serviço e Valor de cada contrato.

---

### [PR.003]
- **Data/Hora:** 20/10/2026 23:00 (Horário Local)
- **Tag Git:** `PR.003` (local e remota no GitHub)
- **Status:** Arquivado
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
