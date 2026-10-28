import * as CuponsRepository from "../../repositories/CuponsRepository";

export const decreaseAmountCupom = async (cuponCode) =>
    CuponsRepository.decreaseAmountCupom(cuponCode);
