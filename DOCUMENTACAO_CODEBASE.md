# Documentação Técnica Completa - Quero Camarão

## 1) Objetivo do sistema

O app **Quero Camarão** conecta produtores e compradores de camarão.
Principais objetivos:

- publicar viveiros/lotes de camarão;
- negociar via WhatsApp;
- cobrar/publicar via fluxo de pagamento;
- acompanhar pedidos/transações;
- exibir referências de preço e dados de mercado;
- fornecer painel administrativo.

## 2) Stack e arquitetura

### 2.1 Stack principal

- React Native + Expo
- Firebase (Firestore + Storage + Auth)
- Styled Components
- Redux (estado global)
- React Navigation (Drawer + Tabs + Stack)

### 2.2 Camadas da aplicação

- `pages/`: telas (fluxo de usuário e admin)
- `components/`: componentes reutilizáveis
- `controllers/`: acesso a dados e regras de integração
- `services/`: provedores externos (Firebase, MercadoPago, storage local, notificações)
- `routes/`: configuração de navegação
- `store/`: estado global Redux
- `utils/`: funções utilitárias (formatação, datas, redirects etc.)
- `styles/`: tema e estilos compartilhados

## 3) Estrutura de pastas (visão macro)

Diretórios principais em `src/`:

- `assets`
- `components`
- `controllers`
- `pages`
- `polyfills`
- `routes`
- `services`
- `store`
- `styles`
- `utils`

## 4) Módulos de domínio (controllers)

Módulos identificados em `src/controllers/`:

- `Config`: configurações de sistema
- `Cupons`: cupons/descontos
- `DrawPrizes`: sorteios
- `Invitations`: convites/indicações
- `Notifications`: notificações
- `Payment`: pedidos/pagamentos
- `Publication`: publicações e logs de visualização
- `PublishAds`: anúncios
- `ShirimpSale`: histórico de despesca/preço de venda
- `ShrimpPonds`: listagem dos viveiros
- `Signature`: assinaturas/planos
- `User`: usuários/perfil
- `Wallet`: carteira/saldo

## 5) Modelo de dados (Firestore)

Coleções declaradas em `src/services/Firebase/models.js`:

- `users`
- `cupons`
- `shrimpPonds`
- `shrimpPrice`
- `orders`
- `wallets`
- `invitations`
- `config`
- `publishAds`
- `feedBack`
- `logPublicationsViews`
- `drawPrizesHistory`
- `notifications`
- `listSignatures`
- `drawPrizesRules`
- `newDrawPrizeRules`
- `drawPrizesLive`
- `shirimpSale`

Storage local:

- `user`
- `Shrimp`
- `ads`

## 6) Navegação e módulos de tela

### 6.1 Rotas principais

Arquivo central de nomes: `src/routes/dataRoutes.js`.

Contém:

- rotas públicas e autenticadas (Home, Login, Register, Publication, Profile etc.)
- rotas de pagamento (Payment, PaymentWeb, PaymentEnd, QRCodePix)
- rotas de suporte (Help, Notifications, Invitations)
- namespace `admin` para painel administrativo

### 6.2 Admin

Tabs administrativas (`navigationTabs.jsx`):

- `Início` (resumo financeiro + transações)
- `Gráficos` (visualizações e análise)
- `Usuários` (contagem, segmentação e listas)

## 7) Regras de negócio principais

### 7.1 Publicação e negociação

- Produtor publica lotes/viveiros com gramatura e quilos.
- Comprador visualiza cards de oferta.
- Contato é redirecionado ao WhatsApp do produtor.
- Visualização pode gerar log para analítico e notificação.

### 7.2 Pagamento e pedidos (`orders`)

- `orders` contém pedidos com `status` (ex.: `approved`).
- No admin, indicadores financeiros usam pedidos aprovados.
- Valor principal exibido: `paymentValue`.

### 7.3 Cálculo financeiro Admin (Início)

Regra atual implementada na Home Admin:

- **Total Proventos Anual**: soma de `paymentValue` dos pedidos do **ano selecionado**.
- **Total Proventos Mensal**: soma de `paymentValue` dos pedidos do **mês+ano selecionados**.
- **Mês passado**: soma de `paymentValue` do mês anterior ao selecionado.
- **Próximo mês**: soma de `paymentValue` do mês seguinte ao selecionado.
- **Transações**: lista de pedidos do mês+ano selecionados.

### 7.4 Tratamento de dados incompletos

Na leitura de `orders`:

- datas são normalizadas (`Date`, `Timestamp`, `seconds`);
- `user` e `dataPublication.shrimps` são saneados;
- pedidos inválidos (sem `idOrder`, `paymentValue` não numérico, data inválida) são descartados da lista de cálculo.

## 8) Performance e estratégia de requisição

### 8.1 Problema observado

- consultas longas no Firestore (especialmente admin) causavam latência alta, timeout visual e inconsistência de tela.

### 8.2 Melhorias aplicadas

- cache em memória para consultas críticas (`orders`, `users`, `viewLogs`) com TTL;
- query administrativa por ano (`getApprovedOrdersByYear`) para reduzir payload;
- timeout de UI para evitar skeleton infinito;
- carregamento lazy das tabs admin;
- robustez de inicialização do Firestore para ambiente React Native.

### 8.3 Trade-off atual

- quando backend demora além do limite, UI sai do loading com fallback.
- isso melhora UX, mas pode mostrar estado parcial até nova tentativa.

## 9) Fluxos funcionais importantes

### 9.1 Home do cliente

- busca por texto e filtros (local, gramatura, quilos, viveiros).
- cards de publicação com imagem, dados e botão de contato.

### 9.2 Painel Admin - Início

Fluxo:

1. carregar pedidos aprovados do ano;
2. preencher selects de mês/ano;
3. calcular indicadores e lista do período;
4. recalcular ao trocar mês;
5. recarregar dataset ao trocar ano.

### 9.3 Painel Admin - Gráficos

- lê logs de visualização (`logPublicationsViews`);
- agrega por dia dentro do range;
- permite navegação para detalhe por publicação.

### 9.4 Painel Admin - Usuários

- traz usuários, agrupa por estado/cidade;
- separa por tipo (`productor`, `client`);
- permite navegação para listas detalhadas.

## 10) Contratos implícitos críticos

Para `orders`:

- `idOrder` string
- `status` (usar `approved` para financeiro)
- `paymentValue` number
- `createdAt` timestamp/date
- `user` objeto com nome
- `dataPublication.shrimps` array

Se estes contratos vierem inconsistentes, o módulo Admin precisa fallback/saneamento.

## 11) Pontos de atenção (riscos atuais)

- uso do Firestore Web SDK no RN pode gerar instabilidades (`webchannel`) em alguns ambientes.
- diferenças de timezone impactam agregações por mês/dia.
- dados históricos com schema legado podem distorcer indicadores se não forem normalizados.

## 12) Recomendações de evolução

- migrar Firestore de áreas críticas admin para SDK nativo RN (`@react-native-firebase/firestore`) se instabilidade persistir.
- criar camada única de agregação financeira no backend (Cloud Functions) para evitar cálculo em cliente.
- adicionar testes automatizados de regra financeira por mês/ano (TDD permanente).
- registrar métricas de latência por query para monitoramento.

## 13) Mapa resumido de pages

### Usuário final

- autenticação: `Login`, `Register`, `Reset Password`
- comercial: `Home`, `Publication`, `MyPublications`, `MyAds`, `SalesList`, `SaleShrimps`
- pagamento: `Payment`, `PaymentWeb`, `PaymentEnd`, `PaymentOrders`, `QRCodePix`
- conta: `Profile`, `PersonalData`, `DeleteUser`
- suporte/engajamento: `Help`, `Invitations`, `ReceivedNotifications`

### Administração

- `Admin/Home`
- `Admin/Charts`
- `Admin/Users`
- `Admin/UsersList`
- `Admin/UserDetailed`
- `Admin/UserPublications`
- `Admin/PublicationViewLogsList`
- `Admin/Notification`
- `Admin/DrawPrize*`
- `Admin/ShrimpPrice`
- `Admin/ListPublishAds*`

## 14) Convenções da codebase

- rotas centralizadas em `dataRoutes`
- controllers concentram I/O com Firebase
- componentes visuais em `components`
- regras de formatação/utility em `utils`
- estilos via `styled-components`

## 15) Como manter esse documento atualizado

Sempre atualizar quando houver:

- nova coleção Firestore;
- nova regra de cálculo financeiro;
- mudança de rota/navegação;
- migração de SDK ou de estratégia de cache;
- novos módulos admin.

