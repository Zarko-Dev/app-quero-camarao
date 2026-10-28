import * as WalletsRepository from "../../repositories/WalletsRepository";

export const createUserWallet = async (userId, dataWallet) => {
    return WalletsRepository.createUserWallet(userId, dataWallet);
};