# Spec — Modal "Informe o código do sorteio": visual e animação de confirmação

**Origem:** Pedido de Pedro (2026-08-24)  
**Tela:** `src/pages/DrawerPrizeLiveClient/index.jsx` + `styles.js`  
**App em produção — sem toque em dados Firestore.**

---

## Contexto

A tela do participante/cliente no sorteio ao vivo exibe um botão "Participar do sorteio ao vivo"
que abre uma modal para o usuário digitar o código do sorteio. Pedro reportou dois problemas:
(1) a modal fica feia, esticada de borda a borda; (2) após confirmar participação com sucesso, não há
nenhuma animação — apenas fecha e exibe um Toast genérico.

---

## Problema 1 — Visual da modal (bottom sheet colado nas bordas)

**Estado indesejado:** modal ocupa largura total da tela, arredondamento apenas no topo, sem margem
lateral — aparência de bottom sheet nativo full-bleed.

**Causa raiz original:** `ModalContent` com `border-top-left-radius`/`border-top-right-radius` sem
`border-radius` completo, e SafeAreaView full-width.

**Estado atual do código (implementado, aguardando QA):**  
`ModalContent` em `styles.js` (linha 170) tem `width: 90%`, `border-radius: 24px` e
`margin-bottom: 24px`. O `contentContainerStyle` do `<Modal>` usa `flex: 1, justifyContent: "flex-end",
alignItems: "center"` — produz card flutuante alinhado à base.

**O que o QA deve verificar:**
- Largura máxima de 90% da tela, centrado horizontalmente.
- `border-radius: 24px` em todos os 4 cantos (nenhum canto reto visível).
- Margem inferior visível entre o card e a base da tela (≥ 24px acima da safe area).
- Padding interno mínimo de 20px lateral e 32px inferior.
- Fundo escurecido/overlay atrás da modal (comportamento padrão do react-native-paper Modal).
- Se o `flex: 1` no `contentContainerStyle` estiver causando ocupação total da altura sem renderizar
  corretamente, substituir por `{ justifyContent: "flex-end", alignItems: "center" }` sem flex.

**Elementos que devem permanecer:** `ModalHandle`, `ModalIconBadge` (ícone presente/check), título,
subtítulo, `Input` de código, botões Cancelar e Participar.

**Abordagem escolhida:** manter bottom sheet com card flutuante (opção a do briefing) — sem redesenho
para modal central, pois a estrutura atual já está encaminhada nessa direção.

---

## Problema 2 — Animação de confirmação de participação

**Estado indesejado:** ao confirmar participação com sucesso, a modal fecha imediatamente e só aparece
um Toast genérico — sem feedback visual animado.

**Estado atual do código (implementado, aguardando QA):**  
`index.jsx` contém:
- `showSuccess` state (linha 57)
- `scaleAnim` via `Animated.Value(1)` (linha 58)
- `triggerSuccessAnimation()` — `Animated.spring` com `friction: 3, tension: 150` (linhas 105–113)
- Fluxo de sucesso: `setShowSuccess(true)` + `triggerSuccessAnimation()` imediatamente após
  `setParticipantDrawPrizeLive` com sucesso (linhas 150–151)
- `setTimeout(1800ms)` para fechar modal, resetar estado e exibir Toast (linhas 157–166)
- `ModalIconBadge` recebe `success={showSuccess}` — altera background para verde (`#27ae60`) (styles.js linha 196–197)
- Feather icon alterna entre `"gift"` (laranja, estado normal) e `"check-circle"` (branco, estado sucesso) (index.jsx linhas 331–344)
- Conteúdo do modal no estado sucesso: título "Você está participando!" e subtítulo "Boa sorte no sorteio 🎉" (linhas 346–365)
- Botões (Cancelar / Participar) são ocultados no estado sucesso (renderização condicional, linha 346)

**O que o QA deve verificar:**
- Confirmar que `scaleAnim` inicia em `1` em repouso e vai a `0` → spring back para `1` no trigger
  (a chamada `scaleAnim.setValue(0)` antes do spring garante o efeito de "pop in"). Verificar se o
  `useNativeDriver: true` é compatível com o contexto (deve ser).
- A `Animated.View` que envolve `ModalIconBadge` usa `transform: [{ scale: scaleAnim }]` — confirmar
  que o wrapping está correto no JSX (linha 325).
- O `ModalIconBadge` com `success` prop deve mostrar o check verde com bounce ao confirmar.
- Toast de sucesso ainda deve disparar após fechar a modal (mantido em `setTimeout`).
- Comportamento de erro (código inválido, sorteio não encontrado) permanece sem animação — apenas Toast.

**Fora de escopo:**
- Nenhuma biblioteca nova de animação (sem Lottie, sem react-native-animatable).
- Nenhuma animação nos estados de erro.
- Nenhuma alteração na lógica de Firestore/dados.

---

## Critérios de aceite

**Modal visual:**
- [ ] Abrir modal: card aparece com margens laterais visíveis em qualquer tela (não full-bleed).
- [ ] Todos os 4 cantos da modal são arredondados.
- [ ] Card tem espaço visível abaixo (não cola na base da tela em nenhum device iOS/Android).

**Animação de confirmação:**
- [ ] Ao confirmar código válido: ícone de presente morphs para check-circle com bounce/scale spring.
- [ ] Badge fica verde durante a animação de sucesso.
- [ ] Texto muda para "Você está participando! / Boa sorte no sorteio 🎉".
- [ ] Botões Cancelar e Participar ficam ocultos durante o estado sucesso.
- [ ] Modal fecha automaticamente após ~1800ms.
- [ ] Toast de sucesso dispara após o fechamento da modal.
- [ ] Erros (código inválido, não encontrado) não mostram animação — só Toast.

---

## Cobertura de teste

Se qualquer lógica pura nova for extraída (ex: utilitário de sequência de animação), cobrir com
`node --test` seguindo o padrão de `tests/drawAnimationSequence.test.cjs`.

A lógica de `triggerSuccessAnimation` em si não é pura (Animated API), então não requer teste unitário
separado — a validação é visual/manual.
