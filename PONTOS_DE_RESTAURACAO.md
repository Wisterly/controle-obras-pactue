# 📌 Registro Oficial de Pontos de Restauração (PR)

Este documento registra cronologicamente todos os pontos de restauração do projeto para recuperação imediata sob demanda.

---

## 🔒 REGRA DE OURO DAS RESTAURAÇÕES (ISOLAMENTO DE DADOS vs ESTRUTURA DO SITE)

Toda e qualquer restauração solicitada por você (ex: `PR.001`, `PR.002`, `PR.015`, etc.) segue rigorosamente estes dois pilares:

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

### [PR.001]
- **Data/Hora:** 18/10/2026 01:54 (Horário Local)
- **Commit Git:** `ab999e0`
- **Tag Git:** `PR.001` (local e remota no GitHub)
- **Status:** Ativo / Em Produção
- **Links:**
  - Produção Oficial: https://controle-obras-gpr.vercel.app
  - Produção (Alternativo): https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
- **Resumo das Alterações Estruturais Contidas:**
  1. Remoção do indicador `Aba ativa: Aba Medições` do canto superior direito, garantindo largura total e sem sobreposição para as 5 abas de navegação.
  2. Disposição vertical exclusiva da aba **Medições**: 1º Contratos, 2º GREs, 3º Indicadores/Métricas financeiras (Total Geral Medido, Na GPR, No FIM, Pago Parcial, Quitado), 4º Filtros e Cards de Medição.
  3. Adaptação do card **TODAS AS GRES** nas abas **Obras de Contrato**, **Obras PACTUE** e **Medições**:
     - Subtítulo ("Geral Piauí") removido.
     - Largura/comprimento esticado via grade responsiva (`custom-todas-gres-grid`).
     - Número de contagem empurrado para a direita (`ml-auto`) sem sobrepor o texto.
     - Altura mantida igual aos demais cards (`min-h-[42px]`).
     - Todas as 21 GREs mantidas em sua ordem e disposição originais.
  4. Preservação integral das configurações, planilhas e autorização do robô.
