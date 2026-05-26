# Especifica√ß√£o (SDD) - Atualiza√ß√£o do Encarte do Produtor

## Overview
Atualizar o encarte publicado pelo produtor para refletir o novo modelo. O objetivo √© garantir que todos os usu√°rios recebam informa√ß√µes atualizadas.

## Requirements
* O encarte deve ser atualizado em todas as plataformas.
* O link deve funcionar tanto para Android quanto para iPhone (iOS).
* √â necess√°rio acesso ao sistema de publica√ß√£o e ao novo modelo do encarte.

## Architecture / Design
* A principal depend√™ncia √© a cria√ß√£o do novo modelo do encarte.
* Os fluxos de navega√ß√£o e exibi√ß√£o dever√£o apontar para os novos links/recursos.

## Entreg√°veis
* O encarte atualizado visualmente.
* Confirma√ß√£o homologada de que o link do encarte funciona perfeitamente nas duas plataformas.

## Edge Cases & Error Handling (Riscos)
* **Risco**: Atrasos na cria√ß√£o do novo modelo.
* **Mitiga√ß√£o**: Implementa√ß√£o de um cronograma de revis√£o.

**Estimativa de Tempo**: 2 dias √∫teis.

---

## ImplementaÁ„o TÈcnica (TDD)

### O que foi implementado
- CriaÁ„o de utilit·rio de encarte do produtor em `src/utils/encarteProdutor.js`.
- GeraÁ„o de link universal HTTPS do encarte:
  - usa link fornecido pelo backend quando v·lido;
  - fallback para `https://querocamarao.com.br/encarte/<publicationId>`.
- AtualizaÁ„o da tela `SalesList` para:
  - incluir `encarteLink` em cada card;
  - usar mensagem padronizada com link no contato via WhatsApp;
  - exibir bot„o **Ver Encarte** que abre o link no dispositivo.

### Testes (RED -> GREEN)
- Testes criados antes da implementaÁ„o em `tests/encarteProdutor.test.cjs`.
- Casos cobertos:
  - prioriza link HTTPS fornecido;
  - fallback de link por `publicationId`;
  - mensagem de contato contÈm dados do encarte e link.
- ExecuÁ„o local:
  - `node --test tests/generalDrawRules.test.cjs tests/sharingWinnerFix.test.cjs tests/encarteProdutor.test.cjs`
  - Resultado: **8 passed, 0 failed**.

### Compatibilidade Android/iOS
- O link do encarte È HTTPS (universal), abrindo em navegador/app suportado nos dois sistemas.
