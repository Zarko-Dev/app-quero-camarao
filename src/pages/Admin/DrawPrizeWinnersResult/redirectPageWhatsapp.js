/* eslint-disable indent */
import { dataRoutes } from "../../../routes/dataRoutes";
import { redirectWhatsappLink } from "../../../utils/redirectFunctions";

export const handleRedirectPage = async (usersWinner, navigation) => {
    const grouped = usersWinner.reduce((acc, winner) => {
        const key = winner.drawName ?? "Sorteio";
        if (!acc[key]) acc[key] = [];
        acc[key].push(winner);
        return acc;
    }, {});

    const whatsappMessage = `*Quero Camarão* 🦐

🥳 *${usersWinner.length > 1 ? "Vencedores" : "Vencedor"} do Sorteio* 🎉

${Object.entries(grouped).map(([drawName, winners]) => `
🏆 *${drawName}*

${winners.map((winner, index) => `
🎊 *${index + 1}º Vencedor(a)*
*Nome*: ${winner?.name ?? "Não informado"}
*Telefone*: ${winner?.phone ?? "Não informado"}
*CPF*: ${winner?.cpf ? `***.***.${winner.cpf.slice(-5)}` : "Não informado"}
*Cidade*: ${winner.userType === "productor"
    ? `${winner?.address?.city ?? "Não informado"}/${winner?.address?.state ?? "Não informado"}`
    : `${winner?.city ?? "Não informado"}/${winner?.state ?? "Não informado"}`}
`).join("")}
`).join("")}`;

    navigation.navigate(dataRoutes.redirect, {
        subtext: "Estamos lhe redirecionado ao whatsapp, aguarde...",
        actionRediret: redirectWhatsappLink("", whatsappMessage, navigation),
    });
};