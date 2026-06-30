# Patrocinador Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar o papel `"Patrocinador"` — acesso igual ao usuário normal + pode criar/gerenciar sorteios ao vivo. Não tem acesso ao painel Admin completo.

**Architecture:** O sistema de roles usa `user.rules: string[]` no Firestore (ex: `["Normal"]`, `["Admin"]`). Em `DrawerPrizeLiveClient`, o check `rules.includes("Admin")` decide se mostra controles de criação. Para Patrocinador: adicionar check `rules.includes("Patrocinador")` → mostrar botão "Gerenciar Sorteio ao Vivo" que navega para `dataRoutes.admin.drawPrizeLive`. Esta rota já existe no stack raiz (`src/routes/index.jsx`), então qualquer tela pode navegar para ela diretamente. O menu drawer não precisa de nova entrada — o Patrocinador acessa via `DrawerPrizeLiveClient` (que já está no menu para todos os usuários autenticados).

**Tech Stack:** React Native, Redux, Firestore

---

## File Map

- Modify: `src/pages/DrawerPrizeLiveClient/index.jsx`
- Modify: `src/pages/DrawerPrizeLiveClient/styles.js`

---

### Task 1: Detectar role Patrocinador e mostrar botão de gerenciar sorteio

**Contexto:** Em `DrawerPrizeLiveClient`, na função `handleGetInitialData`:
```js
const isAdmin = rules.includes("Admin");
```
Esta variável determina se o usuário pode criar/deletar sorteios. Patrocinador deve poder CRIAR sorteios ao vivo, mas não deletar nem acessar o painel admin completo.

**Files:**
- Modify: `src/pages/DrawerPrizeLiveClient/index.jsx`
- Modify: `src/pages/DrawerPrizeLiveClient/styles.js`

- [ ] **Step 1: Verificar os styled-components disponíveis em styles.js**

Abrir `src/pages/DrawerPrizeLiveClient/styles.js` e confirmar se existe `ButtonDeleteDrawPrizeLive` e `TitleButtonDeleteDrawPrizeLive`. Estes são usados para a área de admin. Vamos adicionar um novo botão para Patrocinador.

- [ ] **Step 2: Adicionar styled-components para o botão de Patrocinador**

Em `src/pages/DrawerPrizeLiveClient/styles.js`, adicionar ao final:

```js
export const ButtonManageLiveDraw = styled.TouchableOpacity`
    width: 90%;
    height: 48px;
    border-radius: 8px;
    background-color: #f55b1f;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
    elevation: 2;
`;

export const TextButtonManageLiveDraw = styled(Text)`
    font-size: 15px;
    font-weight: 700;
    color: #fff;
`;
```

- [ ] **Step 3: Adicionar `isPatrocinador` à lógica de `handleGetInitialData`**

Em `src/pages/DrawerPrizeLiveClient/index.jsx`, localizar `handleGetInitialData`:

```js
const rules = Array.isArray(user?.rules) ? user.rules : [];
const isAdmin = rules.includes("Admin");
```

Substituir por:

```js
const rules = Array.isArray(user?.rules) ? user.rules : [];
const isAdmin = rules.includes("Admin");
const isPatrocinador = rules.includes("Patrocinador");
```

- [ ] **Step 4: Adicionar `isPatrocinador` ao state**

Logo após a declaração dos estados no topo do componente (`useState` calls), adicionar:

```js
const [isPatrocinador, setIsPatrocinador] = useState(false);
```

- [ ] **Step 5: Persistir `isPatrocinador` no state dentro de `handleGetInitialData`**

Dentro de `handleGetInitialData`, logo após a linha que define `isPatrocinador` (calculada localmente), adicionar:

```js
setIsPatrocinador(isPatrocinador);
```

- [ ] **Step 6: Adicionar import dos novos styled-components no DrawerPrizeLiveClient**

Em `src/pages/DrawerPrizeLiveClient/index.jsx`, adicionar ao bloco de imports dos styled-components:

```js
import {
    // ... todos os existentes ...
    ButtonManageLiveDraw,
    TextButtonManageLiveDraw,
} from "./styles";
```

- [ ] **Step 7: Adicionar o botão "Gerenciar Sorteio ao Vivo" no render**

No return do componente, localizar a parte onde `userRules?.includes("Admin")` decide mostrar botões de admin. Adicionar ANTES do FlatList de sorteios, logo após o container principal:

```js
{isPatrocinador && !userRules?.includes("Admin") && (
    <ButtonManageLiveDraw
        onPress={() => navigation.navigate(dataRoutes.admin.drawPrizeLive)}
    >
        <TextButtonManageLiveDraw>
            Gerenciar Sorteio ao Vivo
        </TextButtonManageLiveDraw>
    </ButtonManageLiveDraw>
)}
```

Nota: `!userRules?.includes("Admin")` evita renderizar duplicado para admins que também tenham a role Patrocinador.

- [ ] **Step 8: Confirmar que `dataRoutes` está importado**

```js
import { dataRoutes } from "../../routes/dataRoutes";
```

Já deve estar importado — confirmar que `dataRoutes.admin.drawPrizeLive` existe (está em `src/routes/dataRoutes.js` linha 62).

- [ ] **Step 9: Testar com usuário Patrocinador**

Para testar manualmente:
1. No Firebase Console → Firestore → `users` collection, encontrar um usuário de teste
2. Editar o campo `rules` de `["Normal"]` para `["Patrocinador"]`
3. Fazer login no app com este usuário
4. Navegar para "Sorteio ao Vivo" no drawer
5. Confirmar que o botão "Gerenciar Sorteio ao Vivo" aparece
6. Clicar e confirmar que navega para a tela de criação de sorteio ao vivo (DrawPrizeLive)
7. Confirmar que o menu Admin NÃO aparece no drawer para este usuário

- [ ] **Step 10: Commit**

```bash
git add src/pages/DrawerPrizeLiveClient/index.jsx src/pages/DrawerPrizeLiveClient/styles.js
git commit -m "feat: add Patrocinador role with access to live draw management only"
```

---

## Notas sobre atribuição do role

Para atribuir o role "Patrocinador" a um usuário via Admin:
- No futuro, pode ser adicionado na tela `Admin > User Detailed` um seletor de roles
- Por ora, é gerenciado diretamente no Firebase Console: campo `rules` → `["Patrocinador"]`
- Prioridade de acesso: Admin > Patrocinador > Normal (Admin vê tudo; Patrocinador vê só sorteio ao vivo; Normal só participa)

---

## Self-Review

**Spec coverage:**
- ✅ Login especial, role patrocinador → Task 1 completa
- ✅ Acesso ao que user normal tem → Patrocinador usa DrawerPrizeLiveClient como todos
- ✅ Criar sorteio ao vivo somente → botão navega para DrawPrizeLive (admin)
- ✅ Somente o ao vivo → sem acesso ao NavigationAdminMenu completo

**Placeholder scan:** Nenhum placeholder. Código real em todos os steps.

**Type consistency:** `isPatrocinador` calculado em `handleGetInitialData` e salvo em state — acesso via `isPatrocinador` state no render, consistente.
