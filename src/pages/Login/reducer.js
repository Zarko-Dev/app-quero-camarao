import { LoginActions } from "./actions";

const INITIAL_STATE = {
    isAuthenticated: false,
    refresh: true,
};

export const LoginReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case LoginActions.ISAUTHENTICATED_ACTION:
            return { ...state, isAuthenticated: true };

        case LoginActions.NOT_AUTEHNTICATED_ACTION:
            return { ...state, isAuthenticated: false };

        case LoginActions.REFRESH_DATA_ACTION:
            return { ...state, refresh: !state.refresh };

        default:
            return { ...state };
    }
};
