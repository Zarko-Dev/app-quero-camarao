import { InvitationActions } from "./actions";

const INITIAL_STATE = {
    invitationCode: undefined,
};

export const InvitationReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case InvitationActions.SET_INVITATION_CODE_ACTION:
            return { ...state, invitationCode: action.invitationCode };

        case InvitationActions.DELETE_INVITATION_CODE_ACTION:
            return { ...state, invitationCode: undefined };

        default:
            return { ...state };
    }
};
