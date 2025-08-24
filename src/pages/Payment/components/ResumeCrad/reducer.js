import { PaymentWalletActions } from "./actions";

const INITIAL_STATE = {
    dataWallet: undefined,
    isLoadingWallet: false,
};

export const PaymentWalletReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PaymentWalletActions.SAVE_PAYMENT_WALLET:
            return { ...state, dataWallet: action.dataWallet };

        case PaymentWalletActions.DELETE_PAYMENT_WALLET:
            return { ...state, dataWallet: undefined };

        case PaymentWalletActions.LOADING_WALLET_ACTION:
            return { ...state, isLoadingWallet: action.isLoading };

        default:
            return { ...state };
    }
};
