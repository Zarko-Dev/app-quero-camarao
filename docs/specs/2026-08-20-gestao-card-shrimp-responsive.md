# Spec Gestão — Layout Responsivo: CardPublicationShrimp e CardMyPublicationsShrimp

**Data:** 2026-08-20  
**Fase:** Gestão  
**PRD de referência:** `docs/specs/card-publication-shrimp-responsive-layout.md`  
**Status:** Pronto para dev

---

## Gap encontrado vs. PRD

O PRD (`card-publication-shrimp-responsive-layout.md`) prescreve apenas substituir `aspect-ratio`/`height` por `align-self: stretch` em `ContentImageShrimp`. Para `CardPublicationShrimp` isso é suficiente.

Para `CardMyPublicationsShrimp` **não é suficiente**: além do `ContentImageShrimp`, há dois outros nós com altura fixa que vão continuar clipando conteúdo com 3+ viveiros:

| Nó | Altura atual | Efeito |
|---|---|---|
| `Container` | `componentSize(155)` fixo | Card inteiro nunca cresce além de 155px |
| `ContainerShrimp` | `componentSize(77)` fixo | Lista de gramaturas é truncada/clipada |
| `ContentExpired` | `componentSize(155)` fixo | Overlay absoluto não cobre card se Container crescer |

Essas três remoções também são necessárias para o fix completo.

---

## Solução completa (ambos os cards)

### CardPublicationShrimp — `src/components/CardPublicationShrimp/styles.js`

Única mudança: `ContentImageShrimp`

```diff
 export const ContentImageShrimp = styled.TouchableOpacity`
     width: 45%;
-    aspect-ratio: 1.1;
+    align-self: stretch;
     border-radius: 15px;
     overflow: hidden;
 `;
```

---

### CardMyPublicationsShrimp — `src/pages/MyPublications/components/CardMyPublicationsShrimp/styles.js`

**1. Container — remover height fixo:**

```diff
 export const Container = styled.View`
     width: 100%;
-    height: ${({ theme }) => theme.size.componentSize(155)};
     margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
     margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
     border-radius: 4px;
     background-color: ${({ theme }) => theme.colors.tertiary};
     elevation: 3;
 `;
```

**2. ContentExpired — substituir height por posicionamento absoluto cobrindo o pai:**

```diff
 export const ContentExpired = styled.View`
     width: 100%;
-    height: ${({ theme }) => theme.size.componentSize(155)};
     position: absolute;
+    top: 0;
+    left: 0;
+    right: 0;
+    bottom: 0;
     border-radius: 4px;
     background-color: ${({ theme }) => theme.colors.black};
     opacity: 0.3;
 `;
```

**3. ContainerShrimp — remover height fixo:**

```diff
 export const ContainerShrimp = styled.View`
-    height: ${({ theme }) => theme.size.componentSize(77)};
     justify-content: center;
     align-items: center;
     flex-direction: row;
     flex-wrap: wrap;
     padding: 5px 0;
     padding-top: ${({ shrimpDimentions, theme }) => { ... }};
 `;
```

**4. ContentImageShrimp — substituir height fixo por align-self: stretch:**

```diff
 export const ContentImageShrimp = styled.TouchableOpacity`
     width: 30.5%;
-    height: ${({ theme }) => theme.size.componentSize(125)};
+    align-self: stretch;
 `;
```

Nenhum `index.jsx` precisa ser alterado.

---

## Critérios de aceite verificáveis

### CA-1 — CardPublicationShrimp (tela Home)

- [ ] **1 viveiro:** card renderiza com aparência idêntica ao estado atual (nenhuma regressão visual).
- [ ] **3 viveiros:** imagem e lista de gramaturas ficam com a mesma altura; nenhuma parte da lista é cortada.
- [ ] **5 viveiros:** imagem se estica cobrindo toda a coluna direita; card fica mais alto que o de 1 viveiro, porém proporcional.
- [ ] A imagem renderiza sem distorção (resizeMode: cover — crop, não stretch).
- [ ] Carousel iOS com múltiplas fotos não apresenta overflow nem clip.

### CA-2 — CardMyPublicationsShrimp (tela Minhas Publicações)

- [ ] **1 viveiro:** card mantém aparência similar ao atual.
- [ ] **3 viveiros:** card cresce verticalmente; todas as linhas de gramatura são visíveis.
- [ ] **5 viveiros:** nenhuma linha de gramatura é clipada.
- [ ] Publicação expirada: overlay `ContentExpired` cobre o card inteiro independente da altura.
- [ ] Timer regressivo (`RegressivePublicationShrimpTimer`) e botões "Informar Venda"/"Editar Venda" continuam visíveis e funcionais.

### CA-3 — Sem regressão funcional

- [ ] Tap na imagem abre `ModalShrimpImages`.
- [ ] Menu de 3 pontos (editar, estender, excluir) funciona normalmente.
- [ ] Nenhum dado do Firestore foi modificado durante os testes.

---

## Arquivos a modificar

| Arquivo | Mudanças |
|---|---|
| `src/components/CardPublicationShrimp/styles.js` | `ContentImageShrimp`: remove `aspect-ratio: 1.1`, adiciona `align-self: stretch` |
| `src/pages/MyPublications/components/CardMyPublicationsShrimp/styles.js` | `Container`: remove `height`; `ContentExpired`: substitui `height` por `top/left/right/bottom: 0`; `ContainerShrimp`: remove `height`; `ContentImageShrimp`: substitui `height` por `align-self: stretch` |

---

## Suposições

- `ImageComponent` usa `resizeMode: cover` por padrão (base no comportamento observado no vídeo sem distorção).
- O switch de `padding-top` / `font-size` em `ContainerShrimp` e `TextShrimp` pode ser mantido — sem `height` fixo, deixa de ser obrigatório mas não causa dano.
- Card de `CardMyPublicationsShrimp` pode ficar levemente mais alto que o atual para 1 viveiro. Aceitável.
