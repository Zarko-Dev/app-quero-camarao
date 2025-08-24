import { PublicationActions } from "./actions";

const INITIAL_STATE = {
    dataPayment: {},
};

export const PublicationReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PublicationActions.SET_DATA_PAYMENT_ACTION:
            return { ...state, dataPayment: action.dataPayment };

        case PublicationActions.SET_DATA_PAYMENT_CUPON_CODE_ACTION:
            return {
                ...state,
                dataPayment: {
                    ...state.dataPayment,
                    cuponCode: action.cuponCode,
                    cupomType: action.cupomType,
                    cupomDurationValue: action.cupomDurationValue,
                },
            };

        case PublicationActions.SET_DATA_PAYMENT_CUPON_CODE_COUNT_ACTION:
            return {
                ...state,
                dataPayment: {
                    ...state.dataPayment,
                    cuponCode: action.cuponCode,
                    cupomType: action.cupomType,
                    cupomDurationValue: action.cupomDurationValue,
                    cupomUseCount: action.cupomUseCount,
                },
            };

        case PublicationActions.UPDATE_ALL_DATA_PAYMENT_ACTION:
            return {
                ...state,
                dataPayment: {
                    ...action.dataPayment,
                },
            };

        default:
            return { ...state };
    }
};
