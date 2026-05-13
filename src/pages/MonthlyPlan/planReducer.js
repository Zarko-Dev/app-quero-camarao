import { planActions } from "./planActions";

const initialState = { activated: false, pendingOrderId: null };

export const planReducer = (state = initialState, action) => {
    switch (action.type) {
        case planActions.PLAN_ORDER_PENDING:
            return { ...state, pendingOrderId: action.orderId };
        case planActions.PLAN_ACTIVATED:
            return { activated: true, pendingOrderId: null };
        case planActions.PLAN_ORDER_CLEAR:
            return { ...state, pendingOrderId: null };
        case planActions.PLAN_EXPIRED:
            return { activated: false, pendingOrderId: null };
        default:
            return state;
    }
};
