# Spec — Splash Screen Animada (fix rodapé + animação de carregamento)

**Data:** 2026-08-24  
**Arquivo principal:** `src/pages/SplashScreen/index.jsx`  
**Status:** Implementado no working tree, aguardando verificação

---

## Contexto

A splash screen customizada (`SplashScreen`) exibia a imagem monolítica `splash.png` com `resizeMode:'cover'` e `marginTop:-30`, causando corte do texto "Distribuído por... Corretora Quero Camarão" no rodapé — especialmente em iPhones com home indicator maior ou Dynamic Island. Além disso, a tela era estática (2000ms fixos de setTimeout antes de checar autenticação).

---

## Problemas tratados

### Problema 1 — Corte no rodapé

**Causa raiz:** `resizeMode:'cover'` expande a imagem para preencher a tela inteira, cortando o conteúdo das bordas. O `marginTop:-30` tentava esconder a barra de status mas agravava o corte inferior.

**Solução adotada:** Desacoplar logo e texto de rodapé da imagem monolítica.
- Logo: `originalLogo.png` com `resizeMode="contain"`, dimensões fixas responsivas (`width: "75%", height: 160`)
- Rodapé: `Animated.Text` posicionado com `useSafeAreaInsets` → `bottom: insets.bottom + 16`
- Background: `#FFE2CC` (mesma cor do splash nativo em `app.json`)

### Problema 2 — Animação de carregamento

**Solução adotada:**
- Logo: fade-in (duration 700ms) + scale-in via `Animated.spring` (de 0.88 → 1, tension 60, friction 8)
- Barra de progresso indeterminada: `Animated.loop` com `translateX` oscilando de `-BAR_W` a `TRACK_W` (ciclo de 900ms)
- Navegação: `Promise.all([minWait(1500ms), GetUserStorage()])` — navega assim que ambos resolvem, sem timeout fixo

---

## Escopo

**Entra:**
- Refatoração de `SplashScreen/index.jsx` (concluída no working tree)
- Separação logo/rodapé da imagem monolítica
- Animação de entrada do logo e barra de carregamento indeterminada
- Navegação baseada em corrida entre animação mínima e check de autenticação

**Não entra:**
- Alteração do splash nativo (`app.json`, `./assets/splash.png`)
- Mudança de rota de navegação ou lógica de autenticação
- Novos assets gráficos (usa `originalLogo.png` existente)

---

## Critérios de aceite

1. Texto "Distribuído por / Corretora Quero Camarão" visível sem corte em todos os tamanhos de tela, incluindo iPhone com Dynamic Island e Android compacto
2. Logo aparece com fade-in + leve scale-in ao montar a tela
3. Barra de progresso animada visível enquanto o app inicializa
4. Navegação ocorre assim que `GetUserStorage` resolve E o mínimo de 1500ms de animação passou
5. Background `#FFE2CC` corresponde ao splash nativo
6. Nenhuma referência a `splash.png` ou `SplashImage` permanece em `src/`

---

## Estado do working tree (2026-08-24)

Implementação completa aplicada. Critérios 4, 5 e 6 já verificados por leitura de código.

**Pendências de verificação (próxima fase):**
- `originalLogo.png` tem apenas a variante 1x (222×119px). Sem `@2x`/`@3x`. Pode aparecer pixelado em telas de alta densidade (Retina/3x). Avaliar se a qualidade atual é aceitável ou se asset precisa ser re-exportado.
- Confirmar que o texto do rodapé ("Distribuído por\nCorretora Quero Camarão") reproduz exatamente o que estava gravado em `splash.png` — validação visual necessária (requer device ou simulador).
- Testar em pelo menos dois tamanhos: iPhone com Dynamic Island (insets grandes) e Android ou iPhone SE (insets pequenos/nulos).
