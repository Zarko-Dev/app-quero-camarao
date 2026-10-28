# PRD — CardPublicationShrimp: Layout Responsivo com Múltiplos Viveiros

**Data:** 2026-08-19
**Autor:** produto-pm (Zarko Automation)
**Status:** Pronto para implementação

---

## Contexto

O app Quero Camarão exibe anúncios de camarão em cards na tela Home (listagem pública) e na tela Minhas Publicações. Cada anúncio pode ter 1 ou mais viveiros, cada um com gramatura e quantidade em kg.

## Problema

O layout do card usa `flex-direction: row` com duas colunas: imagem (esquerda) e lista de gramaturas (direita). A imagem tem tamanho fixo; a lista cresce com o número de viveiros.

- **CardPublicationShrimp** (`src/components/CardPublicationShrimp/`):  
  `ContentImageShrimp` tem `width: 45%` + `aspect-ratio: 1.1` — altura derivada apenas da largura, independente do conteúdo da coluna direita.

- **CardMyPublicationsShrimp** (`src/pages/MyPublications/components/CardMyPublicationsShrimp/`):  
  `ContentImageShrimp` tem `width: 30.5%` + `height: theme.size.componentSize(125)` — altura fixa absoluta.

Com 1 viveiro: as duas colunas ficam com alturas similares → proporcional.  
Com 3+ viveiros: coluna de texto cresce, imagem fica "flutuando" pequena no topo → card quebrado visualmente.

## Objetivo

Corrigir o layout dos dois cards para que a coluna da imagem sempre acompanhe a altura da coluna de gramaturas, independente do número de viveiros.

## Escopo

**Entra:**
- Ajuste de estilo em `ContentImageShrimp` nos dois componentes (remoção de `aspect-ratio` / altura fixa, adição de `align-self: stretch`)
- A imagem interna (`ShrimpImage`) já tem `width: 100%; height: 100%` nos dois — não precisa mudar
- Carousel em `CardMyPublicationsShrimp` também usa `ShrimpImage` internamente — beneficia automaticamente

**Não entra:**
- Redesenho visual do card (cores, tipografia, espaçamentos)
- Scroll interno na lista de gramaturas
- Layout alternativo (vertical) para muitos viveiros
- Nenhuma alteração em dados do Firestore

## Solução Decidida

**Opção: imagem estica para preencher a altura da linha (`align-self: stretch`).**

Motivo: é a correção mais simples, sem risco de regressão. A linha pai (`ContainerInfo`) já é um flex-row sem altura fixa — basta o container da imagem pedir para esticar.

### CardPublicationShrimp — `styles.js`

```diff
 export const ContentImageShrimp = styled.TouchableOpacity`
     width: 45%;
-    aspect-ratio: 1.1;
+    align-self: stretch;
     border-radius: 15px;
     overflow: hidden;
 `;
```

### CardMyPublicationsShrimp — `styles.js`

```diff
 export const ContentImageShrimp = styled.TouchableOpacity`
     width: 30.5%;
-    height: ${({ theme }) => theme.size.componentSize(125)};
+    align-self: stretch;
     border-radius: ...;
     overflow: hidden;
 `;
```

(Preservar os demais atributos de borda/overflow que já existirem na regra.)

## Critérios de Aceite

1. Card com 1 viveiro: layout visual idêntico ao atual (regressão zero).
2. Card com 3 viveiros: imagem e lista de gramaturas com a mesma altura na linha.
3. Card com 5+ viveiros: imagem estica proporcionalmente, sem overflow nem corte.
4. Funciona nos dois cards: Home (`CardPublicationShrimp`) e Minhas Publicações (`CardMyPublicationsShrimp`).
5. Nenhum dado do Firestore é alterado.

## Casos de Borda

- Anúncio sem imagem (uri null/vazio): `ShrimpImage` já trata placeholder internamente — sem impacto.
- Carousel com múltiplas imagens (`CardMyPublicationsShrimp`): o Carousel preenche `100% x 100%` do container — vai acompanhar automaticamente.
- Telas com densidades diferentes (iPhone SE vs iPad): `align-self: stretch` é agnóstico ao tamanho de tela.

## Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `src/components/CardPublicationShrimp/styles.js` | Remove `aspect-ratio: 1.1`, adiciona `align-self: stretch` em `ContentImageShrimp` |
| `src/pages/MyPublications/components/CardMyPublicationsShrimp/styles.js` | Remove `height: theme.size.componentSize(125)`, adiciona `align-self: stretch` em `ContentImageShrimp` |

## Fora de Escopo (Confirmado)

- Não há referência visual de Pedro — decisão de layout cabe ao dev.
- Não tocar dados reais do Firestore.
- Não alterar comportamento funcional (navegação, chat, WhatsApp, compartilhamento).
