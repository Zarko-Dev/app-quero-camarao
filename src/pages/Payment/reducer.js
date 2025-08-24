import { paymentActions } from "./actions";

const INITIAL_STATE = {
    dataOrder: undefined,
};

export const PaymentReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case paymentActions.SAVE_ORDER_ACTION:
            return { ...state, dataOrder: action.dataOrder };

        default:
            return { ...state };
    }
};
