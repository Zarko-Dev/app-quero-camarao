# Fase 9 — Compartilhar anúncio com link direto — Design Spec

## Goal
Item 19. Compartilhar um anúncio específico com mensagem no formato pedido (cidade, gramatura, quantidade, viveiros, link exclusivo), abrindo o anúncio direto se o app estiver instalado; se não estiver, página web com o anúncio e botão de baixar; se vendido, avisar e sugerir outros disponíveis.

## Bloqueio real (não decidido nesta sessão)
Universal Links (iOS) e App Links (Android) — que fazem um link `https://dominio/...` abrir o app direto sem passar por navegador — exigem: (1) um domínio de verdade servindo `.well-known/apple-app-site-association` e `.well-known/assetlinks.json`, (2) uma página web de fallback hospedada nesse domínio, (3) configuração nativa (`associatedDomains` no iOS, `intentFilters` no Android) que só tem efeito depois de rebuild + nova build nas lojas. Nada disso existe no projeto hoje (sem `hosting` no `firebase.json`, sem domínio configurado em lugar nenhum). Essa parte fica formalmente pendente de uma decisão do usuário (qual domínio, hospedar onde) — não é algo que dá pra inventar sem quebrar em produção.

## O que ENTRA nesta implementação (sem depender do domínio)

**A. Tela de detalhe do anúncio** (`src/pages/PublicationDetail/`) — hoje não existe nenhuma tela pra ver UM anúncio isolado (só o feed da Home). Nova rota `dataRoutes.publicationDetail`, recebe `{ publicationId }`, busca o doc em `shrimpPonds`, renderiza com o `CardPublicationShrimp` já existente (reuso direto — o componente já aceita um `item`). Se `sold: true`, banner "Este camarão foi vendido" no topo + `FlatList` de outras publicações ativas disponíveis (reusa `getAllPublications`/query existente do feed, limitado a poucas). Se o doc não existir, tela de erro simples.

**B. Deep link via esquema customizado** (funciona hoje, sem domínio): `querocamarao://publicacao/{id}` — registrado em `src/routes/dataRoutes.js` (`linking.config.screens`) apontando pra `publicationDetail` com `path: "publicacao/:publicationId"`. Funciona quando o app já está instalado e o link é tocado a partir de contextos que reconhecem esquemas customizados (ex: WhatsApp reconhece `scheme://`); não abre automaticamente feed algum quando o app NÃO está instalado (essa parte é exatamente o que depende do bloqueio acima).

**C. Mensagem de compartilhamento no formato pedido** — `src/components/CardPublicationShrimp/ShareNative/index.js` reescrito:
```
🍤 Camarão disponível no Quero Camarão!

📍 {location}
🍤 Gramatura: {grammage} g (por item, um bloco por gramatura se houver mais de uma)
📦 Quantidade: {kilo} kg
🌊 Viveiros: {ponds}

Veja os detalhes e fale com o produtor:
querocamarao://publicacao/{id}
```
(o link vira `https://{DOMINIO}/camarao/{id}` automaticamente assim que o domínio existir — decisão isolada em uma constante `PUBLICATION_SHARE_BASE_URL` no topo do arquivo, hoje resolvendo pro esquema customizado).

## O que FICA pendente (aguardando domínio)
- Página web de landing (fora deste repo — precisa de um projeto web).
- `.well-known/apple-app-site-association` + `assetlinks.json` hospedados no domínio.
- `associatedDomains` (app.json plugin `expo-build-properties`/config nativo) + `intentFilters` Android.
- Troca de `PUBLICATION_SHARE_BASE_URL` pro domínio real.
- Firebase Hosting é a opção natural (o projeto já usa Firebase) — mas depende do usuário decidir/confirmar o domínio.

## Testing
Sem util puro isolável nesta fase (é composição de tela + navegação + deep link). Manual: abrir `querocamarao://publicacao/{id}` com o app instalado (via `xcrun simctl openurl` / `adb shell am start`) navega pro anúncio certo; compartilhar gera a mensagem no formato certo; anúncio vendido mostra aviso + outros disponíveis.
