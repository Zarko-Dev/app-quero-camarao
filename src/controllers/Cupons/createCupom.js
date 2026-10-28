import * as CuponsRepository from "../../repositories/CuponsRepository";
import { isAdmin } from "./isAdmin";
import { normalizeCouponQuantity } from "./quantity";

// Retorna true em sucesso; lança Error com o motivo em falha (a tela exibe o motivo).
export const CreateCupom = async (dataCupom, email) => {
    if (!email) {
        throw new Error("Sessão sem e-mail. Saia e entre de novo.");
    }

    const admin = await isAdmin(email);

    if (!admin) {
        throw new Error(`Usuário ${email} não é Admin.`);
    }

    const payload = normalizeCouponQuantity(dataCupom);

    if (!payload) {
        throw new Error("Quantidade do cupom inválida.");
    }

    const ok = await CuponsRepository.CreateCupom(payload);

    if (!ok) {
        throw new Error("Firestore recusou (ver permissões).");
    }

    return true;
};
