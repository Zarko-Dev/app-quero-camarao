# SDD - Regras para Sorteio Geral (Feature 3)

## 1. Descrição
Criar e documentar as regras para o sorteio geral, garantindo que não haja ganhadores repetidos. O objetivo é assegurar que todos os participantes tenham uma chance justa.

## 2. Objetivos
- Prevenir a duplicidade de ganhadores em um mesmo sorteio ativo.
- Implementar regras de elegibilidade baseadas em localização e identificadores únicos.
- **Regra Admin**: Permitir indicação manual de ganhadores (se configurado) sem bloqueio posterior.

## 3. Critérios de Aceitação
- Ganhadores de rodadas anteriores do mesmo sorteio são excluídos do pool.
- Participantes sem identificador (UID/Email/CPF) ou sem localização (Cidade/Estado) são excluídos.
- Sistema de logs registra o motivo da exclusão de cada participante.

## 4. Estrutura Técnica (Implementação Aplicada)

### 4.1 Utilitário de Elegibilidade: `src/utils/drawEligibility.js`
- `buildEligibleParticipants`: Filtra a lista total baseada em:
    1. Existência de chave única (`uid` > `email` > `cpf`).
    2. Presença de dados de localização.
    3. Ausência no conjunto `previousWinners`.
- `pickRandomUniqueWinners`: Algoritmo de sorteio aleatório sem reposição usando `splice` no pool.

### 4.2 Controller de Regras: `src/controllers/DrawPrizes/rules.js`
- `getNewDrawPrizeRules`: Recupera regras específicas do Firestore.
- `blockWinners`: (Opcional) Permite marcar ganhadores em coleções externas se necessário.

### 4.3 Fluxo no Admin: `src/pages/Admin/DrawPrizeLive/index.jsx`
- `executeDrawPrizeLive`: Orquestra o sorteio recuperando participantes, filtrando com `buildEligibleParticipants` e salvando o resultado.
- Bloqueia execução se o pool elegível for vazio.

## 5. Regras de Negócio Específicas
- **Probabilidade**: 2 de 5 pessoas (se configurado globalmente).
- **Indicação Admin**: Se um usuário for indicado, ele pula a validação de sorteio aleatório e é inserido diretamente no array de vencedores (pendente integração visual final, mas lógica suportada pelo array de winners).

## 6. Estimativa e Riscos
- **Estimativa**: 2 dias úteis (Finalizado).
- **Riscos**: Pool de participantes muito pequeno resultando em sorteio vazio.
- **Testes**: Unidade para `buildEligibleParticipants` cobrindo exclusão por duplicidade e falta de dados.
