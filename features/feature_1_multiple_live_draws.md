# SDD - Múltiplos Sorteios ao Vivo (Feature 1)

## 1. Descrição
Implementar a funcionalidade que permite a criação de vários sorteios ao vivo, com a possibilidade de alterar o nome de cada um. O objetivo é aumentar a flexibilidade e a variedade de sorteios oferecidos aos usuários.

## 2. Objetivos
- Permitir a coexistência de múltiplos sorteios ativos no Firestore.
- Habilitar a edição dinâmica de nomes de sorteios (CRUD completo).
- Melhorar a experiência administrativa na gestão de eventos simultâneos.

## 3. Critérios de Aceitação
- O administrador deve conseguir criar um novo sorteio com nome customizado.
- Deve ser possível editar o nome de sorteios existentes via interface Admin.
- A listagem de sorteios deve mostrar o status, participantes e ganhadores de cada evento.
- Validação de nomes (mínimo 2, máximo 50 caracteres).

## 4. Estrutura Técnica (Implementação Aplicada)

### 4.1 Utilitário de Lógica: `src/utils/multipleLiveDraws.js`
- `validateDrawName(name)`: Valida se o nome cumpre os requisitos de tamanho e tipo.
- `buildDrawSummary(doc)`: Normaliza os dados do Firestore para exibição na UI.
- `applyDrawNameEdit(draws, id, newName)`: Aplica a alteração de nome em uma lista de sorteios localmente antes/após persistência.

### 4.2 Controller Firebase: `src/controllers/DrawPrizes/live.js`
- `createDrawPrizeLiveByCode`: Cria um novo documento em `drawPrizesLive` com um ID único (UUID).
- `getAllActiveDrawPrizesLive`: Recupera todos os sorteios onde `status == true`.
- `updateDrawPrizeName`: Atualiza o campo `name` no documento específico do Firestore.
- `updateDrawPrizeLiveNames`: Adiciona o nome do sorteio atual ao histórico de nomes do documento (`names` array).

### 4.3 Interface Admin: `src/pages/Admin/DrawPrizeLive/index.jsx`
- Implementação de modal/dialog para edição de nome (`showEditNameDialog`).
- Listagem dinâmica usando `activeDraws` state, sincronizada com o Firestore.
- Uso de `buildDrawSummary` para exibir contagens de participantes e ganhadores em tempo real.

## 5. Recursos e Dependências
- Firebase Firestore (Coleção `drawPrizesLive`).
- Componente `DrawPrizeNameDialog` para entrada de dados.

## 6. Estimativa e Riscos
- **Estimativa**: 4 dias úteis (Finalizado).
- **Riscos**: Colisões de nomes em sorteios simultâneos (Mitigado por IDs únicos).
- **Testes**: Validados cenários de criação, edição de nome e persistência no histórico.
