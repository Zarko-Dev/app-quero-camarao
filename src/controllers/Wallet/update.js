import * as WalletsRepository from "../../repositories/WalletsRepository";

export const updateWallet = async (walletId, dataWallet) => {
    return WalletsRepository.updateWallet(walletId, dataWallet);
};

export const decreaseWallet = async (walletId, currentValue, decreaseValue) => {
    return WalletsRepository.decreaseWallet(walletId, currentValue, decreaseValue);
};