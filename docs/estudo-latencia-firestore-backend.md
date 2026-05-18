# Estudo de Latência Firestore e Estratégia de Backend
Data: 2026-05-15
Projeto: app-quero-camarao

## Resumo Executivo
Hoje o app está em arquitetura `mobile -> Firestore` (acesso direto no cliente), com várias telas executando queries pesadas ao abrir/focar.

Minha opinião: **sim, ter backend separado pode ser uma boa opção**, mas **não é o primeiro passo**. Antes, dá para reduzir bastante a lentidão com ajustes de consulta, cache e pré-carga. Depois disso, backend vira etapa de escala e governança.

Recomendação objetiva:
1. Curto prazo: otimizar Firestore + cache + prefetch no cliente.
2. Médio prazo: criar backend BFF para endpoints agregados do Admin.
3. Longo prazo: mover relatórios/analytics para pipeline assíncrono.

## Como está hoje (diagnóstico)
### Arquitetura atual
- Front React Native consultando Firestore diretamente via controllers em `src/controllers/**`.
- Uso intenso de `getDocs(query(...))` em páginas Admin (Home, Charts, Users etc.).
- Há cache em memória em algumas funções (`getAllUsers`, `getViewLogs`), mas limitado por sessão e sem cache persistente unificado.

### Evidências no código
- Firestore inicializado em `src/services/Firebase/index.js` com:
  - `experimentalForceLongPolling: true`
  - `useFetchStreams: false`
- Queries relevantes sem paginação/limite em pontos críticos:
  - `src/controllers/User/getAll.js`
  - `src/controllers/Publication/getViewLogs.js`
  - `src/controllers/Payment/order.js`
- Várias rotas Admin disparam leitura no foco da tela, concorrendo entre si.

## Por que está lento
1. **Leituras grandes no cliente**: traz coleção inteira e agrega no app.
2. **Cálculo no front**: filtros/somas/agrupamentos feitos após baixar dados.
3. **Admin com consultas simultâneas**: abrir aba pode disparar múltiplas chamadas pesadas.
4. **Sem cache persistente padrão para Admin**: toda abertura vira custo de rede.
5. **Possível impacto regional/rede móvel**: latência Brasil + variação de conectividade.

## Backend separado: vale a pena?
### Quando é boa ideia
- Precisa de endpoints agregados (ex: dashboard anual/mensal pronto).
- Quer controlar query pesada fora do app.
- Quer esconder regras internas e reduzir acoplamento do cliente ao schema do Firestore.
- Quer padronizar cache de servidor e observabilidade.

### Quando não resolve sozinho
- Se queries no banco estiverem mal modeladas/sem índice, backend só muda o ponto da lentidão.
- Se não houver estratégia de cache, backend também pode ficar lento.

Conclusão: **é boa opção, sim**, especialmente para Admin. Mas deve entrar após otimizações básicas para evitar custo sem ganho real.

## Estratégia proposta (em fases)
## Fase 1 - Ganho rápido (1 a 2 semanas)
Objetivo: reduzir TTFB percebido sem mudar arquitetura.

- Implementar `prefetch` ao entrar no Admin para Home/Charts/Users em paralelo.
- Cache persistente (AsyncStorage) com TTL por módulo:
  - Home Admin: 3-5 min
  - Charts: 5 min
  - Users: 10 min
- Padrão `stale-while-revalidate`:
  - mostra cache instantâneo
  - atualiza em background
- Reduzir payload:
  - usar filtros por período na query (não baixar histórico completo)
  - paginação/`limit` em listagens grandes
- Revisar índices Firestore para queries com `where + orderBy`.

Meta de UX:
- Tela Admin visível com dados em <= 1s quando cache existir.
- Timeout perceptível apenas em cold start sem cache.

## Fase 2 - BFF/Admin API (2 a 4 semanas)
Objetivo: tirar agregação pesada do app.

Criar backend leve (Cloud Run/Fly/Render/AWS) com endpoints:
- `GET /admin/overview?year=YYYY&month=MM`
  - retorna anual, mensal, mês anterior, próximo, últimas transações
- `GET /admin/charts/views?year=YYYY&month=MM&range=01-15`
  - retorna série pronta para gráfico
- `GET /admin/users/summary`
  - totais por tipo e por região

Regras técnicas:
- Cache Redis/memória no servidor (TTL curto)
- Compressão + payload enxuto
- Auth JWT/Firebase token
- Rate limit
- Logs e métricas (p95/p99)

Resultado esperado:
- Menos leituras diretas do app
- Respostas menores e consistentes
- Menos variação de performance no cliente

## Fase 3 - Dados pré-agregados (escala)
Objetivo: dashboards quase instantâneos.

- Pipeline assíncrono (Cloud Functions + scheduler) atualizando coleções resumidas:
  - `admin_metrics_daily`
  - `admin_metrics_monthly`
- App/backend lêem resumo pronto, não dados brutos.

## Riscos e trade-offs
### Manter só Firestore direto
- Menor complexidade
- Maior risco de latência variável no Admin

### Adicionar backend
- Melhor controle e performance para agregações
- Mais custo operacional (deploy, monitoramento, segurança)

## Plano recomendado para seu cenário
Você descreveu exatamente um caso clássico de dashboard/Admin com consulta pesada no front. Então eu recomendo:

1. **Imediato**: fase 1 completa (cache/prefetch/query enxuta).
2. **Na sequência**: backend BFF só para Admin (fase 2).
3. **Depois**: pré-agregação (fase 3) se volume crescer.

## Checklist técnico de validação
- p95 de resposta Home Admin antes/depois.
- Tempo até primeira render com dados (warm cache vs cold cache).
- Número de docs lidos por tela.
- Taxa de timeout por módulo.
- Custo Firestore por 1.000 sessões Admin.

## Resposta direta à sua pergunta
- "Criar um backend separado e conectar no app é uma boa?"
  - **Sim, para o Admin é uma ótima direção**.
- "Pode ser a causa da lentidão hoje?"
  - **Sim**: o front está fazendo query e agregação que deveriam estar parcialmente no servidor (ou pré-agregadas), e isso tende a lagar conforme os dados crescem.

## Próximo passo sugerido
Implementar primeiro um POC de backend com **1 endpoint** (`/admin/overview`) e comparar com a tela atual em:
- latência média
- p95
- tamanho de payload
- percepção do usuário

Se o ganho passar ~40%, avançar com migração gradual das outras telas Admin.
