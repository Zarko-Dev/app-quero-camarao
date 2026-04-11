# 🦐 Quero Camarão

O "Quero Camarão" é um aplicativo móvel (iOS e Android) que funciona como uma plataforma de gerenciamento e venda de camarões, conectando produtores a compradores.

O objetivo principal é facilitar o processo de venda de camarões diretamente dos viveiros. Ele permite que os produtores publiquem seus viveiros disponíveis, registrem as transações e acompanhem o status de suas publicações. Além disso, o aplicativo possui um componente de análise de mercado, calculando e exibindo um preço médio de referência para o camarão.

## ✨ Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- **[React Native](https://reactnative.dev/)**
- **[Expo](https://expo.dev/)**
- **[Styled Components](https://styled-components.com/)**
- **[Firebase](https://firebase.google.com/)**

## 📋 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/) ou [NPM](https://www.npmjs.com/)
- **Expo CLI**: `npm install -g expo-cli`

Além disto, é bom ter um editor para trabalhar com o código, como o VSCode.

## 🚀 Configuração e Instalação

Siga os passos abaixo para configurar o ambiente de desenvolvimento.

1.  **Clone o repositório**

    ```bash
    git clone https://[URL_DO_SEU_REPOSITORIO]/mobile-quero-camarao.git
    ```

2.  **Acesse a pasta do projeto**

    ```bash
    cd mobile-quero-camarao
    ```

3.  **Instale as dependências**

    O projeto utiliza `yarn` como gerenciador de pacotes.

    ```bash
    yarn install
    ```

4.  **Configure as variáveis de ambiente**

    O projeto utiliza variáveis de ambiente para se conectar a serviços externos como Firebase e Mercado Pago.

    - Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`:

        ```bash
        cp .env.example .env
        ```

    - Abra o arquivo `.env` e preencha com as suas credenciais. Você pode encontrar essas chaves no painel de controle dos respectivos serviços.

## ▶️ Executando o Projeto

Após a instalação das dependências e configuração do `.env`, siga os passos abaixo:

1.  **Configure os projetos nativos (Android/iOS)**
    Execute o comando abaixo para gerar as pastas `android` e `ios` com as configurações do projeto.

    ```bash
    yarn configure:all
    ```

2.  **Inicie o Emulador ou Conecte um Dispositivo**
    Abra um emulador Android (via Android Studio) ou um simulador de iOS (via Xcode). Você também pode conectar um dispositivo físico via USB.

3.  **Inicie o aplicativo**
    Para iniciar o projeto em um dispositivo/emulador Android:

    ```bash
    yarn start:android
    ```

    Para iniciar o projeto em um dispositivo/simulador iOS:

    ```bash
    yarn start:ios
    ```

4.  **Aguarde o Build**
    Na primeira vez que executar, o processo de build pode levar alguns minutos. Aguarde a instalação do aplicativo no dispositivo/emulador.




    Para buildar para IOS é:
    eas build --platform ios --profile production
    eas submit --platform ios

    ou de uma vez toda:
    eas build --platform ios --profile production --auto-submit