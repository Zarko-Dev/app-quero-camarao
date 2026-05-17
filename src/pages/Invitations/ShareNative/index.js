/* eslint-disable no-unused-vars */
import Share from "react-native-share";

export const ShareNativeAction = async (invitationCode, value, links) => {
    await Share.open({
        title: "Convite para indicação",
        message: `Olá! Venho através da Quero Camarão 🦐

Use meu convite para ganhar um desconto especial de *R$${value},00* em sua primeira publicação de camarão. ?????

Convite:
http://querocamarao.logicphire.com.br?convite=${invitationCode}

Se ainda não baixou o Quero Camarão, aproveite agora mesmo! ????

Android/IOS: https://onelink.to/n26bv8?sec=AplicativoQueroCamarão/Android/iOS
`,
    });
};
