# SDD - Correção no Compartilhamento do Ganhador (Feature 2)

## 1. Descrição
Resolver o erro que ocorre ao tentar compartilhar o ganhador do sorteio no aplicativo. O objetivo é garantir que o compartilhamento funcione corretamente em todas as plataformas (Android e iOS).

## 2. Objetivos
- Restaurar a funcionalidade de compartilhamento nativo.
- Padronizar as mensagens de compartilhamento (individual e coletivo).
- Garantir que links de acompanhamento sejam incluídos corretamente.

## 3. Critérios de Aceitação
- O ganhador é compartilhado com sucesso nas plataformas selecionadas (WhatsApp, etc).
- Não há crashes ao abrir o sheet de compartilhamento.
- Informações como telefone (formatado), CPF (mascarado) e localização são incluídas.

## 4. Estrutura Técnica (Implementação Aplicada)

### 4.1 Utilitário de Mensagem: `src/utils/winnerShareMessage.js`
- `buildSingleWinnerShareMessage(winner, appLink)`: Gera o texto para compartilhar um único ganhador.
- `buildWinnersShareMessage(winners, appLink)`: Gera uma lista formatada de todos os vencedores da rodada.
- `normalizePhone`: Garante que apenas números sejam enviados.
- `getWinnerLocation`: Extrai cidade/estado de forma resiliente ao tipo de usuário.

### 4.2 Integração com UI: `src/pages/Admin/DrawPrizeWinnersResult/index.jsx`
- Utiliza a API nativa `Share.share` do React Native.
- Botão de compartilhamento geral no Header.
- Botão de compartilhamento individual em cada card de ganhador.

### 4.3 Tratamento de Erros
- Implementação de blocos `try/catch` ao redor da API de `Share`.
- Fallback visual usando `Toast` em caso de falha na abertura do sheet do sistema.

## 5. Recursos Necessários
- Acesso à API `Share` do React Native.
- Dispositivos físicos para validação de intents de sistema.

## 6. Estimativa e Riscos
- **Estimativa**: 3 dias úteis (Finalizado).
- **Riscos**: Mudanças nas políticas de intents do Android/iOS.
- **Testes**: Validado em Android 13+ e iOS 16+.
