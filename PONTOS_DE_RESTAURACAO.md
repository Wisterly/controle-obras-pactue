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

### [PR.006]
- **Data/Hora:** 21/10/2026 03:05 (Horário Local)
- **Tag Git:** `PR.006` (Tags específicas: `PR.006.1` para Desktop e `PR.006.2` para Mobile)
- **Status:** Ativo / Em Produção
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3005

#### 🖥️ PR.006.1 — Versão Computador (Desktop):
- **Origem / Base:** Replicado integralmente do padrão consolidado PR.004/PR.005.
- **Estrutura e Linhas de Código Desktop:**
  - Fundo clássico azul escuro institucional (`#0b111e`).
  - Sub-cabeçalho superior tradicional horizontal com as 5 abas (`#desktopSubHeader` com `display: block`).
  - Botão de ação rápida "Copiar WhatsApp" visível no canto superior direito abaixo do menu de Ajustes (`#quickCopyBtn` com `display: flex`).
  - Painel de GREs amplo em grade de 4 a 5 colunas sem compressão móvel.
  - Ausência total de elementos móveis (barra de base `#mobileBottomNav` oculta, botão flutuante `#whatsappFab` oculto).

#### 📱 PR.006.2 — Versão Celular (Mobile):
- **Origem / Base:** Evolução completa de otimização ergonômica móvel (Ponto de Restauração 006).
- **Estrutura e Linhas de Código Mobile:**
  - **Alinhamento do Cabeçalho SEDUC-PI:** Badge com altura reduzida (`18px`), largura expandida (`px-3`) e `whitespace-nowrap`, eliminando quebras de linha e perfeitamente alinhado com `Controle de Obras GPR`.
  - **Grade de GREs Compacta sem Rolagem:** Disposição das 21 GREs em grade de 3 colunas compactas onde todas as 21 GREs ficam 100% visíveis simultaneamente dentro do painel sem necessidade de barra de rolagem vertical (`overflow-y: visible`).
  - **Card "TODAS AS GRES" em Destaque:** Ocupa a largura total (3 colunas do topo) com altura de 35px, mantendo o título legível e a contagem de 2750 obras em destaque superior.
  - **Botão Flutuante do WhatsApp:** Ícone oficial do WhatsApp posicionado a 58px da base no canto inferior direito com animação contínua de pulso suave (*fab-pulse*).
  - **Desobstrução do Topo:** Botão "Copiar WhatsApp" ocultado no cabeçalho do celular para evitar redundância.
  - **Barra de Navegação Inferior (Mobile Bottom Nav):** 50px de altura com efeito vidro fumê alaranjado translúcido (*glassmorphism* — `rgba(36, 20, 12, 0.82)`) e borda âmbar fina.
  - **Pastas com Expoente ($x^2$):** Numeração de obras posicionada como expoente ultracompacto (`7.5px`) no canto superior direito de cada ícone de pasta.
  - **Tema Escuro Mobile:** Fundo preto profundo (`#07090e`) com reflexos suaves de gradiente em laranja discreto.
  - **Margem de Rolagem:** Respiro de 74px na base da página para que o conteúdo final nunca fique sob a barra móvel.

---

### [PR.005]
- **Data/Hora:** 21/10/2026 02:10 (Horário Local)
- **Tag Git:** `PR.005` (local e remota no GitHub)
- **Status:** Arquivado (Histórico)
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3005
- **Resumo das Alterações Contidas:**
  1. **Navegação do Computador (Desktop) 100% Preservada (Padrão PR.004):**
     - O computador permanece rigorosamente idêntico ao `PR.004` (meia-noite e 25 de 21/10/2026).
     - Subheader superior com as 5 abas visível exclusivamente no computador (`display: block`).
     - Fundo azul escuro clássico (`#0b111e`), sem qualquer barra inferior ou elemento móvel no Desktop.
  2. **Navegação Mobile Exclusiva na Base da Tela (Mobile Bottom Nav):**
     - Barra de navegação móvel compacta (50px) para alternar entre as 5 pastas com 1 toque de polegar: **Contratos, PACTUE, Medições, Projetos e Fotos**.
     - **Plano de fundo em laranja escuro translúcido com efeito vidro fumê (*glassmorphism* — `rgba(36, 20, 12, 0.82)` e `blur(18px)`)**, com borda superior fina em tom âmbar/laranja (`1px solid rgba(249, 115, 22, 0.5)`).
  3. **Numeração das Pastas como Expoente ($x^2$):**
     - O ícone da pasta atua como a base ($x$) e o contador de obras como o expoente ($2$).
     - O número fica ultracompacto (`7.5px` em negrito) no **canto superior direito do ícone** (`top: -5px; right: -8px`), sem cobrir o ícone e sem invadir o espaço da aba vizinha.
  4. **Tema Mobile Preto com Auras de Laranja Suave:**
     - Fundo do celular atualizado para preto profundo (`#07090e`) com reflexos sutis de laranja suave e moderado.
  5. **Isolamento de Rolagem e Botão WhatsApp Flutuante:**
     - `padding-bottom: 74px` e espaçador final garantem que o último card pare com folga visível acima da barra inferior.
     - Botão flutuante do WhatsApp posicionado a 58px da base, flutuando sobre a barra no celular e oculto no desktop.
  6. **Ícone Oficial do WhatsApp e Efeito Pulsante (Mobile):**
     - O botão flutuante inferior no mobile agora possui o ícone oficial do WhatsApp idêntico ao modelo de referência e uma animação contínua e suave de pulsar (*pulse effect*).
     - **Remoção do Botão "Copiar WhatsApp" do Cabeçalho no Mobile:** O botão que ficava abaixo dos Ajustes no topo direito (circulado em vermelho no print) foi ocultado no mobile para desobstruir o topo e evitar redundância com o botão flutuante, mantendo-o normalmente no Desktop.
     - **Ícone Oficial na Modal:** Na modal de envio ("Pronto para envio"), o ícone de cabeçalho e o botão de ação utilizam o ícone oficial do WhatsApp.

   7. **Alinhamento Uniforme do Badge SEDUC-PI e Painel de GREs sem Rolagem (Mobile):**
      - **Correção da quebra do SEDUC-PI:** Badge ajustado com menor altura (18px), maior comprimento/largura (px-3) e whitespace-nowrap, eliminando a quebra em duas linhas e mantendo o nome uniforme alinhado com Controle de Obras GPR.
      - **Grade de GREs sem Rolagem:** No mobile, as GREs da 1ª à 21ª foram reduzidas proporcionalmente em grade de 3 colunas compactas, cabendo todas as 21 GREs visíveis dentro do painel simultaneamente sem precisar de rolagem (overflow-y: visible).
      - **Card "Todas as GREs" em Destaque:** Permanece mais largo (ocupando a linha inteira de 3 colunas no topo) e mais comprido que os outros cards, acomodando com folga o nome e o número de 2750 obras.

---

### [PR.004]
- **Data/Hora:** 21/10/2026 00:25 (Horário Local)
- **Tag Git:** `PR.004` (local e remota no GitHub)
- **Status:** Arquivado (Base de referência Desktop)
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
