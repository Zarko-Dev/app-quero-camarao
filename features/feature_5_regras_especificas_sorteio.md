# Especificação (SDD) - Regras Específicas e Sorteio ao Vivo

## Overview
Estabelecer regras específicas para o sorteio ao vivo, onde 2 de 5 pessoas ganham e 3 não. O objetivo é garantir a clareza e a transparência do processo.

## Requirements
* As regras devem ser documentadas e aceitas por todos os envolvidos (dependência de confirmação da equipe).
* O sistema deve implementar as regras de forma justa (2 ganhadores a cada 5 pessoas).
* **Regra de Indicação (Admin)**: Quem o admin indicar para ganhar, vai ganhar o sorteio obrigatoriamente.
* **Atenção (Firebase)**: A pessoa indicada que vencer o sorteio **NÃO** deve ser atribuída o status `blocked: true` no Firebase. É necessário ter muito cuidado ao revisar essa lógica.

## Architecture / Design
* Serão necessárias ferramentas para a realização do sorteio ao vivo.
* A lógica de salvamento de ganhadores e participantes no banco de dados (Firebase) deverá incluir tratamento para não bloquear os indicados pelo admin.

## Entregáveis
* Documentação das regras estabelecidas.
* Um sistema funcional que as implemente conforme as probabilidades e exceções de indicação.

## Edge Cases & Error Handling (Riscos)
* **Risco**: Confusão durante o sorteio.
* **Mitigação**: Realização de ensaios prévios exaustivos.

**Estimativa de Tempo**: 2 dias úteis.
