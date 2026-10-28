# Plano de Configuração Nativa — Firebase / React Native Firebase

Projeto: Quero Camarão (mobile-quero-camarao)
Expo SDK: 53.0.27 | React Native: 0.79.6 | Workflow: managed com `expo-dev-client` ~5.2.4
Branch de referência: epic/firebase-mobile-refactor (Tarefa 4 do ORCA Master Orchestrator)

---

## 1) Como adicionar @react-native-firebase/app e módulos num projeto Expo com expo-dev-client

### 1.1 Pré-requisitos

- `expo-dev-client` já está instalado (`~5.2.4` no `package.json` atual). Este é o requisito mínimo para usar pacotes `@react-native-firebase/*` num workflow managed, pois o `expo-dev-client` gera builds de desenvolvimento que incluem o código nativo do React Native e permite que os módulos nativos dos pacotes `@react-native-firebase/*` sejam vinculados.
- O projeto usa `expo prebuild` para gerar os diretórios `ios/` e `android/` a partir do config do `app.json`. Esses diretórios são a ponte entre o managed workflow e os módulos nativos do React Native Firebase.

### 1.2 Instalação dos pacotes (não executar — apenas documentação)

A instalação deve seguir esta ordem para respeitar as dependências nativas:

```bash
# 1. Core — obrigatório primeiro
npx expo install @react-native-firebase/app

# 2. Módulos por funcionalidade (instalar conforme necessidade da migração)
npx expo install @react-native-firebase/auth
npx expo install @react-native-firebase/firestore
npx expo install @react-native-firebase/storage
npx expo install @react-native-firebase/functions
npx expo install @react-native-firebase/messaging   # só se a task 10 decidir usar RN Firebase para FCM
```

**Por que `npx expo install` e não `npm install` / `yarn add`?**
`npx expo install` resolve a versão compatível do pacote com o React Native e Expo SDK em uso, aplicando automaticamente o plugin de configuração do Expo quando necessário. Em projetos managed com `expo-dev-client`, isso garante que o pod `React-Firebase` (iOS) e o `google-services` Gradle plugin (Android) sejam integrados corretamente durante o `prebuild`.

### 1.3 Fluxo de integração com expo-dev-client

Após instalar os pacotes `@react-native-firebase/*`, o fluxo de configuração é:

1. **Rodar `expo prebuild`** para regenerar os diretórios `ios/` e `android/` com as configurações nativas dos novos pacotes. O Expo detecta automaticamente os plugins de configuração dos `@react-native-firebase/*` pacotes e injeta as entradas necessárias no `Podfile` e no `build.gradle`.

   ```bash
   npx expo prebuild --platform ios --clean
   npx expo prebuild --platform android --clean
   ```

   O flag `--clean` remove o diretório existente e regenera do zero, garantindo que as novas configurações nativas sejam aplicadas.

2. **Instalar dependências nativas via CocoaPods (iOS):**

   ```bash
   cd ios && pod install --repo-update
   ```

   Isso vincula os pods `Firebase` e `React-Firebase-*` ao projeto Xcode.

3. **Sincronizar o Gradle (Android):**
   O `expo prebuild` já injeta o `google-services` plugin e as dependências Firebase no `android/build.gradle` e `android/app/build.gradle`. Não é necessário intervenção manual no Gradle se o `prebuild` foi executado corretamente.

4. **Rodar o app:**

   ```bash
   npx expo run:ios
   npx expo run:android
   ```

### 1.4 Alternativa: config plugins personalizados

Se for necessário ter controle mais granular sobre a configuração nativa (por exemplo, forçar versões específicas dos pods Firebase ou configurar `RNFirebaseRequiresStaticFrameworks`), pode-se criar um config plugin customizado em `plugins/` e registrá-lo em `app.json`. Exemplo:

```js
// plugins/withReactNativeFirebase.js
const { withPlugins, withInfoPlist, withGradleProperties } = require('@expo/config-plugins');

const withReactNativeFirebase = (config) => {
  return withPlugins(config, [
    // O expo install já registra os plugins de autolinking;
    // este arquivo é para ajustes manuais caso necessário.
  ]);
};

module.exports = withReactNativeFirebase;
```

E em `app.json`:

```json
"plugins": [
  "./plugins/withReactNativeFirebase.js"
]
```

**Nota:** Para Expo SDK 53 com `expo-dev-client`, os config plugins dos pacotes `@react-native-firebase/*` são auto-registrados via autolinking. Config plugins customizados só são necessários para overrides.

---

## 2) google-services.json e GoogleService-Info.plist

### 2.1 google-services.json (Android) — JÁ EXISTE

O arquivo `google-services.json` já está presente na raiz do projeto (`/Users/pedroroger/Documents/app-quero-camarao/google-services.json`). Ele é referenciado em `app.json` via:

```json
"android": {
  "googleServicesFile": "./google-services.json"
}
```

**O que este arquivo contém:**
- `project_info` — ID do projeto Firebase, números de projeto
- `client` — informações do app Android (package name `com.logicphire.querocamarao`, SHA-1 de debug/release, API keys)
- `client_info` — configuração do SDK
- `ARTIFACT_VERSION` — versão do schema

**Ações necessárias:**
- Verificar se o `google-services.json` está atualizado com o SHA-1 de release (para builds de produção via EAS). Se o EAS build usa um certificado diferente do debug, o SHA-1 de release precisa estar registrado no console Firebase e o arquivo regenerado.
- O arquivo será copiado automaticamente para `android/app/google-services.json` durante o `expo prebuild` graças à configuração em `app.json`.

### 2.2 GoogleService-Info.plist (iOS) — FALTANDO

Este arquivo **não existe** no projeto atualmente. Sem ele, o Firebase no iOS não pode ser inicializado automaticamente.

#### Como gerar no Console Firebase

1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecione o projeto que corresponde ao `google-services.json` (o mesmo projeto Firebase usado para Android)
3. No painel esquerdo, clique em **⚙️ Configurações do projeto** (Project Settings)
4. Na aba **Geral**, na seção **Seus apps**, clique no ícone **iOS** (`</>`) para adicionar um novo app iOS
5. Preencher:
   - **ID do pacote iOS (Bundle ID):** `com.logicphire.querocamarao` (deve corresponder exatamente ao `ios.bundleIdentifier` em `app.json`)
   - **Apelido do app:** `Quero Camarão` (ou o nome que preferir)
   - **App Store ID:** deixar vazio se não houver na App Store ainda
   - **Equipe de desenvolvimento:** selecionar a equipe Apple Developer registrada
6. Clicar **Registrar app**
7. Baixar o arquivo `GoogleService-Info.plist` gerado
8. Colocar o arquivo na raiz do projeto: `/Users/pedroroger/Documents/app-quero-camarao/GoogleService-Info.plist`
9. Adicionar a referência em `app.json`:

   ```json
   "ios": {
     "googleServicesFile": "./GoogleService-Info.plist"
   }
   ```

10. **Re-executar `expo prebuild --platform ios --clean`** para que o arquivo seja copiado para `ios/QueroCamarao/GoogleService-Info.plist` no projeto Xcode gerado.

**Importante:** O `GoogleService-Info.plist` deve ser adicionado ao Xcode target `QueroCamarao`. O `expo prebuild` + `pod install` deve cuidar disso automaticamente, mas é bom verificar no `.pbxproj` que o arquivo está listado no `Resources` build phase.

---

## 3) Mudanças necessárias no Podfile iOS e build.gradle Android

### 3.1 Podfile iOS (`ios/Podfile`)

O Podfile atual (gerado pelo Expo) é compatível com `@react-native-firebase/app`. As seguintes observações e ajustes podem ser necessários:

#### 3.1.1 `use_frameworks!` e `RNFirebaseRequiresStaticFrameworks`

O Podfile atual já tem:

```ruby
use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']
```

**Problema potencial:** `@react-native-firebase/app` exige que o Firebase seja linkado como **framework estático** em certas configurações. O Expo SDK 53 com `newArchEnabled: true` usa frameworks dinâmicos por padrão.

**Ajuste recomendado:** Adicionar a variável de ambiente `RNFirebaseRequiresStaticFrameworks` no `Podfile.properties.json` ou no `Podfile`:

Opção A — No `Podfile.properties.json`:
```json
{
  "expo.jsEngine": "hermes",
  "EX_DEV_CLIENT_NETWORK_INSPECTOR": "true",
  "apple.privacyManifestAggregationEnabled": "true",
  "newArchEnabled": "true",
  "ios.useFrameworks": "static"
}
```

Opção B — No `Podfile`, antes do `use_frameworks!`:
```ruby
# Forçar frameworks estáticos para Firebase compatibilidade
ENV['RNFirebaseRequiresStaticFrameworks'] = 'true' if podfile_properties['ios.useFrameworks'] == 'static'
```

**Recomendação:** Usar a Opção A (`"ios.useFrameworks": "static"` no `Podfile.properties.json`). Isso garante que o `use_frameworks! :linkage => :static` seja aplicado, o que é necessário para `@react-native-firebase/*` funcionar corretamente com o new architecture.

#### 3.1.2 Post-install hooks para Firebase

O `post_install` atual do Podfile já tem patches para `fmt` e code signing. Pode ser necessário adicionar um patch para o Firebase CocoaPods que força a versão do `FirebaseCore` a ser compatível:

```ruby
post_install do |installer|
  # ... hooks existentes ...

  # Patch para Firebase — evitar conflito de versão com React Native 0.79
  installer.pods_project.targets.each do |target|
    if target.name.start_with?('Firebase')
      target.build_configurations.each do |config|
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      end
    end
  end
end
```

**Nota sobre `EXCLUDED_ARCHS` para arm64 no simulador:** Necessário porque o Firebase pod pode não ter binários arm64 para o simulador iOS em certas versões. Com o new arch e React Native 0.79, este conflito é comum.

#### 3.1.3 RNFirebaseRequiresStaticFrameworks no Podfile

Adicionar no topo do `Podfile`, após as `require`:

```ruby
# React Native Firebase exige static frameworks em projetos com use_frameworks!
$RNFirebaseAsStaticFramework = true
```

E no bloco `use_react_native!`, garantir que o `:static_framework` não esteja sendo forçado de forma conflitante.

### 3.2 build.gradle Android (`android/build.gradle` e `android/app/build.gradle`)

Como o diretório `android/` **não existe** no momento (será gerado por `expo prebuild`), as mudanças abaixo descrevem o que o `expo prebuild` deve gerar e o que pode precisar de ajuste manual.

#### 3.2.1 `android/build.gradle` (root)

O `expo prebuild` gera este arqu automaticamente. Deve conter:

```groovy
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion = 23
        compileSdkVersion = 35
        targetSdkVersion = 35
        // ... outras extensões do Expo
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.google.gms:google-services")  // ← CRÍTICO: plugin do Google Services
        classpath("com.google.firebase:firebase-crashlytics-gradle") // ← opcional, se usar Crashlytics
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin") // ← necessário para RN 0.79
    }
}
```

**O que verificar após `expo prebuild`:**
- O `classpath "com.google.gms:google-services"` deve estar presente. Se não estiver, o `google-services.json` não será processado no Android.
- O `classpath "org.jetbrains.kotlin:kotlin-gradle-plugin"` é necessário para React Native 0.79 (que usa Kotlin para a nova arch).

#### 3.2.2 `android/app/build.gradle`

Deve conter no topo (antes de `apply plugin: 'com.android.application'`):

```groovy
apply plugin: 'com.google.gms.google-services'  // ← ativa o plugin do Google Services
```

E nas dependências, os `@react-native-firebase/*` pacotes injetam automaticamente:

```groovy
dependencies {
    // Firebase BoM (Bill of Materials) — gerenciado automaticamente pelo RN Firebase
    implementation platform('com.google.firebase:firebase-bom')
    // Os módulos específicos são adicionados pelo autolinking do RN
}
```

#### 3.2.3 ProGuard / R8 (opcional, para produção)

Se o app usa ProGuard em builds de release, pode ser necessário adicionar regras de keep para Firebase:

```proguard
# firebase.pro
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
```

E referenciá-lo em `android/app/build.gradle`:

```groovy
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro', 'firebase.pro'
    }
}
```

---

## 4) app.json plugins necessários

### 4.1 Plugins atuais (já existentes)

O `app.json` atual já contém os seguintes plugins relevantes:

```json
"plugins": [
  ["./plugins/withCppStandard.js", {}],
  ["expo-splash-screen", { ... }],
  ["./plugins/withDisableForcedDarkModeAndroid.js", {}],
  ["expo-camera", { ... }],
  ["expo-image-picker", { ... }],
  ["expo-tracking-transparency", { ... }],
  ["expo-notifications", { "icon": "./assets/notificationicon.png", "color": "#F05829" }],
  "expo-font",
  ["@sentry/react-native/expo", { ... }],
  ["expo-build-properties", {
    "android": {
      "compileSdkVersion": 35,
      "targetSdkVersion": 35,
      "buildToolsVersion": "35.0.0",
      "newArchEnabled": true
    },
    "ios": {
      "newArchEnabled": true,
      "extraBuildSettings": {
        "CLANG_CXX_LANGUAGE_STANDARD": "c++20"
      }
    }
  }],
  ["./plugins/withAndroidNdk27.js", {}],
  ["expo-document-picker", { "iCloudContainerEnvironment": "Production" }],
  "expo-asset",
  ["expo-location", { ... }],
  "@sentry/react-native",
  ["react-native-share", {}]
]
```

### 4.2 Plugins a adicionar para Firebase

#### 4.2.1 `@react-native-firebase/app` config plugin

A partir de `@react-native-firebase/app` v17+ (compatível com RN 0.79 e Expo SDK 53), o pacote expõe um config plugin que é auto-registrado. **Não é necessário adicionar um plugin explícito em `app.json`** para o `@react-native-firebase/app` básico.

No entanto, se for necessário configurar opções específicas (como `RNFirebaseCrashlyticsCollectionEnabled` ou `RNFirebaseMessagingAutoInitEnabled`), pode-se adicionar:

```json
["@react-native-firebase/app", {
  "crashlyticsCollectionEnabled": false,
  "messagingAutoInitEnabled": true
}]
```

#### 4.2.2 `expo-notifications` e Firebase Cloud Messaging

Se a estratégia escolhida na task 10 for usar `@react-native-firebase/messaging` + `expo-notifications`, o `expo-notifications` plugin já está configurado em `app.json`. Nenhuma mudança adicional é necessária no `app.json` para o `expo-notifications` em si.

Se for usar apenas `@react-native-firebase/messaging` (sem Expo Notifications), pode ser necessário remover `expo-notifications` do `app.json` e adicionar o plugin do Firebase Messaging:

```json
["@react-native-firebase/messaging", {
  "autoInit": true
}]
```

#### 4.2.3 Resumo de plugins a adicionar

| Plugin | Quando adicionar | Motivo |
|--------|-----------------|--------|
| `@react-native-firebase/app` (auto) | Sempre | Core Firebase — auto-registrado |
| `@react-native-firebase/auth` (auto) | Sempre | Auth — auto-registrado |
| `@react-native-firebase/firestore` (auto) | Sempre | Firestore — auto-registrado |
| `@react-native-firebase/storage` (auto) | Sempre | Storage — auto-registrado |
| `@react-native-firebase/functions` (auto) | Sempre | Functions — auto-registrado |
| `@react-native-firebase/messaging` (auto) | Se usar RN Firebase para FCM | Messaging — auto-registrado |
| `@react-native-firebase/analytics` (auto) | Se usar Analytics | Analytics — auto-registrado |

**Nota:** Todos os `@react-native-firebase/*` pacotes v17+ usam autolinking com Expo SDK 53 + `expo-dev-client`. Não é necessário configurar manualmente os plugins de native modules no `app.json` a menos que seja necessário sobrescrever configurações padrão.

### 4.3 Configuração de `app.json` para `googleServicesFile` (iOS)

Adicionar a referência ao `GoogleService-Info.plist` em `app.json`:

```json
"ios": {
  "googleServicesFile": "./GoogleService-Info.plist",
  "buildNumber": "62"
}
```

Isto é **diferente** do que já existe para Android (`"googleServicesFile": "./google-services.json"`). O Expo config plugin para iOS lê esta chave e copia o `.plist` para o projeto Xcode gerado.

---

## 5) Riscos com newArchEnabled

### 5.1 Contexto

O projeto tem `newArchEnabled: true` tanto para Android quanto para iOS (em `app.json` e `Podfile.properties.json`). O New Architecture (Fabric + TurboModules) está ativo e afeta diretamente como os módulos nativos do Firebase são inicializados.

### 5.2 Riscos específicos

#### 5.2.1 iOS — `use_frameworks!` e static vs dynamic

**Risco:** O New Architecture no iOS usa `use_frameworks!` com linkage dinâmico por padrão. `@react-native-firebase/app` e seus módulos podem ter conflitos com frameworks dinâmicos quando o Firebase SDK é compilado como estático.

**Mitigação:**
- Configurar `ios.useFrameworks` como `"static"` no `Podfile.properties.json` (descrito na seção 3.1.1).
- Após alterar, rodar `pod install --repo-update` no diretório `ios/`.
- Testar em build de debug (`npx expo run:ios`) para verificar se não há erros de linking.

#### 5.2.2 Android — `newArchEnabled` e `android:extractNativeLibs`

**Risco:** Com `newArchEnabled: true`, o Android Gradle Plugin gera native libraries para múltiplas arquiteturas (arm64-v8a, armeabi-v7a, x86_64). O Firebase SDK pode ter conflitos de ABI se as versões dos pods não forem compatíveis.

**Mitigação:**
- Garantir que `android:extractNativeLibs="true"` está no `AndroidManifest.xml` gerado pelo `expo prebuild`.
- Verificar que o `ndk` version no `android/build.gradle` é compatível com o Firebase BoM version.

#### 5.2.3 Hermes + New Arch + Firebase

**Risco:** O Hermes engine (usado pelo Expo SDK 53 por padrão) pode ter incompatibilidades com certas versões do `@react-native-firebase/*` se os TurboModules do Firebase não forem compilados corretamente para o Hermes bytecode.

**Mitigação:**
- Usar `@react-native-firebase/app` v17.x ou superior (compatível com Hermes + New Arch + RN 0.79).
- Verificar no `Podfile.properties.json` que `expo.jsEngine` está configurado como `"hermes"` (já está).
- Após `pod install`, verificar no Xcode que os pods Firebase aparecem no target `QueroCamarao` e não há warnings de `Hermes` incompatibility.

#### 5.2.4 `RCT_NEW_ARCH_ENABLED` e Firebase TurboModules

**Risco:** O `Podfile` atual define `ENV['RCT_NEW_ARCH_ENABLED'] = '0' if podfile_properties['newArchEnabled'] == 'false'`. Como `newArchEnabled` é `true`, esta linha **não** desabilita a new arch. Porém, se o `Podfile.properties.json` for alterado para `"newArchEnabled": "false"` (por exemplo, para debugar), o Firebase pode parar de funcionar se os TurboModules não forem compilados.

**Mitigação:**
- Manter `newArchEnabled: true` consistente entre `app.json`, `Podfile.properties.json` e qualquer configuração de build do EAS.
- Se for necessário desabilitar temporariamente para debug, regenerar os projetos nativos com `expo prebuild --clean` e rodar `pod install` novamente.

#### 5.2.5 EAS Build e New Arch

**Risco:** O EAS Build usa imagens de build específicas. A imagem `macos-tahoe-26.4-xcode-26.4` (configurada para produção iOS no `eas.json`) deve suportar o new arch e os pods Firebase. Versões antigas do Xcode ou do macOS podem não suportar as versões mais recentes do Firebase SDK.

**Mitigação:**
- Verificar se a imagem EAS para iOS está atualizada (o `eas.json` já usa `macos-tahoe-26.4-xcode-26.4` que é recente).
- Para Android, o EAS usa a imagem padrão que inclui o Android SDK 35 (compatível com `compileSdkVersion` e `targetSdkVersion` configurados em `app.json`).

### 5.3 Checklist de riscos com newArchEnabled

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| `use_frameworks!` dinâmico conflita com Firebase estático | HIGH | Configurar `ios.useFrameworks: "static"` em `Podfile.properties.json` |
| Hermes incompatibility com TurboModules do Firebase | MEDIUM | Usar `@react-native-firebase/app` v17+ |
| ABI conflicts no Android com new arch | MEDIUM | Verificar `extractNativeLibs` no manifest |
| `RCT_NEW_ARCH_ENABLED` inconsistente entre configs | LOW | Manter consistência em `app.json`, `Podfile.properties.json`, `eas.json` |
| EAS build image incompatível com Firebase SDK | LOW | Usar imagens recentes (já configurado) |
| `pod install` falha após `expo prebuild` com new arch | MEDIUM | Sempre rodar `pod install --repo-update` após prebuild |

---

## Resumo de ações por plataforma

### iOS

1. Gerar `GoogleService-Info.plist` no console Firebase e colocar na raiz do projeto
2. Adicionar `"googleServicesFile": "./GoogleService-Info.plist"` em `app.json` → `"ios"`
3. Alterar `Podfile.properties.json`: adicionar `"ios.useFrameworks": "static"`
4. Após instalar `@react-native-firebase/*`, rodar `expo prebuild --platform ios --clean`
5. Rodar `pod install --repo-update` no diretório `ios/`
6. Verificar no Xcode que `GoogleService-Info.plist` está no target e nos Resources
7. Verificar que os pods Firebase aparecem no `Podfile.lock`

### Android

1. Verificar que `google-services.json` está atualizado com SHA-1 de release
2. Após instalar `@react-native-firebase/*`, rodar `expo prebuild --platform android --clean`
3. Verificar que `android/build.gradle` contém `classpath "com.google.gms:google-services"`
4. Verificar que `android/app/build.gradle` contém `apply plugin: 'com.google.gms.google-services'`
5. Verificar que `android/app/src/main/AndroidManifest.xml` tem `google-services` config
6. Testar build com `npx expo run:android`

### Ambos

1. Instalar `@react-native-firebase/app` primeiro (core)
2. Instalar módulos específicos (`auth`, `firestore`, `storage`, `functions`) conforme necessidade
3. Usar `npx expo install` (não `npm install` ou `yarn add`) para garantir compatibilidade
4. Executar testes de inicialização Firebase após cada instalação de módulo
5. Regenerar projetos nativos com `expo prebuild --clean` após qualquer mudança em `app.json` ou `package.json`

---

## Notas sobre a task 4 do ORCA Master Orchestrator

Esta documentação é o **plano de configuração nativa** para a Task 4. Ela NÃO executa instalação de pacotes nem commits — apenas detalha os passos necessários para preparar o ambiente nativo Android/iOS para receber os módulos `@react-native-firebase/*`.

A execução real das instalações e configurações deve ocorrer na worktree/branch isolada do worker `FIREBASE-PLATFORM` durante a task 4, seguindo o contrato de saída definido no ORCA Master Orchestrator.
