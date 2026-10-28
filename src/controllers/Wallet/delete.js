import * as WalletsRepository from "../../repositories/WalletsRepository";

export const deleteWallet = async (walletId) => {
    return WalletsRepository.deleteWallet(walletId);
};