# Gestão — Modal "Informe o código do sorteio": visual + animação

**Data:** 2026-08-22  
**Automação:** quero-camarao-1787395500390  
**Spec técnica detalhada:** `docs/specs/spec-modal-sorteio-visual-animacao.md`  
**Arquivos alvo:** `src/pages/DrawerPrizeLiveClient/index.jsx` e `styles.js`  
**Status:** pronto para implementação

---

## Escopo

Dois problemas independentes na tela do cliente/participante (`DrawerPrizeLiveClient`), entregues juntos.

### Problema 1 — Modal colada nas bordas

**Causa raiz confirmada em código:**
- `ModalContent` em `styles.js:170` é `SafeAreaView` com `width: 100%` e arredondamento só no topo (`border-top-left-radius/border-top-right-radius`)
- `contentContainerStyle` da `<Modal>` em `index.jsx:290-295` usa `justifyContent: flex-end` + `alignItems: center`, mas o `ModalContent` full-width sobrepõe o align

**Decisão:** manter paradigma de bottom sheet, mas como card flutuante com margem lateral. Não redesenhar como modal central (evita mudança de paradigma de UX).

**Mudanças mínimas em `styles.js`:**
1. `ModalContent`: trocar `SafeAreaView` → `View`, remover `width: 100%`, adicionar `marginHorizontal: 16`, trocar `border-top-*-radius` → `borderRadius: 24` (4 cantos)
2. Adicionar `marginBottom: 16` para flutuar acima da safe area

### Problema 2 — Sem animação de confirmação

**Causa raiz:** `handleParticipateDrawPriseLive` em sucesso apenas chama `Toast.show` + `setDialogInputVisible(false)`.

**Decisão:** estado de sucesso animado dentro da modal usando `Animated` do React Native (já instalado), sem lib nova.

**Sequência de animação (timing total: ~800ms):**
```
0ms    → trocar ícone gift→check-circle, badge laranja→verde, título/subtítulo→confirmação
0ms    → iniciar scale bounce: 1.0→1.3 (200ms) → 1.0 (150ms)
350ms  → aguardar no estado de sucesso visível
800ms  → fechar modal + emitir Toast existente
```

**Estado de sucesso — props visuais:**
- Ícone: `check-circle` (Feather)
- Cor badge: `#27ae60` (verde — já usado em `ContentTitleParticipating`)
- Título: `"Você está participando!"`
- Subtítulo: `"Boa sorte no sorteio!"`

**Sem animação em erro** — comportamento atual mantido para todos os casos de erro.

---

## Passos de implementação para dev-frontend-mobile

1. **`styles.js`** — Ajustar `ModalContent`:
   - Trocar `styled.SafeAreaView` → `styled.View`
   - Substituir `width: 100%` + `border-top-*-radius` → `margin-horizontal: 16px` + `border-radius: 24px`
   - Adicionar `margin-bottom: 16px`
   - Adicionar prop `success` ao `ModalIconBadge` para cor de fundo dinâmica (laranja → verde)

2. **`index.jsx`** — Adicionar estado de sucesso e animação:
   - Importar `Animated` do `react-native`
   - Adicionar `useState` `participationSuccess` (bool, false inicial)
   - Adicionar `useRef` `scaleAnim = new Animated.Value(1)`
   - Criar função `playSuccessAnimation()` com `Animated.sequence`
   - Em `handleParticipateDrawPriseLive` (linha 136), substituir `setDialogInputVisible(false)` por: setar `participationSuccess(true)` + chamar `playSuccessAnimation()` + após 800ms fechar modal e emitir Toast
   - Na renderização da modal: usar `participationSuccess` para trocar ícone, cor do badge e textos
   - Limpar `participationSuccess` ao fechar modal (`onDismiss`)

3. **Testes** — Utilitário de timing de animação é opcional. Se extraído para `src/utils/confirmationAnimationSequence.js`, seguir padrão CJS de `drawAnimationSequence.js` com teste `node --test`.

---

## Critérios de aceite

### Visual (Problema 1)
- [ ] Modal exibe com margem lateral visível em iOS e Android
- [ ] Cantos arredondados nos 4 lados — sem cantos retos nas laterais
- [ ] `ModalHandle`, `ModalIconBadge` e demais elementos internos permanecem sem layout quebrado
- [ ] Card não toca as bordas laterais da tela

### Animação (Problema 2)
- [ ] Em sucesso: ícone muda de `gift` → `check-circle` com cor badge verde
- [ ] Scale bounce visível (presente crescendo além de 1 e voltando)
- [ ] Modal fecha ~800ms após sucesso
- [ ] Toast de sucesso continua aparecendo após fechamento
- [ ] Em erro: zero animação, Toast de erro como hoje

### Regressão
- [ ] Botão Cancelar ainda fecha modal corretamente
- [ ] Input limpo ao reabrir modal
- [ ] Lista de sorteios recarrega após participação bem-sucedida
