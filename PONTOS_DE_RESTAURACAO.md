# 📌 Registro Oficial de Pontos de Restauração (PR)

Este documento registra cronologicamente todos os pontos de restauração do projeto para recuperação imediata sob demanda.

---

### [PR.001]
- **Data/Hora:** 18/10/2026 01:54 (Horário Local)
- **Commit Git:** `9b08d50`
- **Tag Git:** `PR.001` (local e remota no GitHub)
- **Status:** Ativo / Em Produção
- **Links:**
  - Produção: https://controle-obras-pactue.vercel.app
  - Localhost: http://localhost:3000
- **Resumo das Alterações Contidas:**
  1. Remoção do indicador `Aba ativa: Aba Medições` do canto superior direito, garantindo largura total e sem sobreposição para as 5 abas de navegação.
  2. Disposição vertical exclusiva da aba **Medições**: 1º Contratos, 2º GREs, 3º Indicadores/Métricas financeiras (Total Geral Medido, Na GPR, No FIM, Pago Parcial, Quitado), 4º Filtros e Cards de Medição.
  3. Adaptação do card **TODAS AS GRES** nas abas **Obras de Contrato**, **Obras PACTUE** e **Medições**:
     - Subtítulo ("Geral Piauí") removido.
     - Largura/comprimento esticado via grade responsiva (`custom-todas-gres-grid`).
     - Número de contagem empurrado para a direita (`ml-auto`) sem sobrepor o texto.
     - Altura mantida igual aos demais cards (`min-h-[42px]`).
     - Todas as 21 GREs mantidas em sua ordem e disposição originais.
  4. Preservação integral das configurações, planilhas e autorização do robô.
