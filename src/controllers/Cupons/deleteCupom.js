import * as CuponsRepository from "../../repositories/CuponsRepository";
import { isAdmin } from "./isAdmin";

export const deleteCupom = async (cuponCode, email) => {
    const admin = await isAdmin(email);

    if (!admin) {
        return false;
    }

    return CuponsRepository.deleteCupom(cuponCode);
};
