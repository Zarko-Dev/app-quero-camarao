/* eslint-disable indent */
import { dataRoutes } from "../../../routes/dataRoutes";
import { redirectWhatsappLink } from "../../../utils/redirectFunctions";

export const handleRedirectPage = async (usersWinner, navigation) => {
    const whatsappMessage = `*Quero Camarão* 🦐

🥳 *${usersWinner.length > 1 ? "Vencedores" : "Vencedor"} do Sorteio* 🎉

${usersWinner.map(
    (winner, index) => `
🎊 *${index + 1}º Vencedor(a)*

*Nome*: ${winner.name}
*CPF*: ***.***.${winner.cpf.slice(-5)}
*Contato*: ${winner.phone}
*Localidade*: ${winner.userType === "productor" ? `${winner.address.city}/${winner.address.state}` : `${winner.city}/${winner.state}`}

`,
)}`;

    navigation.navigate(dataRoutes.redirect, {
        subtext: "Estamos lhe redirecionado ao whatsapp, aguarde...",
        actionRediret: redirectWhatsappLink("", whatsappMessage, navigation),
    });
};
