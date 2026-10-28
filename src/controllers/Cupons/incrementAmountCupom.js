import * as CuponsRepository from "../../repositories/CuponsRepository";

export const incrementAmountCupom = async (cuponCode) =>
    CuponsRepository.incrementAmountCupom(cuponCode);
