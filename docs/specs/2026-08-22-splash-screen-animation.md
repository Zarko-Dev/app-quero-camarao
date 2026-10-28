# Spec: Splash customizada — corrigir corte de rodapé + animação de carregamento

**Task:** `quero-camarao-1787395327162`
**Data:** 2026-08-22
**Arquivo principal:** `src/pages/SplashScreen/index.jsx`

---

## Contexto

O app tem duas splashs:
- **Splash nativa** — `./assets/splash.png` + `app.json` (`resizeMode: contain`, `backgroundColor: #FFE2CC`). Funciona corretamente.
- **Splash customizada** — `src/pages/SplashScreen/index.jsx`, exibida pelo React Navigation logo após a splash nativa. É aqui que estão os dois problemas.

---

## Problema 1 — Corte no rodapé

### Causa raiz confirmada em código

`SplashScreen/index.jsx` renderiza `SplashImage` (o arquivo `src/assets/images/splash.png`, que contém o texto "Distribuído por Corretora Quero Camarão" desenhado dentro do bitmap) com:
- `resizeMode: "cover"` — a imagem é redimensionada para cobrir 100% da tela, cortando bordas (topo/rodapé) quando o aspect ratio da imagem não bate com o dispositivo.
- `marginTop: -30` — empurra a imagem 30px para cima, cortando ainda mais o rodapé.

O `marginTop: -30` foi provavelmente uma tentativa de esconder um artefato visual no topo (status bar ou safe area). Com a abordagem de redesign abaixo (Problema 2), o topo é controlado por `SafeAreaView` e esse hack deixa de ser necessário.

### Decisão

Este problema é resolvido como consequência do Problema 2: a tela passa a ser um layout React com elementos separados (logo + barra + texto), eliminando a imagem monolítica `cover`. O `marginTop: -30` é removido. O fundo da tela é `#FFE2CC` (igual à splash nativa — evita flicker de troca de cor entre as duas splashs).

---

## Problema 2 — Animação de carregamento

### Estado atual

```js
// SplashScreen/index.jsx
useEffect(() => {
  const timer = setTimeout(checkAuth, 2000); // espera fixa de 2s
  return () => clearTimeout(timer);
}, []);
```

### Redesign da tela

A splash customizada passa a ser um layout React com fundo `#FFE2CC`, sem imagem monolítica. Elementos:

1. **Logo** — `src/assets/images/logo.png` (logo sem texto). Montado com fade-in + scale-in leve.
2. **Barra de progresso indeterminada** — abaixo do logo, animada em loop enquanto aguarda.
3. **Texto de rodapé** — "Distribuído por\nCorretora Quero Camarão" como `<Text>`, fixado na parte inferior da tela via `position: absolute` ou `justifyContent: space-between`.

### Animação do logo

- `Animated` API nativa (sem lib extra — `react-native-reanimated` é opção válida se o dev preferir, já instalado).
- `opacity: 0 → 1` em 600ms, `scale: 0.92 → 1.0` em 600ms, easing `easeOut`.
- `useNativeDriver: true`.

### Barra de progresso

- Bar horizontal de largura fixa (ex: 200px), cor `#FF6B2C` (laranja brand).
- Animação de "loading indeterminada" implementada com `Animated.loop` + `Animated.timing` em `translateX`:
  - Um bloco interno (30% da largura total) desliza da esquerda para a direita continuamente.
  - `useNativeDriver: true`.
- Sem lib extra (sem `react-native-progress`, sem `NativeAnimations` de terceiros).
- A barra fica animando em loop até a navegação ocorrer.

### Lógica de navegação (substituição do setTimeout fixo)

```
navegar quando:
  MAX(checkAuth resolver, 1200ms desde o mount)
```

- `checkAuth` roda imediatamente ao montar (sem delay).
- Timer mínimo de 1200ms garante que a animação de entrada seja perceptível mesmo em dispositivos rápidos.
- Se `checkAuth` demorar mais que 1200ms (ex: cold start lento do Firestore), a navegação espera — a barra animada continua visível.
- Se `checkAuth` resolver antes de 1200ms, navega exatamente aos 1200ms.
- Implementação sugerida: `Promise.all([checkAuth(), minDelay(1200)])`.

### Fundo da tela

`backgroundColor: "#FFE2CC"` em toda a tela (igual à splash nativa) — elimina o flicker de cor durante a transição entre as duas splashs.

---

## Escopo (o que entra)

- Reescrita de `src/pages/SplashScreen/index.jsx` — único arquivo de tela a tocar.
- Criação de `src/pages/SplashScreen/styles.js` se conveniente (o arquivo atual não tem).
- Imagem usada: `src/assets/images/logo.png` (logo sem texto) — confirmar que existe antes de codar; se não existir, usar `src/assets/images/originalLogo.png` como fallback.
- Texto "Distribuído por\nCorretora Quero Camarão" como componente `<Text>` — fonte e cor a critério do dev, mantendo legibilidade sobre fundo `#FFE2CC`.

## Fora de escopo

- Splash nativa (`./assets/splash.png`, `app.json`) — não tocar.
- Bitmap `src/assets/images/splash.png` — não é mais renderizado nesta tela, mas não precisa ser deletado.
- Firestore / auth flow pós-navegação — não tocar.
- Sons.
- Nova dependência nativa.

---

## Critérios de aceite

1. **Sem corte de rodapé** — texto "Distribuído por..." visível e sem clipar em:
   - iPhone SE (tela 4,7", sem notch)
   - iPhone 14 / 14 Pro (notch / Dynamic Island)
   - Android com home indicator virtual (ex: Pixel)
2. **Fade-in** — logo aparece com transição de opacidade (não "pisca" na tela) em ~600ms.
3. **Scale-in** — logo cresce levemente de ~0.92 para 1.0 junto com o fade.
4. **Barra animada** — visível e em loop contínuo durante todo o tempo de espera.
5. **Navegação correta** — ocorre para `login` ou `navigation` dependendo do resultado de `GetUserStorage`, igual ao comportamento atual.
6. **Tempo mínimo** — mesmo que `GetUserStorage` resolva instantaneamente, a tela permanece visível por pelo menos 1200ms.
7. **Sem flickering de cor** — fundo `#FFE2CC` desde o primeiro frame da splash customizada (igual à splash nativa).
8. **Sem nova dependência** — `package.json` não recebe lib nova.

---

## Arquivos a tocar

| Arquivo | Ação |
|---|---|
| `src/pages/SplashScreen/index.jsx` | Reescrita completa |
| `src/pages/SplashScreen/styles.js` | Criar (se o dev preferir styled-components, seguindo padrão do projeto) |

---

## Suposições registradas

- `src/assets/images/logo.png` existe (listado em `ls src/assets/images/`). É o logo sem o texto do rodapé. Se o dev constatar que ele tem texto embutido também, usar `originalLogo.png`.
- O texto exato do rodapé é "Distribuído por\nCorretora Quero Camarão" — baseado na descrição de Pedro. Dev confirma olhando `splash.png` original se necessário.
- Cor laranja da barra: `#FF6B2C` — aproximada da brand color do app. Dev ajusta para a constante de tema correta (`theme.colors.*`).
- 1200ms como tempo mínimo de exibição é conservador e suficiente para a animação de entrada ser concluída. Dev pode ajustar entre 1000ms–1500ms com base no teste visual.
